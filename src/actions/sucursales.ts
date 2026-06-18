"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSucursales(empresaId: string) {
  try {
    const sucursales = await prisma.sucursal.findMany({
      where: { empresaId },
      orderBy: { createdAt: "asc" }
    });
    return { success: true, data: sucursales };
  } catch (error) {
    return { success: false, error: "Error al obtener sucursales" };
  }
}

export async function createSucursal(empresaId: string, data: any, domain: string) {
  try {
    const sucursal = await prisma.sucursal.create({
      data: {
        empresaId,
        nombre: data.nombre,
        direccion: data.direccion,
        ubigeo: data.ubigeo,
        codigoSunat: data.codigoSunat,
        telefono: data.telefono,
      }
    });
    revalidatePath(`/${domain}/settings/sucursales`, "page");
    return { success: true, data: sucursal };
  } catch (error) {
    return { success: false, error: "Error al crear sucursal" };
  }
}
