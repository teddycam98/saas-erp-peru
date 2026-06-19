"use server";

import { prisma } from "@/lib/prisma";
import { getSessionData } from "@/lib/auth-utils";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const crearSucursalSchema = z.object({
  nombre: z.string().min(1, "Nombre es obligatorio"),
  direccion: z.string().optional().nullable(),
  ubigeo: z.string().max(6).optional().nullable(),
  codigoSunat: z.string().max(4).optional().nullable(),
  telefono: z.string().optional().nullable(),
});

const actualizarSucursalSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string().min(1).optional(),
  direccion: z.string().optional().nullable(),
  ubigeo: z.string().max(6).optional().nullable(),
  codigoSunat: z.string().max(4).optional().nullable(),
  telefono: z.string().optional().nullable(),
  estado: z.boolean().optional(),
});

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export async function getSucursales() {
  const { empresaId } = await getSessionData();

  return prisma.sucursal.findMany({
    where: { empresaId, deletedAt: null },
    include: {
      _count: {
        select: { usuarios: true, inventarios: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function crearSucursal(input: z.infer<typeof crearSucursalSchema>) {
  const { empresaId } = await getSessionData();
  const data = crearSucursalSchema.parse(input);

  return prisma.sucursal.create({
    data: {
      empresaId,
      nombre: data.nombre,
      direccion: data.direccion || null,
      ubigeo: data.ubigeo || null,
      codigoSunat: data.codigoSunat || null,
      telefono: data.telefono || null,
    },
  });
}

export async function actualizarSucursal(
  input: z.infer<typeof actualizarSucursalSchema>
) {
  const { empresaId } = await getSessionData();
  const data = actualizarSucursalSchema.parse(input);

  // Verify ownership
  const existing = await prisma.sucursal.findFirst({
    where: { id: data.id, empresaId, deletedAt: null },
  });

  if (!existing) {
    throw new Error("Sucursal no encontrada");
  }

  return prisma.sucursal.update({
    where: { id: data.id },
    data: {
      ...(data.nombre !== undefined && { nombre: data.nombre }),
      ...(data.direccion !== undefined && { direccion: data.direccion }),
      ...(data.ubigeo !== undefined && { ubigeo: data.ubigeo }),
      ...(data.codigoSunat !== undefined && { codigoSunat: data.codigoSunat }),
      ...(data.telefono !== undefined && { telefono: data.telefono }),
      ...(data.estado !== undefined && { estado: data.estado }),
    },
  });
}

export async function eliminarSucursal(id: string) {
  const { empresaId } = await getSessionData();

  // Verify ownership
  const sucursal = await prisma.sucursal.findFirst({
    where: { id, empresaId, deletedAt: null },
  });

  if (!sucursal) {
    throw new Error("Sucursal no encontrada");
  }

  // Prevent deleting the only active sucursal
  const activeSucursalCount = await prisma.sucursal.count({
    where: { empresaId, deletedAt: null },
  });

  if (activeSucursalCount <= 1) {
    throw new Error(
      "No se puede eliminar la única sucursal de la empresa. Debe existir al menos una sucursal activa."
    );
  }

  // Check if it's the "primary" (oldest) sucursal
  const primarySucursal = await prisma.sucursal.findFirst({
    where: { empresaId, deletedAt: null },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  if (primarySucursal?.id === id) {
    throw new Error(
      "No se puede eliminar la sucursal principal. Elimine otra sucursal o reasigne primero."
    );
  }

  // Soft delete
  await prisma.sucursal.update({
    where: { id },
    data: { deletedAt: new Date(), estado: false },
  });

  return { success: true };
}
