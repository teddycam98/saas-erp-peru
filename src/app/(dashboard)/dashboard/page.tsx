import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DollarSign, ShoppingBag, Users, TrendingUp } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  
  if (!(session?.user as any)?.empresaId) {
    return <div>Acceso Denegado</div>;
  }

  // Ejemplo de consultas reales multi-tenant
  const [totalProductos, totalClientes] = await Promise.all([
    prisma.producto.count({ where: { empresaId: (session?.user as any)?.empresaId as string } }),
    prisma.cliente.count({ where: { empresaId: (session?.user as any)?.empresaId as string } })
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Ejecutivo</h1>
        <p className="text-muted-foreground mt-1">Resumen financiero y operativo de tu empresa.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
          title="Ingresos del Mes" 
          value="S/ 0.00" 
          icon={DollarSign} 
          trend="+0% vs mes pasado"
          trendUp={true}
        />
        <KpiCard 
          title="Ventas Realizadas" 
          value="0" 
          icon={ShoppingBag} 
          trend="+0% vs mes pasado"
          trendUp={true}
        />
        <KpiCard 
          title="Clientes Registrados" 
          value={totalClientes.toString()} 
          icon={Users} 
          trend="Base de datos"
          trendUp={true}
        />
        <KpiCard 
          title="Productos en Catálogo" 
          value={totalProductos.toString()} 
          icon={TrendingUp} 
          trend="Activos"
          trendUp={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass border border-border/50 rounded-2xl p-6 min-h-[400px] flex items-center justify-center">
           <p className="text-muted-foreground">Gráfico de ingresos (Próximamente con Recharts)</p>
        </div>
        <div className="glass border border-border/50 rounded-2xl p-6 min-h-[400px]">
           <h3 className="font-semibold mb-4">Actividad Reciente</h3>
           <p className="text-sm text-muted-foreground text-center mt-10">No hay movimientos recientes.</p>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon: Icon, trend, trendUp }: any) {
  return (
    <div className="glass border border-border/50 rounded-2xl p-6 hover:border-primary/30 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
      <p className="text-3xl font-bold mb-2">{value}</p>
      <p className={`text-xs font-medium ${trendUp ? "text-emerald-500" : "text-red-500"}`}>
        {trend}
      </p>
    </div>
  );
}
