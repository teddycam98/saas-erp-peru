"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getProductos() {
  const session = await auth();
  if (!(session?.user as any)?.empresaId) throw new Error("No autenticado");

  return prisma.producto.findMany({
    where: { empresaId: (session?.user as any)?.empresaId },
    include: { 
      categoria: true, 
      marca: true,
      inventarios: {
        where: { sucursalId: (session?.user as any)?.sucursalId }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function crearProducto(data: any) {
  const session = await auth();
  const empresaId = (session?.user as any)?.empresaId;
  const sucursalId = (session?.user as any)?.sucursalId;
  if (!empresaId) throw new Error("No autenticado");

  return prisma.$transaction(async (tx) => {
    const prod = await tx.producto.create({
      data: {
        empresaId,
        codigo: data.codigo,
        nombre: data.nombre,
        precioVenta: data.precioVenta,
        precioCompra: data.precioVenta * 0.7, // Valor por defecto
        categoriaId: data.categoriaId || null,
      }
    });

    let targetSucursalId = sucursalId;
    if (!targetSucursalId) {
      const suc = await tx.sucursal.findFirst({ where: { empresaId }, orderBy: { createdAt: 'asc' } });
      targetSucursalId = suc?.id;
    }

    if (data.stock !== undefined && data.stock !== null && targetSucursalId) {
      await tx.inventarioSucursal.create({
        data: {
          sucursalId: targetSucursalId,
          productoId: prod.id,
          stockActual: parseInt(data.stock) || 0,
        }
      });
    }

    return prod;
  });
}

export async function actualizarProducto(id: string, data: any) {
  const session = await auth();
  const sucursalId = (session?.user as any)?.sucursalId;
  if (!(session?.user as any)?.empresaId) throw new Error("No autenticado");

  // Validar pertenencia
  const prod = await prisma.producto.findUnique({ where: { id } });
  if (prod?.empresaId !== (session?.user as any)?.empresaId) throw new Error("Acceso denegado");

  return prisma.$transaction(async (tx) => {
    const updated = await tx.producto.update({
      where: { id },
      data: {
        nombre: data.nombre,
        precioVenta: data.precioVenta,
        codigo: data.codigo,
      }
    });

    let targetSucursalId = sucursalId;
    if (!targetSucursalId) {
      const suc = await tx.sucursal.findFirst({ where: { empresaId: prod!.empresaId }, orderBy: { createdAt: 'asc' } });
      targetSucursalId = suc?.id;
    }

    if (data.stock !== undefined && targetSucursalId) {
      // Necesitamos upsert o buscar primero si existe porque prisma no generó sucursalId_productoId unique constraint
      // Revisando schema, model InventarioSucursal no tiene @@unique([sucursalId, productoId]).
      // Si no la tiene, debemos buscar y luego update/create
      const inv = await tx.inventarioSucursal.findFirst({
        where: { sucursalId: targetSucursalId, productoId: id }
      });

      if (inv) {
        await tx.inventarioSucursal.update({
          where: { id: inv.id },
          data: { stockActual: parseInt(data.stock) || 0 }
        });
      } else {
        await tx.inventarioSucursal.create({
          data: {
            sucursalId: targetSucursalId,
            productoId: id,
            stockActual: parseInt(data.stock) || 0
          }
        });
      }
    }

    return updated;
  });
}

export async function eliminarProducto(id: string) {
  const session = await auth();
  if (!(session?.user as any)?.empresaId) throw new Error("No autenticado");

  const prod = await prisma.producto.findUnique({ where: { id } });
  if (prod?.empresaId !== (session?.user as any)?.empresaId) throw new Error("Acceso denegado");

  return prisma.producto.delete({
    where: { id }
  });
}
