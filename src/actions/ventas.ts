"use server";

import { prisma } from "@/lib/prisma";
import { getSessionData } from "@/lib/auth-utils";
import { z } from "zod";
import { Prisma } from "@prisma/client";

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const ventaDetalleSchema = z.object({
  productoId: z.string().uuid(),
  cantidad: z.number().int().positive("Cantidad debe ser mayor a 0"),
  precioUnitario: z.number().positive("Precio unitario debe ser mayor a 0"),
});

const registrarVentaSchema = z.object({
  tipoComprobante: z.enum(["BOLETA", "FACTURA"]),
  clienteId: z.string().uuid().optional().nullable(),
  documentoCliente: z.string().optional().nullable(),
  nombreCliente: z.string().optional().nullable(),
  tipoDocumentoCliente: z.enum(["DNI", "RUC", "CE", "PASAPORTE"]).optional().nullable(),
  detalles: z.array(ventaDetalleSchema).min(1, "Debe incluir al menos un detalle"),
  metodoPago: z.enum(["EFECTIVO", "TARJETA", "YAPE", "PLIN", "TRANSFERENCIA"]),
  descuento: z.number().min(0).optional().default(0),
  observaciones: z.string().optional().nullable(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function serializeVenta<T extends Record<string, unknown>>(venta: T): T {
  const result = { ...venta };
  const decimalFields = ["subtotal", "igv", "descuento", "total"] as const;
  for (const field of decimalFields) {
    if (field in result && result[field] != null) {
      (result as Record<string, unknown>)[field] = Number(result[field]);
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function getVentas(options?: {
  page?: number;
  pageSize?: number;
  search?: string;
  desde?: string;
  hasta?: string;
}) {
  const { empresaId } = await getSessionData();

  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 50;
  const skip = (page - 1) * pageSize;

  const where: Prisma.VentaWhereInput = {
    empresaId,
    deletedAt: null,
  };

  if (options?.search) {
    const term = options.search.trim();
    where.OR = [
      { serie: { contains: term, mode: "insensitive" } },
      { cliente: { nombre: { contains: term, mode: "insensitive" } } },
      { cliente: { numeroDocumento: { contains: term, mode: "insensitive" } } },
    ];
  }

  if (options?.desde || options?.hasta) {
    where.fechaEmision = {};
    if (options?.desde) {
      (where.fechaEmision as Prisma.DateTimeFilter).gte = new Date(options.desde);
    }
    if (options?.hasta) {
      (where.fechaEmision as Prisma.DateTimeFilter).lte = new Date(
        options.hasta + "T23:59:59.999Z"
      );
    }
  }

  const [ventas, total] = await Promise.all([
    prisma.venta.findMany({
      where,
      include: {
        cliente: {
          select: {
            id: true,
            nombre: true,
            tipoDocumento: true,
            numeroDocumento: true,
          },
        },
        usuario: {
          select: { id: true, nombre: true },
        },
        detalles: {
          include: {
            producto: {
              select: { id: true, nombre: true, codigo: true },
            },
          },
        },
      },
      orderBy: { fechaEmision: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.venta.count({ where }),
  ]);

  const serialized = ventas.map((v) => ({
    ...v,
    subtotal: Number(v.subtotal),
    igv: Number(v.igv),
    descuento: Number(v.descuento),
    total: Number(v.total),
    detalles: v.detalles.map((d) => ({
      ...d,
      precioUnitario: Number(d.precioUnitario),
      total: Number(d.total),
    })),
  }));

  return { ventas: serialized, total, page, pageSize };
}

// ---------------------------------------------------------------------------
// Registrar Venta
// ---------------------------------------------------------------------------

export async function registrarVenta(
  input: z.infer<typeof registrarVentaSchema>
) {
  const { empresaId, sucursalId, userId } = await getSessionData();
  const data = registrarVentaSchema.parse(input);

  const result = await prisma.$transaction(async (tx) => {
    // 1. Resolve or create client -------------------------------------------------
    let clienteId = data.clienteId ?? null;

    if (
      !clienteId &&
      data.documentoCliente &&
      data.nombreCliente &&
      data.tipoDocumentoCliente
    ) {
      // Try to find existing client by document
      const existingClient = await tx.cliente.findFirst({
        where: {
          empresaId,
          tipoDocumento: data.tipoDocumentoCliente,
          numeroDocumento: data.documentoCliente,
          deletedAt: null,
        },
      });

      if (existingClient) {
        clienteId = existingClient.id;
      } else {
        const newClient = await tx.cliente.create({
          data: {
            empresaId,
            nombre: data.nombreCliente,
            tipoDocumento: data.tipoDocumentoCliente,
            numeroDocumento: data.documentoCliente,
          },
        });
        clienteId = newClient.id;
      }
    }

    // 2. Get next correlativo from SerieSunat -----------------------------------
    const seriePrefix = data.tipoComprobante === "BOLETA" ? "B001" : "F001";

    let serieSunat = await tx.serieSunat.findFirst({
      where: {
        sucursalId,
        tipoComprobante: data.tipoComprobante,
        serie: seriePrefix,
      },
    });

    if (!serieSunat) {
      serieSunat = await tx.serieSunat.create({
        data: {
          sucursalId,
          tipoComprobante: data.tipoComprobante,
          serie: seriePrefix,
          correlativo: 1,
        },
      });
    }

    const correlativo = serieSunat.correlativo;

    // Increment the correlativo for the next sale
    await tx.serieSunat.update({
      where: { id: serieSunat.id },
      data: { correlativo: { increment: 1 } },
    });

    // 3. Calculate line totals and validate stock --------------------------------
    const detallesConTotales: Array<{
      productoId: string;
      cantidad: number;
      precioUnitario: Prisma.Decimal;
      total: Prisma.Decimal;
    }> = [];

    let subtotalCalc = new Prisma.Decimal(0);

    for (const detalle of data.detalles) {
      // Validate the product belongs to this empresa
      const producto = await tx.producto.findFirst({
        where: {
          id: detalle.productoId,
          empresaId,
          deletedAt: null,
        },
      });

      if (!producto) {
        throw new Error(`Producto ${detalle.productoId} no encontrado`);
      }

      // Check stock
      const inventario = await tx.inventarioSucursal.findUnique({
        where: {
          sucursalId_productoId: {
            sucursalId,
            productoId: detalle.productoId,
          },
        },
      });

      if (!inventario || inventario.stockActual < detalle.cantidad) {
        throw new Error(
          `Stock insuficiente para "${producto.nombre}". Disponible: ${inventario?.stockActual ?? 0}, Solicitado: ${detalle.cantidad}`
        );
      }

      const lineTotal = new Prisma.Decimal(detalle.precioUnitario).mul(
        detalle.cantidad
      );
      subtotalCalc = subtotalCalc.add(lineTotal);

      detallesConTotales.push({
        productoId: detalle.productoId,
        cantidad: detalle.cantidad,
        precioUnitario: new Prisma.Decimal(detalle.precioUnitario),
        total: lineTotal,
      });
    }

    // 4. Calculate IGV (18% Peru) ------------------------------------------------
    const descuentoDecimal = new Prisma.Decimal(data.descuento);
    const baseImponible = subtotalCalc.sub(descuentoDecimal);
    // subtotal = baseImponible / 1.18 (IGV is included in the price in Peru retail)
    const subtotalSinIGV = baseImponible.div(new Prisma.Decimal("1.18"));
    const igv = baseImponible.sub(subtotalSinIGV);
    const total = baseImponible;

    // 5. Create Venta ------------------------------------------------------------
    const venta = await tx.venta.create({
      data: {
        empresaId,
        sucursalId,
        usuarioId: userId,
        clienteId,
        tipoComprobante: data.tipoComprobante,
        serie: seriePrefix,
        correlativo,
        subtotal: subtotalSinIGV.toDecimalPlaces(2),
        igv: igv.toDecimalPlaces(2),
        descuento: descuentoDecimal,
        total: total.toDecimalPlaces(2),
        metodoPago: data.metodoPago,
        estadoSunat: "BORRADOR",
        detalles: {
          create: detallesConTotales.map((d) => ({
            productoId: d.productoId,
            cantidad: d.cantidad,
            precioUnitario: d.precioUnitario,
            total: d.total,
          })),
        },
      },
      include: {
        detalles: {
          include: {
            producto: { select: { id: true, nombre: true, codigo: true } },
          },
        },
        cliente: {
          select: {
            id: true,
            nombre: true,
            tipoDocumento: true,
            numeroDocumento: true,
          },
        },
      },
    });

    // 6. Decrement stock and create Kardex entries --------------------------------
    for (const detalle of detallesConTotales) {
      const updated = await tx.inventarioSucursal.update({
        where: {
          sucursalId_productoId: {
            sucursalId,
            productoId: detalle.productoId,
          },
        },
        data: {
          stockActual: { decrement: detalle.cantidad },
        },
      });

      await tx.kardex.create({
        data: {
          empresaId,
          sucursalId,
          productoId: detalle.productoId,
          tipoMovimiento: "EGRESO",
          origen: "VENTA",
          cantidad: detalle.cantidad,
          stockSaldo: updated.stockActual,
          costoUnitario: detalle.precioUnitario,
          referenciaId: venta.id,
          detalle: `Venta ${seriePrefix}-${correlativo}`,
        },
      });
    }

    return venta;
  });

  return {
    ...result,
    subtotal: Number(result.subtotal),
    igv: Number(result.igv),
    descuento: Number(result.descuento),
    total: Number(result.total),
    detalles: result.detalles.map((d) => ({
      ...d,
      precioUnitario: Number(d.precioUnitario),
      total: Number(d.total),
    })),
  };
}

// ---------------------------------------------------------------------------
// Anular Venta
// ---------------------------------------------------------------------------

export async function anularVenta(ventaId: string) {
  const { empresaId, sucursalId, userId } = await getSessionData();

  const result = await prisma.$transaction(async (tx) => {
    // Validate ownership
    const venta = await tx.venta.findFirst({
      where: { id: ventaId, empresaId, deletedAt: null },
      include: { detalles: true },
    });

    if (!venta) {
      throw new Error("Venta no encontrada");
    }

    if (venta.estadoSunat === "ANULADO") {
      throw new Error("Esta venta ya fue anulada");
    }

    // Restore stock for each detail
    for (const detalle of venta.detalles) {
      const updated = await tx.inventarioSucursal.update({
        where: {
          sucursalId_productoId: {
            sucursalId: venta.sucursalId,
            productoId: detalle.productoId,
          },
        },
        data: {
          stockActual: { increment: detalle.cantidad },
        },
      });

      await tx.kardex.create({
        data: {
          empresaId,
          sucursalId: venta.sucursalId,
          productoId: detalle.productoId,
          tipoMovimiento: "INGRESO",
          origen: "VENTA",
          cantidad: detalle.cantidad,
          stockSaldo: updated.stockActual,
          costoUnitario: detalle.precioUnitario,
          referenciaId: venta.id,
          detalle: `Anulación venta ${venta.serie}-${venta.correlativo}`,
        },
      });
    }

    // Mark venta as anulada
    const ventaAnulada = await tx.venta.update({
      where: { id: ventaId },
      data: { estadoSunat: "ANULADO" },
    });

    return ventaAnulada;
  });

  return {
    ...result,
    subtotal: Number(result.subtotal),
    igv: Number(result.igv),
    descuento: Number(result.descuento),
    total: Number(result.total),
  };
}
