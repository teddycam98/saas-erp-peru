"use server";

import { prisma } from "@/lib/prisma";
import { getSessionData } from "@/lib/auth-utils";
import { z } from "zod";
import { Prisma } from "@prisma/client";

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const crearProductoSchema = z.object({
  nombre: z.string().min(1, "Nombre es obligatorio"),
  precioVenta: z.number().positive("Precio de venta debe ser mayor a 0"),
  precioCompra: z.number().min(0).optional().default(0),
  codigo: z.string().optional(),
  codigoBarras: z.string().optional(),
  descripcion: z.string().optional(),
  stockMinimo: z.number().int().min(0).optional().default(0),
  categoriaId: z.string().uuid().optional().nullable(),
  marcaId: z.string().uuid().optional().nullable(),
  afectoIGV: z.boolean().optional().default(true),
  imageUrl: z.string().optional().nullable(),
  stockInicial: z.number().int().min(0).optional().default(0),
});

const actualizarProductoSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string().min(1, "Nombre es obligatorio").optional(),
  precioVenta: z.number().positive("Precio de venta debe ser mayor a 0").optional(),
  precioCompra: z.number().min(0).optional(),
  codigo: z.string().optional().nullable(),
  codigoBarras: z.string().optional().nullable(),
  descripcion: z.string().optional().nullable(),
  stockMinimo: z.number().int().min(0).optional(),
  categoriaId: z.string().uuid().optional().nullable(),
  marcaId: z.string().uuid().optional().nullable(),
  afectoIGV: z.boolean().optional(),
  imageUrl: z.string().optional().nullable(),
  stockActual: z.number().int().min(0).optional(),
});

const crearCategoriaSchema = z.object({
  nombre: z.string().min(1, "Nombre es obligatorio"),
});
const actualizarCategoriaSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string().min(1, "Nombre es obligatorio"),
});

const crearMarcaSchema = z.object({
  nombre: z.string().min(1, "Nombre es obligatorio"),
});
const actualizarMarcaSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string().min(1, "Nombre es obligatorio"),
});

// ---------------------------------------------------------------------------
// Helpers — Decimal → number
// ---------------------------------------------------------------------------

function decimalToNumber(val: Prisma.Decimal | null | undefined): number | null {
  if (val == null) return null;
  return Number(val);
}

// ---------------------------------------------------------------------------
// Productos
// ---------------------------------------------------------------------------

export async function getProductos(search?: string) {
  const { empresaId, sucursalId } = await getSessionData();

  const where: Prisma.ProductoWhereInput = {
    empresaId,
    deletedAt: null,
  };

  if (search && search.trim().length > 0) {
    const term = search.trim();
    where.OR = [
      { nombre: { contains: term, mode: "insensitive" } },
      { codigo: { contains: term, mode: "insensitive" } },
      { codigoBarras: { contains: term, mode: "insensitive" } },
    ];
  }

  const productos = await prisma.producto.findMany({
    where,
    include: {
      categoria: { select: { id: true, nombre: true } },
      marca: { select: { id: true, nombre: true } },
      inventarios: {
        where: { sucursalId },
        select: { id: true, stockActual: true, ubicacionPasillo: true },
      },
    },
    orderBy: { nombre: "asc" },
  });

  return productos.map((p) => ({
    ...p,
    precioCompra: Number(p.precioCompra),
    precioVenta: Number(p.precioVenta),
    inventarios: p.inventarios,
  }));
}

export async function crearProducto(input: z.infer<typeof crearProductoSchema>) {
  const { empresaId, sucursalId, userId } = await getSessionData();
  const data = crearProductoSchema.parse(input);

  const result = await prisma.$transaction(async (tx) => {
    const producto = await tx.producto.create({
      data: {
        empresaId,
        nombre: data.nombre,
        precioVenta: new Prisma.Decimal(data.precioVenta),
        precioCompra: new Prisma.Decimal(data.precioCompra),
        codigo: data.codigo ?? null,
        codigoBarras: data.codigoBarras ?? null,
        descripcion: data.descripcion ?? null,
        stockMinimo: data.stockMinimo,
        categoriaId: data.categoriaId ?? null,
        marcaId: data.marcaId ?? null,
        afectoIGV: data.afectoIGV,
        imageUrl: data.imageUrl ?? null,
      },
    });

    // Create inventory entry for the current sucursal
    await tx.inventarioSucursal.create({
      data: {
        sucursalId,
        productoId: producto.id,
        stockActual: data.stockInicial,
      },
    });

    // If there is initial stock, create a Kardex entry
    if (data.stockInicial > 0) {
      await tx.kardex.create({
        data: {
          empresaId,
          sucursalId,
          productoId: producto.id,
          tipoMovimiento: "INGRESO",
          origen: "AJUSTE",
          cantidad: data.stockInicial,
          stockSaldo: data.stockInicial,
          costoUnitario: new Prisma.Decimal(data.precioCompra),
          detalle: "Stock inicial al crear producto",
        },
      });
    }

    return producto;
  });

  return {
    ...result,
    precioCompra: Number(result.precioCompra),
    precioVenta: Number(result.precioVenta),
  };
}

export async function actualizarProducto(input: z.infer<typeof actualizarProductoSchema>) {
  const { empresaId, sucursalId, userId } = await getSessionData();
  const data = actualizarProductoSchema.parse(input);

  // Verify ownership
  const existing = await prisma.producto.findFirst({
    where: { id: data.id, empresaId, deletedAt: null },
  });

  if (!existing) {
    throw new Error("Producto no encontrado");
  }

  const result = await prisma.$transaction(async (tx) => {
    // Build update payload — only include provided fields
    const updateData: Prisma.ProductoUpdateInput = {};
    if (data.nombre !== undefined) updateData.nombre = data.nombre;
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
    if (data.codigo !== undefined) updateData.codigo = data.codigo;
    if (data.codigoBarras !== undefined) updateData.codigoBarras = data.codigoBarras;
    if (data.stockMinimo !== undefined) updateData.stockMinimo = data.stockMinimo;
    if (data.afectoIGV !== undefined) updateData.afectoIGV = data.afectoIGV;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;

    if (data.categoriaId !== undefined) {
      updateData.categoria = data.categoriaId
        ? { connect: { id: data.categoriaId } }
        : { disconnect: true };
    }
    if (data.marcaId !== undefined) {
      updateData.marca = data.marcaId
        ? { connect: { id: data.marcaId } }
        : { disconnect: true };
    }

    // Price changes — record history
    if (data.precioVenta !== undefined && Number(existing.precioVenta) !== data.precioVenta) {
      updateData.precioVenta = new Prisma.Decimal(data.precioVenta);
      await tx.historialPrecioProducto.create({
        data: {
          productoId: existing.id,
          usuarioId: userId,
          precioAnterior: existing.precioVenta,
          precioNuevo: new Prisma.Decimal(data.precioVenta),
        },
      });
    }
    if (data.precioCompra !== undefined) {
      updateData.precioCompra = new Prisma.Decimal(data.precioCompra);
    }

    const producto = await tx.producto.update({
      where: { id: data.id },
      data: updateData,
    });

    // Update inventory stock if provided
    if (data.stockActual !== undefined) {
      const inv = await tx.inventarioSucursal.findUnique({
        where: { sucursalId_productoId: { sucursalId, productoId: data.id } },
      });

      if (inv) {
        const diff = data.stockActual - inv.stockActual;
        await tx.inventarioSucursal.update({
          where: { id: inv.id },
          data: { stockActual: data.stockActual },
        });

        if (diff !== 0) {
          await tx.kardex.create({
            data: {
              empresaId,
              sucursalId,
              productoId: data.id,
              tipoMovimiento: diff > 0 ? "INGRESO" : "EGRESO",
              origen: "AJUSTE",
              cantidad: Math.abs(diff),
              stockSaldo: data.stockActual,
              costoUnitario: producto.precioCompra,
              detalle: "Ajuste manual de stock",
            },
          });
        }
      } else {
        // Create inventory entry if it doesn't exist
        await tx.inventarioSucursal.create({
          data: {
            sucursalId,
            productoId: data.id,
            stockActual: data.stockActual,
          },
        });

        if (data.stockActual > 0) {
          await tx.kardex.create({
            data: {
              empresaId,
              sucursalId,
              productoId: data.id,
              tipoMovimiento: "INGRESO",
              origen: "AJUSTE",
              cantidad: data.stockActual,
              stockSaldo: data.stockActual,
              costoUnitario: producto.precioCompra,
              detalle: "Creación de inventario por ajuste",
            },
          });
        }
      }
    }

    return producto;
  });

  return {
    ...result,
    precioCompra: Number(result.precioCompra),
    precioVenta: Number(result.precioVenta),
  };
}

export async function eliminarProducto(id: string) {
  const { empresaId } = await getSessionData();

  const producto = await prisma.producto.findFirst({
    where: { id, empresaId, deletedAt: null },
  });

  if (!producto) {
    throw new Error("Producto no encontrado");
  }

  // Soft delete
  await prisma.producto.update({
    where: { id },
    data: { deletedAt: new Date(), estado: false },
  });

  return { success: true };
}

// ---------------------------------------------------------------------------
// Categorías
// ---------------------------------------------------------------------------

export async function getCategorias() {
  const { empresaId } = await getSessionData();

  return prisma.categoria.findMany({
    where: { empresaId, deletedAt: null },
    orderBy: { nombre: "asc" },
  });
}

export async function crearCategoria(input: z.infer<typeof crearCategoriaSchema>) {
  const { empresaId } = await getSessionData();
  const data = crearCategoriaSchema.parse(input);

  return prisma.categoria.create({
    data: {
      empresaId,
      nombre: data.nombre,
    },
  });
}

// ---------------------------------------------------------------------------
// Marcas
// ---------------------------------------------------------------------------

export async function getMarcas() {
  const { empresaId } = await getSessionData();

  return prisma.marca.findMany({
    where: { empresaId, deletedAt: null },
    orderBy: { nombre: "asc" },
  });
}

export async function crearMarca(input: z.infer<typeof crearMarcaSchema>) {
  const { empresaId } = await getSessionData();
  const data = crearMarcaSchema.parse(input);

  return prisma.marca.create({
    data: {
      empresaId,
      nombre: data.nombre,
    },
  });
}

export async function actualizarCategoria(input: z.infer<typeof actualizarCategoriaSchema>) {
  const { empresaId } = await getSessionData();
  const data = actualizarCategoriaSchema.parse(input);
  return prisma.categoria.update({
    where: { id: data.id, empresaId },
    data: { nombre: data.nombre },
  });
}

export async function eliminarCategoria(id: string) {
  const { empresaId } = await getSessionData();
  return prisma.categoria.update({
    where: { id, empresaId },
    data: { deletedAt: new Date() },
  });
}

export async function actualizarMarca(input: z.infer<typeof actualizarMarcaSchema>) {
  const { empresaId } = await getSessionData();
  const data = actualizarMarcaSchema.parse(input);
  return prisma.marca.update({
    where: { id: data.id, empresaId },
    data: { nombre: data.nombre },
  });
}

export async function eliminarMarca(id: string) {
  const { empresaId } = await getSessionData();
  return prisma.marca.update({
    where: { id, empresaId },
    data: { deletedAt: new Date() },
  });
}
