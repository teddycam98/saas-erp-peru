"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getSucursales() {
  const session = await auth();
  if (!(session?.user as any)?.empresaId) throw new Error("No autenticado");

  return prisma.sucursal.findMany({
    where: { empresaId: (session?.user as any)?.empresaId },
    orderBy: { createdAt: 'asc' }
  });
}

export async function crearSucursal(data: any) {
  const session = await auth();
  if (!(session?.user as any)?.empresaId) throw new Error("No autenticado");

  return prisma.sucursal.create({
    data: {
      nombre: data.nombre,
      direccion: data.direccion,
      telefono: data.telefono,
      empresaId: (session?.user as any)?.empresaId
    }
  });
}

export async function actualizarSucursal(id: string, data: any) {
  const session = await auth();
  if (!(session?.user as any)?.empresaId) throw new Error("No autenticado");

  const suc = await prisma.sucursal.findUnique({ where: { id } });
  if (suc?.empresaId !== (session?.user as any)?.empresaId) throw new Error("Acceso denegado");

  return prisma.sucursal.update({
    where: { id },
    data: {
      nombre: data.nombre,
      direccion: data.direccion,
      telefono: data.telefono,
    }
  });
}

export async function eliminarSucursal(id: string) {
  const session = await auth();
  if (!(session?.user as any)?.empresaId) throw new Error("No autenticado");

  const suc = await prisma.sucursal.findUnique({ where: { id } });
  if (suc?.empresaId !== (session?.user as any)?.empresaId) throw new Error("Acceso denegado");

  return prisma.sucursal.delete({
    where: { id }
  });
}
