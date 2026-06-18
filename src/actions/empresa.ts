"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getEmpresaBySubdomain(subdominio: string) {
  try {
    const empresa = await prisma.empresa.findUnique({
      where: { subdominio }
    });
    return { success: true, data: empresa };
  } catch (error) {
    return { success: false, error: "Error al obtener empresa" };
  }
}

export async function updateEmpresaData(id: string, data: any, domain: string) {
  try {
    const empresa = await prisma.empresa.update({
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
    revalidatePath(`/${domain}/settings`, "layout");
    return { success: true, data: empresa };
  } catch (error) {
    return { success: false, error: "Error al actualizar la empresa" };
  }
}
