"use client";
import { Search, Plus, Package, ArrowDownToLine, X, Pencil, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { crearProducto, actualizarProducto, eliminarProducto } from "@/actions/productos";

export default function ProductosClient({ initialData }: { initialData: any[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nuevoProd, setNuevoProd] = useState<any>({ id: null, codigo: "", nombre: "", categoria: "", precio: "", stock: "" });

  const filtrados = initialData.filter(p => 
    p.nombre.toLowerCase().includes(search.toLowerCase()) || 
    p.codigo.toLowerCase().includes(search.toLowerCase())
  );

  const handleCrearProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const numStock = parseInt(nuevoProd.stock) || 0;
      
      if (nuevoProd.id) {
        // Editar
        await actualizarProducto(nuevoProd.id, {
          nombre: nuevoProd.nombre,
          codigo: nuevoProd.codigo || `PROD-${Date.now().toString().slice(-4)}`,
          precioVenta: parseFloat(nuevoProd.precio) || 0,
          stock: numStock,
        });
        toast.success("Producto actualizado");
      } else {
        // Crear
        await crearProducto({
          nombre: nuevoProd.nombre,
          codigo: nuevoProd.codigo || `PROD-${Date.now().toString().slice(-6)}`,
          precioVenta: parseFloat(nuevoProd.precio) || 0,
          stock: numStock,
        });
        toast.success("Producto creado exitosamente");
      }
      
      setShowModal(false);
      setNuevoProd({ id: null, codigo: "", nombre: "", categoria: "", precio: "", stock: "" });
      router.refresh(); // Refrescar datos del servidor
    } catch (error: any) {
      toast.error(error.message || "Error al guardar el producto");
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (p: any) => {
    setNuevoProd({ id: p.id, codigo: p.codigo, nombre: p.nombre, categoria: p.categoria, precio: p.precio.toString(), stock: p.stock.toString() });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;
    try {
      await eliminarProducto(id);
      toast.success("Producto eliminado");
      router.refresh();
    } catch (error: any) {
      toast.error("Error al eliminar: " + error.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Catálogo de Productos</h1>
          <p className="text-muted-foreground mt-1 text-sm">Administra tu inventario y precios de forma interactiva.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => toast.promise(new Promise(resolve => setTimeout(resolve, 1500)), {
              loading: 'Descargando plantilla Excel...',
              success: 'Archivo descargado en tu equipo.',
            })}
            className="glass-panel text-foreground px-4 py-2 rounded-lg font-medium hover:bg-secondary transition-colors flex items-center shadow-sm"
          >
            <ArrowDownToLine className="w-4 h-4 mr-2" /> Importar
          </button>
          <button 
            onClick={() => { setNuevoProd({ id: null, nombre: "", categoria: "", precio: "", stock: "" }); setShowModal(true); }}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(var(--primary),0.4)] flex items-center"
          >
            <Plus className="w-4 h-4 mr-2 text-white" /> Nuevo Producto
          </button>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-4">
        <div className="relative flex-1 mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código o nombre..." 
            className="w-full bg-background/50 border border-border/50 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 text-foreground transition-all"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/30">
              <tr>
                <th className="px-6 py-4 font-bold rounded-tl-xl">Código</th>
                <th className="px-6 py-4 font-bold">Producto</th>
                <th className="px-6 py-4 font-bold">Categoría</th>
                <th className="px-6 py-4 font-bold text-right">Precio Venta</th>
                <th className="px-6 py-4 font-bold text-right">Stock</th>
                <th className="px-6 py-4 font-bold text-center">Estado</th>
                <th className="px-6 py-4 font-bold text-center rounded-tr-xl">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filtrados.map((p) => (
                <tr key={p.id} className="hover:bg-secondary/20 transition-colors group">
                  <td className="px-6 py-4 font-mono text-muted-foreground">{p.codigo}</td>
                  <td className="px-6 py-4 font-medium text-foreground flex items-center">
                    <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center mr-3 shrink-0">
                      <Package className="w-4 h-4 text-muted-foreground" />
                    </div>
                    {p.nombre}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{p.categoria}</td>
                  <td className="px-6 py-4 text-right font-bold text-foreground">S/ {p.precio.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`font-medium ${p.stock < 15 ? (p.stock === 0 ? 'text-destructive' : 'text-orange-500') : 'text-emerald-500'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      p.estado === 'Activo' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                      p.estado === 'Agotado' ? 'bg-destructive/10 text-destructive border-destructive/20' : 
                      'bg-orange-500/10 text-orange-500 border-orange-500/20'
                    }`}>
                      {p.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => openEdit(p)} className="text-muted-foreground hover:text-primary transition-colors p-2 bg-secondary/50 rounded-lg">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="text-muted-foreground hover:text-destructive transition-colors p-2 bg-secondary/50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border/50 shadow-2xl p-6 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-heading font-bold mb-4">{nuevoProd.id ? "Editar Producto" : "Crear Producto"}</h2>
            <form onSubmit={handleCrearProducto} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Código / SKU</label>
                  <input value={nuevoProd.codigo} onChange={e => setNuevoProd({...nuevoProd, codigo: e.target.value})} type="text" className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm" placeholder="Opcional" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Nombre del Producto</label>
                  <input required value={nuevoProd.nombre} onChange={e => setNuevoProd({...nuevoProd, nombre: e.target.value})} type="text" className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm" placeholder="Ej. Impresora Epson" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Precio (S/)</label>
                  <input required value={nuevoProd.precio} onChange={e => setNuevoProd({...nuevoProd, precio: e.target.value})} type="number" step="0.01" className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm" placeholder="0.00" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Stock Actual</label>
                  <input required value={nuevoProd.stock} onChange={e => setNuevoProd({...nuevoProd, stock: e.target.value})} type="number" className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm" placeholder="0" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl font-bold mt-2 flex items-center justify-center disabled:opacity-50">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (nuevoProd.id ? "Guardar Cambios" : "Guardar Producto")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
