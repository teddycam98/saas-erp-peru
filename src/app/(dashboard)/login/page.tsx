"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Mail, ArrowRight, Building2 } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage({ params }: { params: Promise<{ domain: string }> }) {
  const [isLoading, setIsLoading] = useState(false);
  
  // Unwrap the promise dynamically using React.use() or just handle it if it's already resolved in Next.js 15
  // We'll use a hacky visual approach here to not block the UI waiting for params if it's a simple display.
  // Assuming the user is coming to a domain, we show it generic until loaded.

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simular llamada al backend de Auth.js
    setTimeout(() => {
      // Establecer cookie real para desbloquear el Middleware
      document.cookie = "saas_session_token=authenticated_token_123; path=/; max-age=86400";
      
      setIsLoading(false);
      toast.success("¡Inicio de sesión exitoso!", {
        description: "Bienvenido de vuelta al sistema."
      });
      // Recargar para que el Middleware evalúe la ruta principal con la cookie inyectada
      window.location.href = "/";
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 glass rounded-3xl border border-white/10 shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-4 border border-primary/30 shadow-[0_0_30px_rgba(var(--primary),0.2)]">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Acceso Corporativo</h1>
          <p className="text-muted-foreground text-sm mt-2 text-center">
            Ingresa tus credenciales para acceder al ERP
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground ml-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                type="email" 
                required
                defaultValue="admin@empresa.com"
                className="w-full bg-background/50 border border-border/50 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-foreground transition-all"
                placeholder="tu@empresa.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-medium text-foreground">Contraseña</label>
              <a href="#" className="text-xs text-primary hover:underline">¿Olvidaste tu contraseña?</a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                type="password" 
                required
                defaultValue="password123"
                className="w-full bg-background/50 border border-border/50 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-foreground transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold flex items-center justify-center hover:bg-primary/90 transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(var(--primary),0.3)] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Ingresar al Sistema <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
