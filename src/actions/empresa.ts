"use server";

import { prisma } from "@/lib/prisma";
import { getSessionData } from "@/lib/auth-utils";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const actualizarEmpresaSchema = z.object({
  razonSocial: z.string().min(1).optional(),
  nombreComercial: z.string().optional().nullable(),
  direccion: z.string().optional().nullable(),
  ubigeo: z.string().max(6).optional().nullable(),
  emailContacto: z.string().email().optional().nullable().or(z.literal("")),
  telefono: z.string().optional().nullable(),
  logoUrl: z.string().url().optional().nullable().or(z.literal("")),
  nubefactToken: z.string().optional().nullable(),
  nubefactUrl: z.string().url().optional().nullable().or(z.literal("")),
  configuracion: z.record(z.string(), z.unknown()).optional().nullable(),
});

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export async function getEmpresa() {
  const { empresaId } = await getSessionData();

  const empresa = await prisma.empresa.findUnique({
    where: { id: empresaId },
    include: {
      suscripcion: {
        include: { plan: true },
      },
      sucursales: {
        where: { deletedAt: null },
        select: { id: true, nombre: true },
      },
    },
  });

  if (!empresa) {
    throw new Error("Empresa no encontrada");
  }

  return empresa;
}

export async function actualizarEmpresa(
  input: z.infer<typeof actualizarEmpresaSchema>
) {
  const { empresaId } = await getSessionData();
  const data = actualizarEmpresaSchema.parse(input);

  const empresa = await prisma.empresa.findUnique({
    where: { id: empresaId },
  });

  if (!empresa) {
    throw new Error("Empresa no encontrada");
  }

  return prisma.empresa.update({
    where: { id: empresaId },
    data: {
      ...(data.razonSocial !== undefined && { razonSocial: data.razonSocial }),
      ...(data.nombreComercial !== undefined && {
        nombreComercial: data.nombreComercial,
      }),
      ...(data.direccion !== undefined && { direccion: data.direccion }),
      ...(data.ubigeo !== undefined && { ubigeo: data.ubigeo }),
      ...(data.emailContacto !== undefined && {
        emailContacto: data.emailContacto || null,
      }),
      ...(data.telefono !== undefined && { telefono: data.telefono }),
      ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl || null }),
      ...(data.nubefactToken !== undefined && {
        nubefactToken: data.nubefactToken,
      }),
      ...(data.nubefactUrl !== undefined && {
        nubefactUrl: data.nubefactUrl || null,
      }),
      ...(data.configuracion !== undefined && {
        configuracion: (data.configuracion ?? undefined) as any,
      }),
    },
  });
}
