import POSClient from "./pos-client";
import { getProductos, getCategorias } from "@/actions/productos";
import { getClientes } from "@/actions/clientes";

export default async function POSPage() {
  const [productos, clientes, categorias] = await Promise.all([
    getProductos(),
    getClientes(),
    getCategorias(),
  ]);

  const dataProductos = productos.map((p: any) => ({
    id: p.id,
    nombre: p.nombre,
    codigo: p.codigo || "",
    precio: Number(p.precioVenta),
    costo: Number(p.precioCompra),
    categoriaId: p.categoriaId || "",
    categoriaNombre: p.categoria?.nombre || "General",
    img: p.nombre.substring(0, 2).toUpperCase(),
    stock: p.inventarios?.[0]?.stockActual ?? 0,
  }));

  const dataClientes = clientes.map((c: any) => ({
    id: c.id,
    nombre: c.nombre,
    documento: c.numeroDocumento,
    tipoDocumento: c.tipoDocumento,
  }));

  const dataCategorias = categorias.map((c: any) => ({
    id: c.id,
    nombre: c.nombre,
  }));

  return <POSClient productos={dataProductos} clientes={dataClientes} categorias={dataCategorias} />;
}
