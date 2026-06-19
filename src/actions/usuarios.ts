"use server";

import { prisma } from "@/lib/prisma";
import { getSessionData } from "@/lib/auth-utils";
import { z } from "zod";
import bcrypt from "bcryptjs";

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const crearUsuarioSchema = z.object({
  nombre: z.string().min(1, "Nombre es obligatorio"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  rolId: z.string().uuid("Rol es obligatorio"),
  sucursalId: z.string().uuid().optional().nullable(),
  avatarUrl: z.string().url().optional().nullable().or(z.literal("")),
});

const actualizarUsuarioSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  rolId: z.string().uuid().optional(),
  sucursalId: z.string().uuid().optional().nullable(),
  avatarUrl: z.string().url().optional().nullable().or(z.literal("")),
  estado: z.boolean().optional(),
});

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export async function getUsuarios() {
  const { empresaId } = await getSessionData();

  const usuarios = await prisma.usuario.findMany({
    where: { empresaId, deletedAt: null },
    include: {
      rol: { select: { id: true, nombre: true } },
      sucursal: { select: { id: true, nombre: true } },
    },
    orderBy: { nombre: "asc" },
  });

  // Strip passwordHash from the response
  return usuarios.map(({ passwordHash, ...rest }) => rest);
}

export async function crearUsuario(input: z.infer<typeof crearUsuarioSchema>) {
  const { empresaId } = await getSessionData();
  const data = crearUsuarioSchema.parse(input);

  // Check for duplicate email within the empresa
  const existingUser = await prisma.usuario.findUnique({
    where: {
      empresaId_email: {
        empresaId,
        email: data.email,
      },
    },
  });

  if (existingUser) {
    throw new Error("Ya existe un usuario con este email en la empresa");
  }

  // Verify the role belongs to the empresa
  const role = await prisma.rol.findFirst({
    where: { id: data.rolId, empresaId, deletedAt: null },
  });

  if (!role) {
    throw new Error("Rol no encontrado o no pertenece a esta empresa");
  }

  // Verify sucursal if provided
  if (data.sucursalId) {
    const sucursal = await prisma.sucursal.findFirst({
      where: { id: data.sucursalId, empresaId, deletedAt: null },
    });
    if (!sucursal) {
      throw new Error("Sucursal no encontrada o no pertenece a esta empresa");
    }
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  const usuario = await prisma.usuario.create({
    data: {
      empresaId,
      nombre: data.nombre,
      email: data.email,
      passwordHash,
      rolId: data.rolId,
      sucursalId: data.sucursalId || null,
      avatarUrl: data.avatarUrl || null,
    },
    include: {
      rol: { select: { id: true, nombre: true } },
      sucursal: { select: { id: true, nombre: true } },
    },
  });

  const { passwordHash: _, ...result } = usuario;
  return result;
}

export async function actualizarUsuario(
  input: z.infer<typeof actualizarUsuarioSchema>
) {
  const { empresaId } = await getSessionData();
  const data = actualizarUsuarioSchema.parse(input);

  // Verify ownership
  const existing = await prisma.usuario.findFirst({
    where: { id: data.id, empresaId, deletedAt: null },
  });

  if (!existing) {
    throw new Error("Usuario no encontrado");
  }

  // Check email uniqueness if changing email
  if (data.email && data.email !== existing.email) {
    const duplicate = await prisma.usuario.findUnique({
      where: {
        empresaId_email: {
          empresaId,
          email: data.email,
        },
      },
    });
    if (duplicate) {
      throw new Error("Ya existe un usuario con este email en la empresa");
    }
  }

  // Validate rolId belongs to empresa
  if (data.rolId) {
    const role = await prisma.rol.findFirst({
      where: { id: data.rolId, empresaId, deletedAt: null },
    });
    if (!role) {
      throw new Error("Rol no encontrado o no pertenece a esta empresa");
    }
  }

  // Validate sucursalId belongs to empresa
  if (data.sucursalId) {
    const sucursal = await prisma.sucursal.findFirst({
      where: { id: data.sucursalId, empresaId, deletedAt: null },
    });
    if (!sucursal) {
      throw new Error("Sucursal no encontrada o no pertenece a esta empresa");
    }
  }

  // Build update payload
  const updateData: Record<string, unknown> = {};
  if (data.nombre !== undefined) updateData.nombre = data.nombre;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.rolId !== undefined) updateData.rolId = data.rolId;
  if (data.sucursalId !== undefined) updateData.sucursalId = data.sucursalId || null;
  if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl || null;
  if (data.estado !== undefined) updateData.estado = data.estado;

  // Optional password update
  if (data.password) {
    updateData.passwordHash = await bcrypt.hash(data.password, 12);
  }

  const usuario = await prisma.usuario.update({
    where: { id: data.id },
    data: updateData,
    include: {
      rol: { select: { id: true, nombre: true } },
      sucursal: { select: { id: true, nombre: true } },
    },
  });

  const { passwordHash: _, ...result } = usuario;
  return result;
}

export async function eliminarUsuario(id: string) {
  const { empresaId, userId } = await getSessionData();

  // Prevent self-deletion
  if (id === userId) {
    throw new Error("No puedes eliminar tu propio usuario");
  }

  // Verify ownership
  const usuario = await prisma.usuario.findFirst({
    where: { id, empresaId, deletedAt: null },
  });

  if (!usuario) {
    throw new Error("Usuario no encontrado");
  }

  // Soft delete
  await prisma.usuario.update({
    where: { id },
    data: { deletedAt: new Date(), estado: false },
  });

  return { success: true };
}
