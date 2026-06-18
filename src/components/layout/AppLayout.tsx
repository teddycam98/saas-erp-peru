"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Users, ShoppingCart, Box, Settings, Menu, Bell, LineChart, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

export function AppLayout({ children, domain }: { children: React.ReactNode; domain: string }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: `/` },
    { icon: ShoppingCart, label: "Ventas (POS)", href: `/ventas` },
    { icon: Box, label: "Inventario", href: `/productos` },
    { icon: Users, label: "Clientes", href: `/clientes` },
    { icon: LineChart, label: "Reportes", href: `/reportes` },
    { icon: Sparkles, label: "IA Empresarial", href: `/ia` },
    { icon: Settings, label: "Configuración", href: `/settings` },
  ];

  return (
    <div className="flex h-screen overflow-hidden text-foreground font-sans bg-transparent">
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="h-full glass border-r flex flex-col z-20 shrink-0"
          >
            <div className="h-16 flex items-center px-6 border-b border-border/50">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center mr-3 shadow-lg shadow-primary/20">
                <Box className="text-primary-foreground w-5 h-5" />
              </div>
              <h1 className="font-heading font-bold text-xl truncate">{domain}</h1>
            </div>
            
            <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
                    pathname === item.href 
                      ? 'bg-primary/10 text-primary scale-[0.98]' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80 hover:scale-[0.98]'
                  }`}
                >
                  <item.icon className={`w-5 h-5 mr-3 shrink-0 ${pathname === item.href ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                  {item.label}
                </Link>
              ))}
            </nav>
            
            <div className="p-4 border-t border-border/50">
              <div className="flex items-center glass-panel p-2 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-secondary shrink-0 flex items-center justify-center text-primary font-bold">
                  A
                </div>
                <div className="ml-3 overflow-hidden">
                  <p className="text-sm font-bold truncate">Admin</p>
                  <p className="text-xs text-muted-foreground truncate">admin@{domain}.com</p>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 glass border-b flex items-center justify-between px-6 z-10 shrink-0 sticky top-0">
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => toast("Sin notificaciones nuevas", { description: "Estás al día con tus tareas." })}
              className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-primary border-2 border-background rounded-full"></span>
            </button>

            <div className="relative">
              <button 
                onClick={() => {
                  toast("Cerrando sesión...", { duration: 1000 });
                  document.cookie = "saas_session_token=; path=/; max-age=0";
                  setTimeout(() => window.location.href = "/login", 1000);
                }}
                className="text-sm font-medium text-destructive hover:text-destructive/80 px-3 py-1.5 rounded-lg border border-destructive/20 hover:bg-destructive/10 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8 relative">
          <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
