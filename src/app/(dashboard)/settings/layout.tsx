import Link from "next/link";
import { Box, MapPin, Users, CreditCard } from "lucide-react";

export default async function SettingsLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  
  const tabs = [
    { label: "General", href: `/settings`, icon: Box },
    { label: "Sucursales", href: `/settings/sucursales`, icon: MapPin },
    { label: "Usuarios y Roles", href: `/settings/usuarios`, icon: Users },
    { label: "Suscripción", href: `/settings/suscripcion`, icon: CreditCard },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Configuración</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona los parámetros, sucursales y accesos de tu empresa.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-56 shrink-0 space-y-1">
          {tabs.map(tab => (
            <Link 
              key={tab.href} 
              href={tab.href}
              className="flex items-center px-4 py-3 rounded-xl text-sm font-medium hover:bg-secondary transition-colors"
            >
              <tab.icon className="w-5 h-5 mr-3 text-primary" />
              {tab.label}
            </Link>
          ))}
        </aside>
        
        <main className="flex-1 glass-panel rounded-2xl p-6 md:p-8 min-h-[500px]">
          {children}
        </main>
      </div>
    </div>
  );
}
