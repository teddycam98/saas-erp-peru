"use client";
import { Building2 } from "lucide-react";
import { toast } from "sonner";
import { use } from "react";

export default function SettingsGeneralPage({
  params
}: {
  params: Promise<{ domain: string }>;
}) {
  const resolvedParams = use(params);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border/50 pb-4">
        <div>
          <h2 className="text-xl font-heading font-bold">Datos Fiscales</h2>
          <p className="text-sm text-muted-foreground">Información general y fiscal de tu empresa.</p>
        </div>
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
          <Building2 className="w-6 h-6" />
        </div>
      </div>

      <form 
        onSubmit={(e) => {
          e.preventDefault();
          toast.success("Configuración actualizada correctamente", { description: "Los cambios han sido guardados en la base de datos." });
        }}
        className="glass border border-border/50 p-6 rounded-2xl max-w-2xl"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Razón Social</label>
            <input type="text" defaultValue="Acme Corporación S.A.C" className="w-full bg-background/50 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">RUC</label>
            <input type="text" defaultValue="20100200300" className="w-full bg-background/50 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" disabled />
            <p className="text-xs text-muted-foreground mt-1">El RUC no puede modificarse una vez registrado.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Moneda Principal</label>
              <select className="w-full bg-background/50 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                <option>Soles (PEN)</option>
                <option>Dólares (USD)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">IGV (%)</label>
              <input type="number" defaultValue="18" className="w-full bg-background/50 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button type="submit" className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-bold hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(var(--primary),0.3)]">
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
}
