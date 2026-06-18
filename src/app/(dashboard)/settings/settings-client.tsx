"use client";
import { Building2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { actualizarEmpresa } from "@/actions/empresa";

export default function SettingsClient({ initialData }: { initialData: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    razonSocial: initialData?.razonSocial || "",
    nombreComercial: initialData?.nombreComercial || "",
    ruc: initialData?.ruc || "",
    direccion: initialData?.direccion || "",
    emailContacto: initialData?.emailContacto || "",
    telefono: initialData?.telefono || "",
  });

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialData?.id) return;
    setLoading(true);
    try {
      await actualizarEmpresa(initialData.id, data);
      toast.success("Configuración actualizada correctamente", { description: "Los cambios han sido guardados en la base de datos." });
      router.refresh();
    } catch (error: any) {
      toast.error("Error al guardar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between border-b border-border/50 pb-4">
        <div>
          <h2 className="text-xl font-heading font-bold">Datos Fiscales</h2>
          <p className="text-sm text-muted-foreground">Información general y fiscal de tu empresa.</p>
        </div>
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
          <Building2 className="w-6 h-6" />
        </div>
      </div>

      <form onSubmit={handleGuardar} className="glass border border-border/50 p-6 rounded-2xl max-w-2xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Razón Social</label>
              <input required value={data.razonSocial} onChange={e => setData({...data, razonSocial: e.target.value})} type="text" className="w-full bg-background/50 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Nombre Comercial</label>
              <input value={data.nombreComercial} onChange={e => setData({...data, nombreComercial: e.target.value})} type="text" className="w-full bg-background/50 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">RUC</label>
            <input type="text" value={data.ruc} className="w-full bg-background/50 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" disabled />
            <p className="text-xs text-muted-foreground mt-1">El RUC no puede modificarse una vez registrado.</p>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Dirección Fiscal</label>
            <input value={data.direccion} onChange={e => setData({...data, direccion: e.target.value})} type="text" className="w-full bg-background/50 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Email de Contacto</label>
              <input value={data.emailContacto} onChange={e => setData({...data, emailContacto: e.target.value})} type="email" className="w-full bg-background/50 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Teléfono Principal</label>
              <input value={data.telefono} onChange={e => setData({...data, telefono: e.target.value})} type="text" className="w-full bg-background/50 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button type="submit" disabled={loading} className="bg-primary flex items-center justify-center text-primary-foreground px-6 py-2 rounded-lg font-bold hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(var(--primary),0.3)] disabled:opacity-50">
            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
}
