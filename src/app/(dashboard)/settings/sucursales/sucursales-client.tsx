"use client";
import { MapPin, Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { crearSucursal, actualizarSucursal, eliminarSucursal } from "@/actions/sucursales";

export default function SucursalesClient({ initialData }: { initialData: any[] }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nuevaSuc, setNuevaSuc] = useState<any>({ id: null, nombre: "", direccion: "", telefono: "" });

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (nuevaSuc.id) {
        await actualizarSucursal({
          id: nuevaSuc.id,
          nombre: nuevaSuc.nombre,
          direccion: nuevaSuc.direccion,
          telefono: nuevaSuc.telefono,
        });
        toast.success("Sucursal actualizada");
      } else {
        await crearSucursal({
          nombre: nuevaSuc.nombre,
          direccion: nuevaSuc.direccion,
          telefono: nuevaSuc.telefono,
        });
        toast.success("Sucursal creada");
      }
      setShowModal(false);
      setNuevaSuc({ id: null, nombre: "", direccion: "", telefono: "" });
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (suc: any) => {
    setNuevaSuc({ id: suc.id, nombre: suc.nombre, direccion: suc.direccion || "", telefono: suc.telefono || "" });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta sucursal?")) return;
    try {
      await eliminarSucursal(id);
      toast.success("Sucursal eliminada");
      router.refresh();
    } catch (error: any) {
      toast.error("Error al eliminar: " + error.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between border-b border-border/50 pb-4">
        <div>
          <h2 className="text-xl font-heading font-bold">Mis Sucursales</h2>
          <p className="text-sm text-muted-foreground">Administra los locales de venta de tu empresa.</p>
        </div>
        <button onClick={() => { setNuevaSuc({ id: null, nombre: "", direccion: "", telefono: "" }); setShowModal(true); }} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium flex items-center hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Sucursal
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {initialData.map(suc => (
          <div key={suc.id} className="bg-background/50 border border-border/50 p-5 rounded-xl flex items-center justify-between hover:border-primary/50 transition-colors group relative">
            <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => openEdit(suc)} className="text-muted-foreground hover:text-primary bg-background p-2 rounded-lg">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(suc.id)} className="text-muted-foreground hover:text-destructive bg-background p-2 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="ml-4">
                <h3 className="font-bold text-base">{suc.nombre} {suc.codigoSunat === '0000' && <span className="text-xs ml-2 bg-primary/20 text-primary px-2 py-0.5 rounded">Sede Principal</span>}</h3>
                <p className="text-sm text-muted-foreground">{suc.direccion}</p>
                {suc.telefono && <p className="text-xs text-muted-foreground mt-1">Tel: {suc.telefono}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border/50 shadow-2xl p-6 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-heading font-bold mb-4">{nuevaSuc.id ? "Editar Sucursal" : "Agregar Sucursal"}</h2>
            <form onSubmit={handleCrear} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Nombre Comercial</label>
                <input required value={nuevaSuc.nombre} onChange={e => setNuevaSuc({...nuevaSuc, nombre: e.target.value})} type="text" className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm" placeholder="Ej. Tienda Sur" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Dirección</label>
                <input required value={nuevaSuc.direccion} onChange={e => setNuevaSuc({...nuevaSuc, direccion: e.target.value})} type="text" className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Teléfono</label>
                <input value={nuevaSuc.telefono} onChange={e => setNuevaSuc({...nuevaSuc, telefono: e.target.value})} type="text" className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl font-bold mt-2 flex justify-center items-center disabled:opacity-50">
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : (nuevaSuc.id ? "Guardar Cambios" : "Guardar Sucursal")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
