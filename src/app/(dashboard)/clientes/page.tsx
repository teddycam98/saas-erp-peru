import ClientesClient from "./clientes-client";
import { getClientes } from "@/actions/clientes";

export default async function ClientesPage() {
  const clientes = await getClientes();

  const data = clientes.map((c: any) => ({
    id: c.id,
    nombre: c.nombre,
    tipoDocumento: c.tipoDocumento || "DNI",
    documento: c.numeroDocumento || "",
    email: c.email || "",
    telefono: c.telefono || "",
    direccion: c.direccion || "",
  }));

  return <ClientesClient initialData={data} />;
}
