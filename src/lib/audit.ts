import { prisma } from "./prisma";

export async function logAudit(
  empresaId: string, 
  usuarioId: string, 
  accion: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "EXPORT", 
  entidad: string, 
  detalles: any
) {
  try {
    await prisma.auditoria.create({
      data: {
        empresaId,
        usuarioId,
        accion,
        tablaAfectada: entidad,
        detalles,
        ip: "127.0.0.1", // En producción se obtiene del request
      }
    });
  } catch (error) {
    console.error("[Audit Error] No se pudo guardar el log de auditoría:", error);
  }
}
