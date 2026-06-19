"use client";
import { Search, Plus, Package, X, Pencil, Trash2, Loader2, Tag, Bookmark } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { crearProducto, actualizarProducto, eliminarProducto, crearCategoria, actualizarCategoria, eliminarCategoria, crearMarca, actualizarMarca, eliminarMarca } from "@/actions/productos";

interface Prod { id: string; codigo: string; codigoBarras: string; nombre: string; descripcion: string; categoriaId: string; categoriaNombre: string; marcaId: string; marcaNombre: string; precioCompra: number; precioVenta: number; stock: number; stockMinimo: number; estado: boolean; }
interface Cat { id: string; nombre: string; }
interface Marca { id: string; nombre: string; }

const emptyForm = { id: "", codigo: "", codigoBarras: "", nombre: "", descripcion: "", categoriaId: "", marcaId: "", precioVenta: "", stock: "" };

export default function ProductosClient({ initialData, categorias, marcas }: { initialData: Prod[]; categorias: Cat[]; marcas: Marca[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filtro, setFiltro] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const [activeTab, setActiveTab] = useState("productos"); // "productos", "categorias", "marcas"
  const [manageForm, setManageForm] = useState({ id: "", nombre: "" });

  const filtrados = useMemo(() => {
    return initialData.filter(p => {
      const matchSearch = !search || p.nombre.toLowerCase().includes(search.toLowerCase()) || p.codigo.toLowerCase().includes(search.toLowerCase());
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
        precioVenta: parseFloat(form.precioVenta) || 0,
        stockInicial: parseInt(form.stock) || 0,
        afectoIGV: true,
      };
      if (form.id) {
        await actualizarProducto({ id: form.id, ...payload });
        toast.success("Producto actualizado");
      } else {
        await crearProducto(payload as any);
        toast.success("Producto creado");
      }
      setShowModal(false);
      setForm(emptyForm);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Error al guardar");
    } finally { setLoading(false); }
  };

  const handleManageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manageForm.nombre.trim()) return;
    setLoading(true);
    try {
      if (activeTab === "categorias") {
        if (manageForm.id) {
          await actualizarCategoria({ id: manageForm.id, nombre: manageForm.nombre });
          toast.success("Categoría actualizada");
        } else {
          await crearCategoria({ nombre: manageForm.nombre });
          toast.success("Categoría creada");
        }
      } else if (activeTab === "marcas") {
        if (manageForm.id) {
          await actualizarMarca({ id: manageForm.id, nombre: manageForm.nombre });
          toast.success("Marca actualizada");
        } else {
          await crearMarca({ nombre: manageForm.nombre });
          toast.success("Marca creada");
        }
      }
      setManageForm({ id: "", nombre: "" });
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Error al guardar");
    } finally { setLoading(false); }
  };

  const handleManageDelete = async (id: string, type: "categoria" | "marca") => {
    if (!confirm(`¿Eliminar esta ${type}?`)) return;
    try {
      if (type === "categoria") await eliminarCategoria(id);
      else await eliminarMarca(id);
      toast.success("Eliminado");
      router.refresh();
    } catch (err: any) { toast.error(err.message || "Error al eliminar"); }
  };

  const openEdit = (p: Prod) => {
    setForm({ id: p.id, codigo: p.codigo, codigoBarras: p.codigoBarras, nombre: p.nombre, descripcion: p.descripcion, categoriaId: p.categoriaId, marcaId: p.marcaId, precioVenta: p.precioVenta.toString(), stock: p.stock.toString() });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este producto?")) return;
    try { await eliminarProducto(id); toast.success("Eliminado"); router.refresh(); } catch (err: any) { toast.error(err.message); }
  };

  const stockBadge = (p: Prod) => {
    if (p.stock <= 0) return "bg-red-500/10 text-red-400 border-red-500/20";
    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  };

  return (
    <div className="flex flex-col lg:flex-row gap-5 animate-fade-in">
      
      {/* Sidebar Izquierdo */}
      <div className="w-full lg:w-64 shrink-0 flex flex-col gap-4">
        <div className="glass-panel p-4 rounded-2xl">
          <h2 className="font-bold text-sm mb-3 text-muted-foreground uppercase tracking-wider">Gestión</h2>
          <div className="flex flex-col gap-1">
            <button onClick={() => setActiveTab("productos")} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === "productos" ? "bg-primary text-white" : "hover:bg-secondary text-muted-foreground"}`}><Package className="w-4 h-4" /> Productos</button>
            <button onClick={() => { setActiveTab("categorias"); setManageForm({ id: "", nombre: "" }); }} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === "categorias" ? "bg-primary text-white" : "hover:bg-secondary text-muted-foreground"}`}><Tag className="w-4 h-4" /> Categorías</button>
            <button onClick={() => { setActiveTab("marcas"); setManageForm({ id: "", nombre: "" }); }} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === "marcas" ? "bg-primary text-white" : "hover:bg-secondary text-muted-foreground"}`}><Bookmark className="w-4 h-4" /> Marcas</button>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 space-y-5 min-w-0">
        
        {activeTab === "productos" && (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h1 className="text-2xl font-bold">Catálogo de Productos</h1>
                <p className="text-sm text-muted-foreground">Administra inventario y precios</p>
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
              <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[["all","Todos"],["active","Con Stock"],["out","Agotados"]].map(([k,l]) => (
                  <button key={k} onClick={() => setFiltro(k)} className={`shrink-0 px-3 py-2 rounded-lg text-xs font-bold ${filtro === k ? "bg-primary text-white" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>{l}</button>
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
                      <th className="px-4 py-3 text-left font-bold hidden md:table-cell">Descripción</th>
                      <th className="px-4 py-3 text-left font-bold hidden sm:table-cell">Categoría</th>
                      <th className="px-4 py-3 text-right font-bold">Precio Final</th>
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
                        <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate hidden md:table-cell" title={p.descripcion}>{p.descripcion || "—"}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell">{p.categoriaNombre}</td>
                        <td className="px-4 py-3 text-right text-xs font-bold text-emerald-400">S/ {p.precioVenta.toFixed(2)}</td>
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
          </>
        )}

        {(activeTab === "categorias" || activeTab === "marcas") && (
          <div className="glass-panel p-6 rounded-2xl">
            <h2 className="text-xl font-bold mb-4">Administrar {activeTab === "categorias" ? "Categorías" : "Marcas"}</h2>
            
            <form onSubmit={handleManageSubmit} className="flex gap-3 mb-6">
              <input required value={manageForm.nombre} onChange={e => setManageForm({...manageForm, nombre: e.target.value})} placeholder={`Nombre de la ${activeTab === "categorias" ? "categoría" : "marca"}...`} className="flex-1 bg-background border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              <button disabled={loading} type="submit" className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:bg-primary/90 disabled:opacity-50">
                {manageForm.id ? "Actualizar" : "Crear"}
              </button>
              {manageForm.id && <button type="button" onClick={() => setManageForm({ id: "", nombre: "" })} className="bg-secondary text-muted-foreground px-4 py-2.5 rounded-xl text-sm font-bold hover:text-foreground">Cancelar</button>}
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {(activeTab === "categorias" ? categorias : marcas).map(item => (
                <div key={item.id} className="bg-background border border-border/30 p-4 rounded-xl flex items-center justify-between group">
                  <span className="font-medium text-sm">{item.nombre}</span>
                  <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setManageForm({ id: item.id, nombre: item.nombre })} className="p-1.5 text-muted-foreground hover:text-white bg-secondary rounded-lg"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleManageDelete(item.id, activeTab === "categorias" ? "categoria" : "marca")} className="p-1.5 text-red-400 hover:text-red-300 bg-red-500/10 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
              {(activeTab === "categorias" ? categorias : marcas).length === 0 && (
                <div className="col-span-full py-8 text-center text-muted-foreground">No hay registros</div>
              )}
            </div>
          </div>
        )}

      </div>

      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
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
                <div><label className="text-xs font-medium mb-1 block">Precio Final S/ * <span className="text-[10px] text-muted-foreground ml-1">(Inc. IGV)</span></label><input required type="number" step="0.01" value={form.precioVenta} onChange={e => setForm({...form, precioVenta: e.target.value})} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm text-emerald-400 font-bold" /></div>
                <div><label className="text-xs font-medium mb-1 block">Stock Actual</label><input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm" /></div>
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
