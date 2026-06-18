"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";

export async function getUsuarios() {
  const session = await auth();
  if (!(session?.user as any)?.empresaId) throw new Error("No autenticado");

  return prisma.usuario.findMany({
    where: { empresaId: (session?.user as any)?.empresaId },
    include: { sucursal: true, rol: true },
    orderBy: { createdAt: 'desc' }
  });
}

export async function crearUsuario(data: any) {
  const session = await auth();
  const empresaId = (session?.user as any)?.empresaId;
  if (!empresaId) throw new Error("No autenticado");

  const exists = await prisma.usuario.findFirst({ where: { email: data.email } });
  if (exists) throw new Error("El email ya está en uso");

  const hashedPassword = await bcrypt.hash(data.password, 10);

  // Get or Create Rol
  let rol = await prisma.rol.findFirst({ where: { empresaId, nombre: data.rol } });
  if (!rol) {
    rol = await prisma.rol.create({ data: { empresaId, nombre: data.rol, descripcion: data.rol } });
  }

  return prisma.usuario.create({
    data: {
      nombre: data.nombre,
      email: data.email,
      passwordHash: hashedPassword,
      rolId: rol.id,
      sucursalId: data.sucursalId || null,
      empresaId
    }
  });
}

export async function actualizarUsuario(id: string, data: any) {
  const session = await auth();
  const empresaId = (session?.user as any)?.empresaId;
  if (!empresaId) throw new Error("No autenticado");

  const user = await prisma.usuario.findUnique({ where: { id }, include: { rol: true } });
  if (user?.empresaId !== empresaId) throw new Error("Acceso denegado");

  // Get or Create Rol
  let rol = await prisma.rol.findFirst({ where: { empresaId, nombre: data.rol } });
  if (!rol) {
    rol = await prisma.rol.create({ data: { empresaId, nombre: data.rol, descripcion: data.rol } });
  }

  let updateData: any = {
    nombre: data.nombre,
    rolId: rol.id,
    sucursalId: data.sucursalId || null,
  };

  if (data.password && data.password.trim() !== "") {
    updateData.passwordHash = await bcrypt.hash(data.password, 10);
  }

  return prisma.usuario.update({
    where: { id },
    data: updateData
  });
}

export async function eliminarUsuario(id: string) {
  const session = await auth();
  if (!(session?.user as any)?.empresaId) throw new Error("No autenticado");

  const user = await prisma.usuario.findUnique({ where: { id }, include: { rol: true } });
  if (user?.empresaId !== (session?.user as any)?.empresaId) throw new Error("Acceso denegado");
  if (user?.id === (session?.user as any)?.id) throw new Error("No puedes eliminarte a ti mismo");
  if (user?.rol?.nombre === "ADMIN" && (await prisma.usuario.count({ where: { empresaId: user.empresaId, rol: { nombre: "ADMIN" } } })) === 1) {
    throw new Error("No puedes eliminar al último administrador");
  }

  return prisma.usuario.delete({
    where: { id }
  });
}
