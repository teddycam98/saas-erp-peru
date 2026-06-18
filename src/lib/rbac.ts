import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function hasPermission(permisoCodigo: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;

  const { id: usuarioId, empresaId } = session.user as any;

  // El sistema asume que el token JWT puede no tener todos los permisos embebidos por peso.
  // Consultamos a Prisma y usamos cache (Next.js data cache lo optimizará)
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    include: {
      rol: {
        include: {
          permisos: {
            include: { permiso: true }
          }
        }
      }
    }
  });

  if (!usuario || usuario.empresaId !== empresaId) return false;

  // Si el usuario tiene un Rol llamado "OWNER", tiene permiso absoluto
  if (usuario.rol.nombre === "OWNER") return true;

  // Verificar si dentro de sus permisos existe el código solicitado
  return usuario.rol.permisos.some(rp => rp.permiso.codigo === permisoCodigo);
}

export async function checkPermissionOrThrow(permisoCodigo: string) {
  const allowed = await hasPermission(permisoCodigo);
  if (!allowed) {
    throw new Error(`Acceso denegado: Se requiere el permiso ${permisoCodigo}`);
  }
}
