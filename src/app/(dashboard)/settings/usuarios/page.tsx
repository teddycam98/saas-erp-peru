import UsuariosClient from "./usuarios-client";
import { getUsuarios } from "@/actions/usuarios";
import { getSucursales } from "@/actions/sucursales";

export default async function UsuariosPage() {
  const usuarios = await getUsuarios();
  const sucursales = await getSucursales();
  
  // Clean password hash before sending to client
  const safeUsuarios = usuarios.map(u => ({
    id: u.id,
    nombre: u.nombre,
    email: u.email,
    rol: (u.rol as any)?.nombre || "EMPLEADO",
    sucursalId: u.sucursalId,
    sucursalNombre: u.sucursal?.nombre || "No asignada",
  }));

  return <UsuariosClient initialData={safeUsuarios} sucursales={sucursales} />;
}
