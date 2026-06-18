"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getEmpresa() {
  const session = await auth();
  if (!(session?.user as any)?.empresaId) throw new Error("No autenticado");

  return prisma.empresa.findUnique({
    where: { id: (session?.user as any)?.empresaId }
  });
}

export async function actualizarEmpresa(id: string, data: any) {
  const session = await auth();
  if ((session?.user as any)?.empresaId !== id) throw new Error("Acceso denegado");

  return prisma.empresa.update({
    where: { id },
    data: {
      razonSocial: data.razonSocial,
      nombreComercial: data.nombreComercial,
      ruc: data.ruc,
      direccion: data.direccion,
      emailContacto: data.emailContacto,
      telefono: data.telefono,
    }
  });
}
