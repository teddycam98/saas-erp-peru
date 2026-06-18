"use client";
import { Users, Plus, Search, Mail, Phone, MapPin, X, Pencil, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { crearCliente, actualizarCliente, eliminarCliente } from "@/actions/clientes";

export default function ClientesClient({ initialData }: { initialData: any[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nuevoCli, setNuevoCli] = useState<any>({ id: null, tipo: "DNI", doc: "", nombre: "", email: "", telf: "" });

  const filtrados = initialData.filter(c => 
    c.nombre.toLowerCase().includes(search.toLowerCase()) || 
    c.documento?.includes(search)
  );

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (nuevoCli.id) {
        await actualizarCliente(nuevoCli.id, {
          nombre: nuevoCli.nombre,
          numeroDocumento: nuevoCli.doc,
          tipoDocumento: nuevoCli.tipo,
          email: nuevoCli.email,
          telefono: nuevoCli.telf,
        });
        toast.success("Datos del cliente actualizados");
      } else {
        await crearCliente({
          nombre: nuevoCli.nombre,
          numeroDocumento: nuevoCli.doc,
          tipoDocumento: nuevoCli.tipo,
          email: nuevoCli.email,
          telefono: nuevoCli.telf,
        });
        toast.success("Cliente guardado en el CRM");
      }
      setShowModal(false);
      setNuevoCli({ id: null, tipo: "DNI", doc: "", nombre: "", email: "", telf: "" });
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Error al guardar el cliente");
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (c: any) => {
    setNuevoCli({ id: c.id, tipo: c.tipoDocumento || "DNI", doc: c.documento || "", nombre: c.nombre, email: c.email || "", telf: c.telefono || "" });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este cliente?")) return;
    try {
      await eliminarCliente(id);
      toast.success("Cliente eliminado");
      router.refresh();
    } catch (error: any) {
      toast.error("Error al eliminar: " + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Directorio de Clientes</h1>
          <p className="text-muted-foreground mt-1 text-sm">Gestiona la base de datos de tus compradores B2B/B2C.</p>
        </div>
        <button onClick={() => { setNuevoCli({ id: null, tipo: "DNI", doc: "", nombre: "", email: "", telf: "" }); setShowModal(true); }} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 flex items-center shadow-[0_0_15px_rgba(var(--primary),0.3)]">
          <Plus className="w-4 h-4 mr-2" /> Nuevo Cliente
        </button>
      </div>

      <div className="glass-panel p-4 rounded-2xl">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por DNI/RUC o Nombre..." 
            className="w-full bg-background/50 border border-border/50 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtrados.map(c => (
            <div key={c.id} className="bg-secondary/30 border border-border/50 rounded-xl p-5 hover:border-primary/50 transition-all group relative">
              <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(c)} className="text-muted-foreground hover:text-primary bg-background p-2 rounded-lg">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(c.id)} className="text-muted-foreground hover:text-destructive bg-background p-2 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                  {c.nombre.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-mono bg-background px-2 py-1 rounded-md border border-border/50">
                  {c.documento}
                </span>
              </div>
              <h3 className="font-bold text-lg text-foreground truncate pr-16">{c.nombre}</h3>
              <div className="mt-4 space-y-2">
                <p className="text-sm text-muted-foreground flex items-center"><Mail className="w-4 h-4 mr-2" /> {c.email || "Sin correo"}</p>
                <p className="text-sm text-muted-foreground flex items-center"><Phone className="w-4 h-4 mr-2" /> {c.telefono || "Sin teléfono"}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border/50 shadow-2xl p-6 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-heading font-bold mb-4">{nuevoCli.id ? "Editar Cliente" : "Agregar Cliente"}</h2>
            <form onSubmit={handleCrear} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="text-xs font-medium mb-1 block">Doc</label>
                  <select value={nuevoCli.tipo} onChange={e => setNuevoCli({...nuevoCli, tipo: e.target.value})} className="w-full bg-background border border-border/50 rounded-lg px-2 py-2 text-sm">
                    <option>DNI</option><option>RUC</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium mb-1 block">Número</label>
                  <input required value={nuevoCli.doc} onChange={e => setNuevoCli({...nuevoCli, doc: e.target.value})} type="text" className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Razón Social / Nombres</label>
                <input required value={nuevoCli.nombre} onChange={e => setNuevoCli({...nuevoCli, nombre: e.target.value})} type="text" className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Correo</label>
                <input value={nuevoCli.email} onChange={e => setNuevoCli({...nuevoCli, email: e.target.value})} type="email" className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Teléfono</label>
                <input value={nuevoCli.telf} onChange={e => setNuevoCli({...nuevoCli, telf: e.target.value})} type="text" className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl font-bold mt-2 flex justify-center items-center disabled:opacity-50">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (nuevoCli.id ? "Guardar Cambios" : "Guardar Cliente")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
