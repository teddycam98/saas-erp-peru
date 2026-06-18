import ClientesClient from "./clientes-client";
import { getClientes } from "@/actions/clientes";

export default async function ClientesPage() {
  const clientes = await getClientes();
  
  // Transformar datos para el cliente (serializar fechas/decimales si es necesario)
  const data = clientes.map(c => ({
    id: c.id,
    nombre: c.nombre,
    documento: c.numeroDocumento || "",
    tipoDocumento: c.tipoDocumento || "DNI",
    email: c.email || "",
    telefono: c.telefono || "",
    estado: "Activo" // O lógica personalizada
  }));

  return <ClientesClient initialData={data} />;
}
