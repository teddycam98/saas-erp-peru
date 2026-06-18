"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getProductos() {
  const session = await auth();
  if (!(session?.user as any)?.empresaId) throw new Error("No autenticado");

  return prisma.producto.findMany({
    where: { empresaId: (session?.user as any)?.empresaId },
    include: { categoria: true, marca: true }
  });
}

export async function crearProducto(data: any) {
  const session = await auth();
  if (!(session?.user as any)?.empresaId) throw new Error("No autenticado");

  return prisma.producto.create({
    data: {
      ...data,
      empresaId: (session?.user as any)?.empresaId
    }
  });
}

export async function actualizarProducto(id: string, data: any) {
  const session = await auth();
  if (!(session?.user as any)?.empresaId) throw new Error("No autenticado");

  // Validar pertenencia
  const prod = await prisma.producto.findUnique({ where: { id } });
  if (prod?.empresaId !== (session?.user as any)?.empresaId) throw new Error("Acceso denegado");

  return prisma.producto.update({
    where: { id },
    data
  });
}
