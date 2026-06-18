import { MapPin, Plus } from "lucide-react";

export default async function SucursalesPage() {
  // Placeholder estático simulando DB para la visualización de la UI
  const sucursales = [
    { id: "1", nombre: "Sede Principal (Lima)", direccion: "Av. Principal 123, Miraflores", codigoSunat: "0000" },
    { id: "2", nombre: "Sede Arequipa", direccion: "Calle Mercaderes 456, Arequipa", codigoSunat: "0001" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border/50 pb-4">
        <div>
          <h2 className="text-xl font-heading font-bold">Mis Sucursales</h2>
          <p className="text-sm text-muted-foreground">Administra los locales de venta de tu empresa.</p>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium flex items-center hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Sucursal
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {sucursales.map(suc => (
          <div key={suc.id} className="bg-background/50 border border-border/50 p-5 rounded-xl flex items-center justify-between hover:border-primary/50 transition-colors">
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="ml-4">
                <h3 className="font-bold text-base">{suc.nombre}</h3>
                <p className="text-sm text-muted-foreground">{suc.direccion}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-md font-mono border border-border">
                SUNAT: {suc.codigoSunat}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
