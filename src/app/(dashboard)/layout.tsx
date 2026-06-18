"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingCart, Package, Users, Settings, LogOut, Receipt } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  
  const domain = session?.user?.subdominio || "Cargando...";

  const routes = [
    { name: "Dashboard", href: `/dashboard`, icon: LayoutDashboard },
    { name: "Punto de Venta", href: `/pos`, icon: ShoppingCart },
    { name: "Catálogo", href: `/productos`, icon: Package },
    { name: "Clientes", href: `/clientes`, icon: Users },
    { name: "Ventas", href: `/ventas`, icon: Receipt },
    { name: "Configuración", href: `/settings`, icon: Settings },
  ];

  if (status === "loading") {
    return <div className="h-screen w-full flex items-center justify-center">Cargando...</div>;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar Fijo */}
      <aside className="w-64 glass border-r border-border/50 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-border/50">
          <div className="w-6 h-6 rounded bg-primary mr-3" />
          <span className="font-bold tracking-tight truncate">{domain}.saas.com</span>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {routes.map((r) => {
            const isActive = pathname === r.href;
            return (
              <Link 
                key={r.href} 
                href={r.href}
                className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                }`}
              >
                <r.icon className={`w-5 h-5 mr-3 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                {r.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/50">
          <button 
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-500 rounded-xl hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="h-16 glass border-b border-border/50 flex items-center justify-between px-6 lg:hidden">
           <span className="font-bold">{domain}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
