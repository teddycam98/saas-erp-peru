"use server";

import { prisma } from "@/lib/prisma";
import { getSessionData } from "@/lib/auth-utils";
import { z } from "zod";
import { Prisma } from "@prisma/client";

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const crearClienteSchema = z.object({
  nombre: z.string().min(1, "Nombre es obligatorio"),
  tipoDocumento: z.enum(["DNI", "RUC", "CE", "PASAPORTE"]),
  numeroDocumento: z.string().min(1, "Número de documento es obligatorio"),
  email: z.string().email("Email inválido").optional().nullable().or(z.literal("")),
  telefono: z.string().optional().nullable(),
  direccion: z.string().optional().nullable(),
});

const actualizarClienteSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string().min(1).optional(),
  tipoDocumento: z.enum(["DNI", "RUC", "CE", "PASAPORTE"]).optional(),
  numeroDocumento: z.string().min(1).optional(),
  email: z.string().email("Email inválido").optional().nullable().or(z.literal("")),
  telefono: z.string().optional().nullable(),
  direccion: z.string().optional().nullable(),
});

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

export async function getClientes(search?: string) {
  const { empresaId } = await getSessionData();

  const where: Prisma.ClienteWhereInput = {
    empresaId,
    deletedAt: null,
  };

  if (search && search.trim().length > 0) {
    const term = search.trim();
    where.OR = [
      { nombre: { contains: term, mode: "insensitive" } },
      { numeroDocumento: { contains: term, mode: "insensitive" } },
      { email: { contains: term, mode: "insensitive" } },
    ];
  }

  return prisma.cliente.findMany({
    where,
    orderBy: { nombre: "asc" },
  });
}

export async function crearCliente(input: z.infer<typeof crearClienteSchema>) {
  const { empresaId } = await getSessionData();
  const data = crearClienteSchema.parse(input);

  // Check for duplicate document within the empresa
  const existing = await prisma.cliente.findUnique({
    where: {
      empresaId_tipoDocumento_numeroDocumento: {
        empresaId,
        tipoDocumento: data.tipoDocumento,
        numeroDocumento: data.numeroDocumento,
      },
    },
  });

  if (existing && !existing.deletedAt) {
    throw new Error(
      `Ya existe un cliente con ${data.tipoDocumento} ${data.numeroDocumento}`
    );
  }

  // If there was a soft-deleted duplicate, reactivate it
  if (existing && existing.deletedAt) {
    return prisma.cliente.update({
      where: { id: existing.id },
      data: {
        nombre: data.nombre,
        email: data.email || null,
        telefono: data.telefono || null,
        direccion: data.direccion || null,
        deletedAt: null,
      },
    });
  }

  return prisma.cliente.create({
    data: {
      empresaId,
      nombre: data.nombre,
      tipoDocumento: data.tipoDocumento,
      numeroDocumento: data.numeroDocumento,
      email: data.email || null,
      telefono: data.telefono || null,
      direccion: data.direccion || null,
    },
  });
}

export async function actualizarCliente(input: z.infer<typeof actualizarClienteSchema>) {
  const { empresaId } = await getSessionData();
  const data = actualizarClienteSchema.parse(input);

  // Verify ownership
  const existing = await prisma.cliente.findFirst({
    where: { id: data.id, empresaId, deletedAt: null },
  });

  if (!existing) {
    throw new Error("Cliente no encontrado");
  }

  const updateData: Prisma.ClienteUpdateInput = {};
  if (data.nombre !== undefined) updateData.nombre = data.nombre;
  if (data.tipoDocumento !== undefined) updateData.tipoDocumento = data.tipoDocumento;
  if (data.numeroDocumento !== undefined) updateData.numeroDocumento = data.numeroDocumento;
  if (data.email !== undefined) updateData.email = data.email || null;
  if (data.telefono !== undefined) updateData.telefono = data.telefono || null;
  if (data.direccion !== undefined) updateData.direccion = data.direccion || null;

  return prisma.cliente.update({
    where: { id: data.id },
    data: updateData,
  });
}

export async function eliminarCliente(id: string) {
  const { empresaId } = await getSessionData();

  const cliente = await prisma.cliente.findFirst({
    where: { id, empresaId, deletedAt: null },
  });

  if (!cliente) {
    throw new Error("Cliente no encontrado");
  }

  await prisma.cliente.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return { success: true };
}
