"use client";
import { Users, Plus, Search, Mail, Phone, MapPin, X, Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ClientesPage() {
  const [clientes, setClientes] = useState([
    { id: 1, doc: "20100200300", tipo: "RUC", nombre: "Inversiones Acme SAC", email: "compras@acme.com", telf: "987654321" },
    { id: 2, doc: "72102030", tipo: "DNI", nombre: "Juan Pérez", email: "juan@gmail.com", telf: "912345678" },
  ]);

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [nuevoCli, setNuevoCli] = useState<any>({ id: null, tipo: "DNI", doc: "", nombre: "", email: "", telf: "" });

  const filtrados = clientes.filter(c => 
    c.nombre.toLowerCase().includes(search.toLowerCase()) || 
    c.doc.includes(search)
  );

  const handleCrear = (e: React.FormEvent) => {
    e.preventDefault();
    if (nuevoCli.id) {
      setClientes(clientes.map(c => c.id === nuevoCli.id ? { ...nuevoCli } : c));
      toast.success("Datos del cliente actualizados");
    } else {
      setClientes([{ id: clientes.length + 1, ...nuevoCli }, ...clientes]);
      toast.success("Cliente guardado en el CRM");
    }
    setShowModal(false);
    setNuevoCli({ id: null, tipo: "DNI", doc: "", nombre: "", email: "", telf: "" });
  };

  const openEdit = (c: any) => {
    setNuevoCli({ ...c });
    setShowModal(true);
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
              <button onClick={() => openEdit(c)} className="absolute top-4 right-4 text-muted-foreground hover:text-primary bg-background p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <Pencil className="w-4 h-4" />
              </button>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                  {c.nombre.charAt(0)}
                </div>
                <span className="text-xs font-mono bg-background px-2 py-1 rounded-md border border-border/50">
                  {c.tipo}: {c.doc}
                </span>
              </div>
              <h3 className="font-bold text-lg text-foreground truncate pr-8">{c.nombre}</h3>
              <div className="mt-4 space-y-2">
                <p className="text-sm text-muted-foreground flex items-center"><Mail className="w-4 h-4 mr-2" /> {c.email}</p>
                <p className="text-sm text-muted-foreground flex items-center"><Phone className="w-4 h-4 mr-2" /> {c.telf}</p>
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
                <input required value={nuevoCli.email} onChange={e => setNuevoCli({...nuevoCli, email: e.target.value})} type="email" className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Teléfono</label>
                <input required value={nuevoCli.telf} onChange={e => setNuevoCli({...nuevoCli, telf: e.target.value})} type="text" className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm" />
              </div>
              <button type="submit" className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl font-bold mt-2">
                {nuevoCli.id ? "Guardar Cambios" : "Guardar Cliente"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
