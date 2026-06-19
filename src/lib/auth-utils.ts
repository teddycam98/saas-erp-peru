"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SessionData {
  userId: string;
  empresaId: string;
  sucursalId: string;
  rol: {
    id: string;
    nombre: string;
    empresaId: string;
    descripcion: string | null;
  };
  subdominio: string;
}

// ---------------------------------------------------------------------------
// Session helpers
// ---------------------------------------------------------------------------

/**
 * Retrieves and validates the current session.
 * - Throws if no active session or missing empresaId.
 * - Resolves `sucursalId`: uses the user's assigned sucursal; falls back to the
 *   first active sucursal of the empresa if none is assigned.
 */
export async function getSessionData(): Promise<SessionData> {
  const session = await auth();

  if (!session?.user) {
    throw new Error("No autenticado");
  }

  const user = session.user as {
    id?: string;
    empresaId?: string;
    subdominio?: string;
    rol?: { id: string; nombre: string; empresaId: string; descripcion: string | null };
  };

  const userId = user.id;
  const empresaId = user.empresaId;
  const subdominio = user.subdominio ?? "";
  const rol = user.rol;

  if (!userId || !empresaId || !rol) {
    throw new Error("Sesión inválida: datos de empresa o rol no encontrados");
  }

  // Resolve sucursalId ---------------------------------------------------------
  const usuario = await prisma.usuario.findUnique({
    where: { id: userId },
    select: { sucursalId: true },
  });

  let sucursalId = usuario?.sucursalId ?? null;

  if (!sucursalId) {
    // Fall back to the first active sucursal of the empresa
    const sucursal = await prisma.sucursal.findFirst({
      where: { empresaId, estado: true, deletedAt: null },
      select: { id: true },
      orderBy: { createdAt: "asc" },
    });

    if (!sucursal) {
      throw new Error("No se encontró una sucursal activa para la empresa");
    }

    sucursalId = sucursal.id;
  }

  return { userId, empresaId, sucursalId, rol, subdominio };
}

/**
 * Checks whether the current user's role has a specific permission code.
 * Throws with a descriptive message when the permission is missing.
 */
export async function requirePermiso(codigo: string): Promise<void> {
  const { rol } = await getSessionData();

  const entry = await prisma.rolPermiso.findFirst({
    where: {
      rolId: rol.id,
      permiso: { codigo },
    },
  });

  if (!entry) {
    throw new Error(`Permiso denegado: se requiere "${codigo}"`);
  }
}
