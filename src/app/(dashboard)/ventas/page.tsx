import POSClient from "./pos-client";
import { getProductos } from "@/actions/productos";
import { getClientes } from "@/actions/clientes";

export default async function POSPage() {
  const productos = await getProductos();
  const clientes = await getClientes();
  
  // Transformar datos para el cliente
  const dataProductos = productos.map(p => ({
    id: p.id,
    nombre: p.nombre,
    precio: Number(p.precioVenta),
    img: p.nombre.substring(0, 2).toUpperCase(),
    stock: p.inventarios[0]?.stockActual || 0
  }));

  const dataClientes = clientes.map(c => ({
    id: c.id,
    nombre: c.nombre,
    documento: c.numeroDocumento
  }));

  return <POSClient productos={dataProductos} clientes={dataClientes} />;
}
