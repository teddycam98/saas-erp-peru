"use client";
import { Users, Plus, Search, X, Pencil, Trash2, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { crearCliente, actualizarCliente, eliminarCliente } from "@/actions/clientes";

interface Cli { id: string; nombre: string; tipoDocumento: string; documento: string; email: string; telefono: string; direccion: string; }

const emptyForm = { id: "", tipo: "DNI", doc: "", nombre: "", email: "", telefono: "", direccion: "" };

export default function ClientesClient({ initialData }: { initialData: Cli[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const filtrados = useMemo(() => {
    if (!search) return initialData;
    const s = search.toLowerCase();
    return initialData.filter(c => c.nombre.toLowerCase().includes(s) || c.documento.includes(s) || c.email.toLowerCase().includes(s));
  }, [initialData, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { nombre: form.nombre, tipoDocumento: form.tipo, numeroDocumento: form.doc, email: form.email || undefined, telefono: form.telefono || undefined, direccion: form.direccion || undefined };
      if (form.id) { await actualizarCliente({ id: form.id, ...payload as any }); toast.success("Cliente actualizado"); }
      else { await crearCliente(payload as any); toast.success("Cliente creado"); }
      setShowModal(false);
      setForm(emptyForm);
      router.refresh();
    } catch (err: any) { toast.error(err.message); } finally { setLoading(false); }
  };

  const openEdit = (c: Cli) => {
    setForm({ id: c.id, tipo: c.tipoDocumento, doc: c.documento, nombre: c.nombre, email: c.email, telefono: c.telefono, direccion: c.direccion });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este cliente?")) return;
    try { await eliminarCliente(id); toast.success("Eliminado"); router.refresh(); } catch (err: any) { toast.error(err.message); }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold">Directorio de Clientes</h1>
          <p className="text-sm text-muted-foreground">Gestiona tu base de datos de clientes B2B/B2C</p>
        </div>
        <button onClick={() => { setForm(emptyForm); setShowModal(true); }} className="bg-primary text-white px-4 py-2 rounded-xl font-medium text-sm hover:bg-primary/90 shadow-[0_0_15px_rgba(124,58,237,0.3)] flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nuevo Cliente
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por DNI/RUC, nombre o email..." className="w-full bg-card border border-border/50 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/30 text-muted-foreground text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left font-bold">Tipo</th>
                <th className="px-4 py-3 text-left font-bold">Documento</th>
                <th className="px-4 py-3 text-left font-bold">Nombre / Razón Social</th>
                <th className="px-4 py-3 text-left font-bold">Email</th>
                <th className="px-4 py-3 text-left font-bold">Teléfono</th>
                <th className="px-4 py-3 text-center font-bold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filtrados.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No se encontraron clientes</td></tr>}
              {filtrados.map(c => (
                <tr key={c.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3"><span className="text-[10px] bg-secondary px-2 py-0.5 rounded font-bold">{c.tipoDocumento}</span></td>
                  <td className="px-4 py-3 font-mono text-xs">{c.documento}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">{c.nombre.charAt(0).toUpperCase()}</div>
                      <span className="text-xs font-medium">{c.nombre}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{c.email || "—"}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{c.telefono || "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-1">
                      <button onClick={() => openEdit(c)} className="p-1.5 bg-secondary rounded-lg hover:bg-secondary/80"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20"><Trash2 className="w-3.5 h-3.5" /></button>
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
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            <h2 className="text-lg font-bold mb-4">{form.id ? "Editar Cliente" : "Nuevo Cliente"}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div><label className="text-xs font-medium mb-1 block">Tipo Doc</label><select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})} className="w-full bg-background border border-border/50 rounded-lg px-2 py-2 text-sm"><option>DNI</option><option>RUC</option><option>CE</option><option>PASAPORTE</option></select></div>
                <div className="col-span-2"><label className="text-xs font-medium mb-1 block">Número *</label><input required value={form.doc} onChange={e => setForm({...form, doc: e.target.value})} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm" /></div>
              </div>
              <div><label className="text-xs font-medium mb-1 block">Nombre / Razón Social *</label><input required value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="text-xs font-medium mb-1 block">Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium mb-1 block">Teléfono</label><input value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="text-xs font-medium mb-1 block">Dirección</label><input value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm" /></div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-primary text-white py-2.5 rounded-xl font-bold text-sm mt-2 flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-primary/90 shadow-[0_0_15px_rgba(124,58,237,0.3)]">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (form.id ? "Guardar Cambios" : "Crear Cliente")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
