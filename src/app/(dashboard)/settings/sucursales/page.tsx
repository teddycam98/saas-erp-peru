import SucursalesClient from "./sucursales-client";
import { getSucursales } from "@/actions/sucursales";

export default async function SucursalesPage() {
  const sucursales = await getSucursales();
  return <SucursalesClient initialData={sucursales} />;
}
