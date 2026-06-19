"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, User, Mail, Lock, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { registrarEmpresa } from "@/actions/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await registrarEmpresa(formData);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push(result.redirectUrl || "/login");
      }, 2000);
    } else {
      setError(result.error || "Error al registrar la empresa");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-transparent p-4 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-2">¡Empresa Creada!</h2>
        <p className="text-muted-foreground">Tu ERP está listo. Redirigiendo al login...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent z-0" />
      
      <div className="w-full max-w-xl relative z-10 my-8">
        <div className="glass border border-border/50 p-8 rounded-3xl shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col items-center mb-8">
            <h1 className="text-2xl font-bold text-foreground">Crear Cuenta SaaS</h1>
            <p className="text-muted-foreground text-sm mt-1">Registra tu empresa y dueño principal</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Datos de Empresa</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">RUC (11 dígitos)</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input name="empresa_ruc" type="text" maxLength={11} required className="w-full bg-secondary/50 border border-border/50 rounded-xl py-2 pl-9 pr-3 text-sm focus:ring-2 focus:ring-primary/50" placeholder="20123456789" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Subdominio</label>
                  <div className="relative flex items-center">
                    <input name="subdominio" type="text" required className="w-full bg-secondary/50 border border-border/50 rounded-l-xl py-2 px-3 text-sm focus:ring-2 focus:ring-primary/50" placeholder="miempresa" />
                    <span className="bg-secondary border border-l-0 border-border/50 rounded-r-xl py-2 px-3 text-xs text-muted-foreground">.saas.com</span>
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-foreground mb-1 block">Razón Social</label>
                  <input name="empresa_razon_social" type="text" required className="w-full bg-secondary/50 border border-border/50 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-primary/50" placeholder="Mi Empresa S.A.C." />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border/50">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Usuario Principal (Owner)</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Nombre Completo</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input name="usuario_nombre" type="text" required className="w-full bg-secondary/50 border border-border/50 rounded-xl py-2 pl-9 pr-3 text-sm focus:ring-2 focus:ring-primary/50" placeholder="Juan Pérez" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input name="usuario_email" type="email" required className="w-full bg-secondary/50 border border-border/50 rounded-xl py-2 pl-9 pr-3 text-sm focus:ring-2 focus:ring-primary/50" placeholder="juan@empresa.com" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input name="usuario_password" type="password" minLength={6} required className="w-full bg-secondary/50 border border-border/50 rounded-xl py-2 pl-9 pr-3 text-sm focus:ring-2 focus:ring-primary/50" placeholder="••••••••" />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-4 bg-primary text-white font-semibold rounded-xl shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Comenzar Prueba Gratuita"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              ¿Ya tienes cuenta? <Link href="/login" className="text-primary font-medium hover:underline">Inicia Sesión</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
