import Link from "next/link";
import { ArrowRight, BarChart, ShieldCheck, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-transparent text-foreground selection:bg-primary/30">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 lg:px-12 glass sticky top-0 z-50 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-400 to-cyan-500 shadow-lg shadow-emerald-500/20" />
          <span className="text-xl font-bold tracking-tight">SaaS ERP</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
            Iniciar Sesión
          </Link>
          <Link href="/register" className="px-4 py-2 text-sm font-medium text-black bg-white rounded-full hover:bg-neutral-200 transition-all shadow-md">
            Crear Empresa
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center px-6 pt-32 pb-24 text-center lg:px-12">
        <div className="inline-flex items-center px-3 py-1 mb-8 text-sm font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="flex w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
          Sistema Multiempresa Listo
        </div>
        <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white to-neutral-500">
          El ERP Definitivo para Empresas de Alto Rendimiento.
        </h1>
        <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mb-10">
          Punto de Venta, Facturación Electrónica SUNAT, Inventario Multi-Sucursal y Control de Accesos en una sola plataforma ultra rápida.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/register" className="px-8 py-4 text-base font-semibold text-white bg-primary rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all flex items-center justify-center">
            Comenzar Prueba Gratis
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
          <Link href="#features" className="px-8 py-4 text-base font-semibold text-foreground bg-secondary/50 rounded-xl hover:bg-secondary transition-all backdrop-blur-md border border-border/50">
            Ver Características
          </Link>
        </div>

        {/* Feature Grid */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 max-w-6xl w-full text-left">
          <div className="p-8 rounded-3xl glass border border-border/50 hover:border-primary/50 transition-colors group">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">POS Ultra Rápido</h3>
            <p className="text-muted-foreground leading-relaxed">
              Vende en milisegundos con soporte para lector de código de barras y atajos de teclado completos.
            </p>
          </div>
          <div className="p-8 rounded-3xl glass border border-border/50 hover:border-emerald-500/50 transition-colors group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Facturación SUNAT</h3>
            <p className="text-muted-foreground leading-relaxed">
              Integración nativa e instantánea para emisión de Boletas, Facturas y Notas vinculadas a la SUNAT.
            </p>
          </div>
          <div className="p-8 rounded-3xl glass border border-border/50 hover:border-purple-500/50 transition-colors group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BarChart className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Kardex en Tiempo Real</h3>
            <p className="text-muted-foreground leading-relaxed">
              Inventario por sucursal perfectamente aislado. Conoce tu rentabilidad y stock al instante.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
