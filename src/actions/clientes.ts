"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getClientes() {
  const session = await auth();
  if (!(session?.user as any)?.empresaId) throw new Error("No autenticado");

  return prisma.cliente.findMany({
    where: { empresaId: (session?.user as any)?.empresaId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function crearCliente(data: any) {
  const session = await auth();
  if (!(session?.user as any)?.empresaId) throw new Error("No autenticado");

  return prisma.cliente.create({
    data: {
      ...data,
      empresaId: (session?.user as any)?.empresaId
    }
  });
}

export async function actualizarCliente(id: string, data: any) {
  const session = await auth();
  if (!(session?.user as any)?.empresaId) throw new Error("No autenticado");

  // Validar pertenencia
  const cli = await prisma.cliente.findUnique({ where: { id } });
  if (cli?.empresaId !== (session?.user as any)?.empresaId) throw new Error("Acceso denegado");

  return prisma.cliente.update({
    where: { id },
    data
  });
}

export async function eliminarCliente(id: string) {
  const session = await auth();
  if (!(session?.user as any)?.empresaId) throw new Error("No autenticado");

  const cli = await prisma.cliente.findUnique({ where: { id } });
  if (cli?.empresaId !== (session?.user as any)?.empresaId) throw new Error("Acceso denegado");

  return prisma.cliente.delete({
    where: { id }
  });
}
