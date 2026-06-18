import ProductosClient from "./productos-client";
import { getProductos } from "@/actions/productos";

export default async function ProductosPage() {
  const productos = await getProductos();
  
  // Transformar datos para el cliente
  const data = productos.map(p => ({
    id: p.id,
    codigo: p.codigo,
    nombre: p.nombre,
    categoria: p.categoria?.nombre || "General",
    precio: Number(p.precioVenta),
    stock: p.inventarios[0]?.cantidad || 0,
    estado: p.inventarios[0]?.cantidad > 15 ? "Activo" : (p.inventarios[0]?.cantidad > 0 ? "Bajo Stock" : "Agotado")
  }));

  return <ProductosClient initialData={data} />;
}
