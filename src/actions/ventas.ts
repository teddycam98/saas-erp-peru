"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function registrarVenta(data: {
  clienteId?: string;
  tipoComprobante: "BOLETA" | "FACTURA";
  documentoCliente?: string;
  nombreCliente?: string;
  detalles: { productoId: string; cantidad: number; precio: number }[];
  metodoPago: string;
}) {
  const session = await auth();
  if (!(session?.user as any)?.empresaId) throw new Error("No autenticado");

  // Obtener sucursal del usuario
  const usuario = await prisma.usuario.findUnique({ where: { id: session!.user!.id }});
  let targetSucursalId = usuario?.sucursalId;
  if (!targetSucursalId) {
    const suc = await prisma.sucursal.findFirst({ where: { empresaId: (session?.user as any)?.empresaId }, orderBy: { createdAt: 'asc' } });
    targetSucursalId = suc?.id;
  }
  if (!targetSucursalId) throw new Error("No hay sucursales disponibles en la empresa");

  const subtotal = data.detalles.reduce((acc, d) => acc + (d.cantidad * d.precio), 0);
  const igv = subtotal * 0.18;
  const total = subtotal + igv;

  // Transacción: Crear Venta + Detalles + Descontar Stock (Kardex)
  const venta = await prisma.$transaction(async (tx) => {
    
    // 0. Crear cliente si no existe
    let finalClienteId = data.clienteId;
    if (!finalClienteId && data.documentoCliente && data.nombreCliente) {
      const nuevoCliente = await tx.cliente.create({
        data: {
          empresaId: (session?.user as any)?.empresaId as string,
          tipoDocumento: data.tipoComprobante === "FACTURA" ? "RUC" : "DNI",
          numeroDocumento: data.documentoCliente,
          nombre: data.nombreCliente,
        }
      });
      finalClienteId = nuevoCliente.id;
    }

    // 1. Crear cabecera
    const nuevaVenta = await tx.venta.create({
      data: {
        empresaId: (session?.user as any)?.empresaId as string,
        sucursalId: targetSucursalId,
        usuarioId: session!.user!.id as string,
        clienteId: finalClienteId,
        tipoComprobante: data.tipoComprobante,
        serie: data.tipoComprobante === "FACTURA" ? "F001" : "B001",
        correlativo: Math.floor(Math.random() * 100000), // Simulado hasta integrar correlativos reales
        subtotal,
        igv,
        total,
        metodoPago: data.metodoPago,
      }
    });

    // 2. Crear detalles y actualizar Kardex
    for (const det of data.detalles) {
      await tx.ventaDetalle.create({
        data: {
          ventaId: nuevaVenta.id,
          productoId: det.productoId,
          cantidad: det.cantidad,
          precioUnitario: det.precio,
          
          
          total: (det.cantidad * det.precio) * 1.18,
        }
      });

      // 3. Descontar Stock Global
      // 4. Actualizar Inventario Sucursal

      // 4. Actualizar Inventario Sucursal
      await tx.inventarioSucursal.upsert({
        where: {
          sucursalId_productoId: {
            sucursalId: targetSucursalId,
            productoId: det.productoId
          }
        },
        update: { stockActual: { decrement: det.cantidad } },
        create: {
          sucursalId: targetSucursalId,
          productoId: det.productoId,
          stockActual: -det.cantidad // Queda negativo si venden sin stock previo registrado en esa sucursal
        }
      });
    }

    return nuevaVenta;
  });

  return { success: true, venta };
}

export async function getVentas() {
  const session = await auth();
  if (!(session?.user as any)?.empresaId) throw new Error("No autenticado");

  return prisma.venta.findMany({
    where: { empresaId: (session?.user as any)?.empresaId },
    include: {
      cliente: true,
      usuario: true,
      detalles: {
        include: { producto: true }
      }
    },
    orderBy: { fechaEmision: 'desc' }
  });
}

export async function anularVenta(id: string) {
  const session = await auth();
  if (!(session?.user as any)?.empresaId) throw new Error("No autenticado");

  const venta = await prisma.venta.findUnique({
    where: { id },
    include: { detalles: true }
  });

  if (!venta) throw new Error("Venta no encontrada");
  if (venta.empresaId !== (session?.user as any)?.empresaId) throw new Error("Acceso denegado");

  // Revertir el stock en una transacción
  await prisma.$transaction(async (tx) => {
    // Restaurar stock
    for (const det of venta.detalles) {
      const inv = await tx.inventarioSucursal.findFirst({
        where: { sucursalId: venta.sucursalId, productoId: det.productoId }
      });
      if (inv) {
        await tx.inventarioSucursal.update({
          where: { id: inv.id },
          data: { stockActual: { increment: det.cantidad } }
        });
      }
    }

    // Opcional: Podrías eliminar la venta o cambiarle el estado a "ANULADO". 
    // Como no hay estado "Anulado" en el schema actual, podemos eliminarla directamente para simplificar.
    // O si quieres mantener el registro, agregar un campo estado. Por ahora la eliminamos para no complicar el schema.
    await tx.venta.delete({
      where: { id }
    });
  });

  return { success: true };
}
