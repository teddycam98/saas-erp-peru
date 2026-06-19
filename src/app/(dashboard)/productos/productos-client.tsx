"use client";
import { Search, Plus, Package, X, Pencil, Trash2, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { crearProducto, actualizarProducto, eliminarProducto } from "@/actions/productos";

interface Prod { id: string; codigo: string; codigoBarras: string; nombre: string; descripcion: string; categoriaId: string; categoriaNombre: string; marcaId: string; marcaNombre: string; precioCompra: number; precioVenta: number; stock: number; stockMinimo: number; estado: boolean; }
interface Cat { id: string; nombre: string; }
interface Marca { id: string; nombre: string; }

const emptyForm = { id: "", codigo: "", codigoBarras: "", nombre: "", descripcion: "", categoriaId: "", marcaId: "", precioCompra: "", precioVenta: "", stock: "", stockMinimo: "0" };

export default function ProductosClient({ initialData, categorias, marcas }: { initialData: Prod[]; categorias: Cat[]; marcas: Marca[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filtro, setFiltro] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const filtrados = useMemo(() => {
    return initialData.filter(p => {
      const matchSearch = !search || p.nombre.toLowerCase().includes(search.toLowerCase()) || p.codigo.toLowerCase().includes(search.toLowerCase());
      if (filtro === "low") return matchSearch && p.stock > 0 && p.stock <= p.stockMinimo;
      if (filtro === "out") return matchSearch && p.stock <= 0;
      if (filtro === "active") return matchSearch && p.stock > 0;
      return matchSearch;
    });
  }, [initialData, search, filtro]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        nombre: form.nombre,
        codigo: form.codigo || undefined,
        codigoBarras: form.codigoBarras || undefined,
        descripcion: form.descripcion || undefined,
        categoriaId: form.categoriaId || undefined,
        marcaId: form.marcaId || undefined,
        precioCompra: parseFloat(form.precioCompra) || 0,
        precioVenta: parseFloat(form.precioVenta) || 0,
        stockInicial: parseInt(form.stock) || 0,
        stockMinimo: parseInt(form.stockMinimo) || 0,
        afectoIGV: true,
      };
      if (form.id) {
        await actualizarProducto({ id: form.id, ...payload });
        toast.success("Producto actualizado");
      } else {
        await crearProducto(payload);
        toast.success("Producto creado");
      }
      setShowModal(false);
      setForm(emptyForm);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Error al guardar");
    } finally { setLoading(false); }
  };

  const openEdit = (p: Prod) => {
    setForm({ id: p.id, codigo: p.codigo, codigoBarras: p.codigoBarras, nombre: p.nombre, descripcion: p.descripcion, categoriaId: p.categoriaId, marcaId: p.marcaId, precioCompra: p.precioCompra.toString(), precioVenta: p.precioVenta.toString(), stock: p.stock.toString(), stockMinimo: p.stockMinimo.toString() });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este producto?")) return;
    try { await eliminarProducto(id); toast.success("Eliminado"); router.refresh(); } catch (err: any) { toast.error(err.message); }
  };

  const stockBadge = (p: Prod) => {
    if (p.stock <= 0) return "bg-red-500/10 text-red-400 border-red-500/20";
    if (p.stock <= p.stockMinimo) return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold">Catálogo de Productos</h1>
          <p className="text-sm text-muted-foreground">Administra inventario, precios y categorías</p>
        </div>
        <button onClick={() => { setForm(emptyForm); setShowModal(true); }} className="bg-primary text-white px-4 py-2 rounded-xl font-medium text-sm hover:bg-primary/90 shadow-[0_0_15px_rgba(124,58,237,0.3)] flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nuevo Producto
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por código o nombre..." className="w-full bg-card border border-border/50 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <div className="flex gap-1.5">
          {[["all","Todos"],["active","Activos"],["low","Bajo Stock"],["out","Agotados"]].map(([k,l]) => (
            <button key={k} onClick={() => setFiltro(k)} className={`px-3 py-2 rounded-lg text-xs font-bold ${filtro === k ? "bg-primary text-white" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>{l}</button>
          ))}
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/30 text-muted-foreground text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left font-bold">Código</th>
                <th className="px-4 py-3 text-left font-bold">Producto</th>
                <th className="px-4 py-3 text-left font-bold">Categoría</th>
                <th className="px-4 py-3 text-right font-bold">Costo</th>
                <th className="px-4 py-3 text-right font-bold">Precio</th>
                <th className="px-4 py-3 text-center font-bold">Stock</th>
                <th className="px-4 py-3 text-center font-bold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filtrados.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No se encontraron productos</td></tr>}
              {filtrados.map(p => (
                <tr key={p.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.codigo || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0"><Package className="w-4 h-4 text-muted-foreground" /></div>
                      <div><p className="text-xs font-medium">{p.nombre}</p>{p.marcaNombre && <p className="text-[10px] text-muted-foreground">{p.marcaNombre}</p>}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{p.categoriaNombre}</td>
                  <td className="px-4 py-3 text-right text-xs text-muted-foreground">S/ {p.precioCompra.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-xs font-bold">S/ {p.precioVenta.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${stockBadge(p)}`}>{p.stock}</span></td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-1">
                      <button onClick={() => openEdit(p)} className="p-1.5 bg-secondary rounded-lg hover:bg-secondary/80"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20"><Trash2 className="w-3.5 h-3.5" /></button>
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
          <div className="bg-card w-full max-w-lg rounded-2xl border border-border/50 shadow-2xl p-6 relative max-h-[85vh] overflow-y-auto">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            <h2 className="text-lg font-bold mb-4">{form.id ? "Editar Producto" : "Nuevo Producto"}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium mb-1 block">Código / SKU</label><input value={form.codigo} onChange={e => setForm({...form, codigo: e.target.value})} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm" placeholder="Opcional" /></div>
                <div><label className="text-xs font-medium mb-1 block">Código de Barras</label><input value={form.codigoBarras} onChange={e => setForm({...form, codigoBarras: e.target.value})} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm" placeholder="Opcional" /></div>
              </div>
              <div><label className="text-xs font-medium mb-1 block">Nombre *</label><input required value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="text-xs font-medium mb-1 block">Descripción</label><input value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium mb-1 block">Categoría</label><select value={form.categoriaId} onChange={e => setForm({...form, categoriaId: e.target.value})} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm"><option value="">Sin categoría</option>{categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select></div>
                <div><label className="text-xs font-medium mb-1 block">Marca</label><select value={form.marcaId} onChange={e => setForm({...form, marcaId: e.target.value})} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm"><option value="">Sin marca</option>{marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium mb-1 block">Precio Compra S/</label><input required type="number" step="0.01" value={form.precioCompra} onChange={e => setForm({...form, precioCompra: e.target.value})} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="text-xs font-medium mb-1 block">Precio Venta S/ *</label><input required type="number" step="0.01" value={form.precioVenta} onChange={e => setForm({...form, precioVenta: e.target.value})} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium mb-1 block">Stock Actual</label><input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="text-xs font-medium mb-1 block">Stock Mínimo</label><input type="number" value={form.stockMinimo} onChange={e => setForm({...form, stockMinimo: e.target.value})} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm" /></div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-primary text-white py-2.5 rounded-xl font-bold text-sm mt-2 flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-primary/90 shadow-[0_0_15px_rgba(124,58,237,0.3)]">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (form.id ? "Guardar Cambios" : "Crear Producto")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
