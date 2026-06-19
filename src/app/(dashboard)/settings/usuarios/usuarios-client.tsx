"use client";
import { User, Plus, Pencil, Trash2, X, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { crearUsuario, actualizarUsuario, eliminarUsuario } from "@/actions/usuarios";

export default function UsuariosClient({ initialData, sucursales }: { initialData: any[], sucursales: any[] }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nuevoUser, setNuevoUser] = useState<any>({ id: null, nombre: "", email: "", password: "", rol: "EMPLEADO", sucursalId: "" });

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (nuevoUser.id) {
        await actualizarUsuario({
          id: nuevoUser.id,
          nombre: nuevoUser.nombre,
          rolId: nuevoUser.rol,
          sucursalId: nuevoUser.sucursalId || null,
          password: nuevoUser.password, // Solo si escribio algo
        });
        toast.success("Usuario actualizado");
      } else {
        await crearUsuario({
          nombre: nuevoUser.nombre,
          email: nuevoUser.email,
          password: nuevoUser.password,
          rolId: nuevoUser.rol,
          sucursalId: nuevoUser.sucursalId || null,
        });
        toast.success("Usuario creado");
      }
      setShowModal(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (user: any) => {
    setNuevoUser({ id: user.id, nombre: user.nombre, email: user.email, password: "", rol: user.rol, sucursalId: user.sucursalId || "" });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return;
    try {
      await eliminarUsuario(id);
      toast.success("Usuario eliminado");
      router.refresh();
    } catch (error: any) {
      toast.error("Error al eliminar: " + error.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between border-b border-border/50 pb-4">
        <div>
          <h2 className="text-xl font-heading font-bold">Usuarios y Accesos</h2>
          <p className="text-sm text-muted-foreground">Administra el personal que usa el sistema.</p>
        </div>
        <button onClick={() => { setNuevoUser({ id: null, nombre: "", email: "", password: "", rol: "EMPLEADO", sucursalId: "" }); setShowModal(true); }} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium flex items-center hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Usuario
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {initialData.map(user => (
          <div key={user.id} className="bg-background/50 border border-border/50 p-5 rounded-xl flex flex-col hover:border-primary/50 transition-colors group relative">
            <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => openEdit(user)} className="text-muted-foreground hover:text-primary bg-background p-2 rounded-lg">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(user.id)} className="text-muted-foreground hover:text-destructive bg-background p-2 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 font-bold text-xl">
                {user.nombre.charAt(0).toUpperCase()}
              </div>
              <div className="ml-4">
                <h3 className="font-bold text-base line-clamp-1">{user.nombre}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
              <div className="flex items-center text-xs font-bold text-muted-foreground">
                <ShieldCheck className="w-3 h-3 mr-1" />
                {user.rol === "ADMIN" ? "Administrador" : "Empleado"}
              </div>
              <span className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-md font-medium border border-border/50">
                {user.sucursalNombre}
              </span>
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
            <h2 className="text-xl font-heading font-bold mb-4">{nuevoUser.id ? "Editar Usuario" : "Agregar Usuario"}</h2>
            <form onSubmit={handleCrear} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Nombre Completo</label>
                <input required value={nuevoUser.nombre} onChange={e => setNuevoUser({...nuevoUser, nombre: e.target.value})} type="text" className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Correo Electrónico (Login)</label>
                <input required disabled={!!nuevoUser.id} value={nuevoUser.email} onChange={e => setNuevoUser({...nuevoUser, email: e.target.value})} type="email" className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm disabled:opacity-50" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{nuevoUser.id ? "Nueva Contraseña (opcional)" : "Contraseña"}</label>
                <input required={!nuevoUser.id} value={nuevoUser.password} onChange={e => setNuevoUser({...nuevoUser, password: e.target.value})} type="password" minLength={6} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Rol</label>
                  <select value={nuevoUser.rol} onChange={e => setNuevoUser({...nuevoUser, rol: e.target.value})} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm">
                    <option value="EMPLEADO">Empleado (Caja)</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Sucursal Asignada</label>
                  <select value={nuevoUser.sucursalId} onChange={e => setNuevoUser({...nuevoUser, sucursalId: e.target.value})} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm">
                    <option value="">(Ninguna)</option>
                    {sucursales.map(s => (
                      <option key={s.id} value={s.id}>{s.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl font-bold mt-2 flex justify-center items-center disabled:opacity-50">
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : (nuevoUser.id ? "Guardar Cambios" : "Crear Usuario")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
