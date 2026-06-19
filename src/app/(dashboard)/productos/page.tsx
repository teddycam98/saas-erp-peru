import ProductosClient from "./productos-client";
import { getProductos, getCategorias, getMarcas } from "@/actions/productos";

export default async function ProductosPage() {
  const [productos, categorias, marcas] = await Promise.all([
    getProductos(),
    getCategorias(),
    getMarcas(),
  ]);

  const data = productos.map((p: any) => ({
    id: p.id,
    codigo: p.codigo || "",
    codigoBarras: p.codigoBarras || "",
    nombre: p.nombre,
    descripcion: p.descripcion || "",
    categoriaId: p.categoriaId || "",
    categoriaNombre: p.categoria?.nombre || "Sin categoría",
    marcaId: p.marcaId || "",
    marcaNombre: p.marca?.nombre || "",
    precioCompra: Number(p.precioCompra),
    precioVenta: Number(p.precioVenta),
    stock: p.inventarios?.[0]?.stockActual ?? 0,
    stockMinimo: p.stockMinimo || 0,
    estado: p.estado,
    imageUrl: p.imageUrl || "",
  }));

  const cats = categorias.map((c: any) => ({ id: c.id, nombre: c.nombre }));
  const mrs = marcas.map((m: any) => ({ id: m.id, nombre: m.nombre }));

  return <ProductosClient initialData={data} categorias={cats} marcas={mrs} />;
}
