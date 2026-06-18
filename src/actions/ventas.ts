"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function registrarVenta(data: {
  clienteId?: string;
  detalles: { productoId: string; cantidad: number; precio: number }[];
  metodoPago: string;
}) {
  const session = await auth();
  if (!(session?.user as any)?.empresaId) throw new Error("No autenticado");

  // Obtener sucursal del usuario
  const usuario = await prisma.usuario.findUnique({ where: { id: session!.user!.id }});
  if (!usuario?.sucursalId) throw new Error("Usuario no asignado a sucursal");

  const subtotal = data.detalles.reduce((acc, d) => acc + (d.cantidad * d.precio), 0);
  const igv = subtotal * 0.18;
  const total = subtotal + igv;

  // Transacción: Crear Venta + Detalles + Descontar Stock (Kardex)
  const venta = await prisma.$transaction(async (tx) => {
    
    // 1. Crear cabecera
    const nuevaVenta = await tx.venta.create({
      data: {
        empresaId: (session?.user as any)?.empresaId as string,
        sucursalId: usuario.sucursalId!,
        usuarioId: session!.user!.id as string,
        clienteId: data.clienteId,
        tipoComprobante: "BOLETA",
        serie: "B001",
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
            sucursalId: usuario.sucursalId!,
            productoId: det.productoId
          }
        },
        update: { stockActual: { decrement: det.cantidad } },
        create: {
          sucursalId: usuario.sucursalId!,
          productoId: det.productoId,
          stockActual: -det.cantidad // Queda negativo si venden sin stock previo registrado en esa sucursal
        }
      });
    }

    return nuevaVenta;
  });

  return { success: true, venta };
}
