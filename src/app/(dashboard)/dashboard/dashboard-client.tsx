"use client";
import { DollarSign, ShoppingBag, Users, AlertTriangle, TrendingUp, Package } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface DashboardData {
  ventasHoy: { count: number; total: number };
  ventasSemana: { count: number; total: number };
  ventasMes: { count: number; total: number };
  topProductos: { productoId: string; nombre: string; cantidadVendida: number; totalVendido: number }[];
  topClientes: { clienteId: string; nombre: string; totalGastado: number; cantidadCompras: number }[];
  stockCritico: { productoId: string; nombre: string; stockActual: number; stockMinimo: number; sucursalNombre: string }[];
  ventasPorDia: { fecha: string; total: number; cantidad: number }[];
}

function KpiCard({ title, value, subtitle, icon: Icon, color }: { title: string; value: string; subtitle: string; icon: any; color: string }) {
  const colors: Record<string, string> = {
    violet: "bg-violet-500/10 text-violet-400",
    blue: "bg-blue-500/10 text-blue-400",
    emerald: "bg-emerald-500/10 text-emerald-400",
    amber: "bg-amber-500/10 text-amber-400",
  };
  return (
    <div className="glass-panel rounded-2xl p-5 hover:border-primary/30 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</span>
        <div className={`w-9 h-9 rounded-xl ${colors[color] || colors.violet} flex items-center justify-center`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-black text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
    </div>
  );
}

export default function DashboardClient({ data }: { data: DashboardData }) {
  const chartData = data.ventasPorDia.map(d => ({
    ...d,
    fechaCorta: d.fecha.slice(5), // MM-DD
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Dashboard Ejecutivo</h1>
        <p className="text-sm text-muted-foreground">Resumen financiero y operativo</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Ventas Hoy" value={`S/ ${data.ventasHoy.total.toFixed(2)}`} subtitle={`${data.ventasHoy.count} comprobantes`} icon={DollarSign} color="violet" />
        <KpiCard title="Ventas del Mes" value={`S/ ${data.ventasMes.total.toFixed(2)}`} subtitle={`${data.ventasMes.count} comprobantes`} icon={ShoppingBag} color="blue" />
        <KpiCard title="Ventas Semana" value={`S/ ${data.ventasSemana.total.toFixed(2)}`} subtitle={`${data.ventasSemana.count} comprobantes`} icon={TrendingUp} color="emerald" />
        <KpiCard title="Stock Crítico" value={data.stockCritico.length.toString()} subtitle="productos bajo mínimo" icon={AlertTriangle} color="amber" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-5">
          <h3 className="text-sm font-bold text-foreground mb-4">Ingresos últimos 30 días</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 25% 18%)" />
                <XAxis dataKey="fechaCorta" tick={{ fontSize: 10, fill: "hsl(220 15% 60%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(220 15% 60%)" }} axisLine={false} tickLine={false} tickFormatter={v => `S/${v}`} />
                <Tooltip
                  contentStyle={{ background: "hsl(222 40% 11%)", border: "1px solid hsl(222 25% 18%)", borderRadius: "12px", fontSize: "12px" }}
                  labelStyle={{ color: "hsl(210 20% 95%)" }}
                  formatter={(value: any) => [`S/ ${Number(value).toFixed(2)}`, "Total"]}
                />
                <Area type="monotone" dataKey="total" stroke="#7C3AED" fillOpacity={1} fill="url(#colorTotal)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="glass-panel rounded-2xl p-5">
          <h3 className="text-sm font-bold text-foreground mb-4">Top Productos del Mes</h3>
          {data.topProductos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground/40">
              <Package className="w-8 h-8 mb-2" />
              <p className="text-xs">Sin datos aún</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.topProductos.map((p, i) => (
                <div key={p.productoId} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{p.nombre}</p>
                    <p className="text-[10px] text-muted-foreground">{p.cantidadVendida} vendidos</p>
                  </div>
                  <span className="text-xs font-bold text-primary">S/ {p.totalVendido.toFixed(0)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Clients */}
        <div className="glass-panel rounded-2xl p-5">
          <h3 className="text-sm font-bold text-foreground mb-4">Top Clientes del Mes</h3>
          {data.topClientes.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">Sin datos aún</p>
          ) : (
            <div className="space-y-2.5">
              {data.topClientes.map((c, i) => (
                <div key={c.clienteId} className="flex items-center gap-3 p-2.5 bg-secondary/20 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold flex items-center justify-center shrink-0">{c.nombre.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{c.nombre}</p>
                    <p className="text-[10px] text-muted-foreground">{c.cantidadCompras} compras</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">S/ {c.totalGastado.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stock Alerts */}
        <div className="glass-panel rounded-2xl p-5">
          <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Alertas de Stock
          </h3>
          {data.stockCritico.length === 0 ? (
            <p className="text-xs text-emerald-400 text-center py-8">✓ Todos los productos tienen stock suficiente</p>
          ) : (
            <div className="space-y-2 max-h-52 overflow-y-auto">
              {data.stockCritico.slice(0, 10).map(s => (
                <div key={s.productoId} className="flex items-center gap-3 p-2.5 bg-red-500/5 border border-red-500/10 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{s.nombre}</p>
                    <p className="text-[10px] text-muted-foreground">{s.sucursalNombre}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-red-400">{s.stockActual} uds</p>
                    <p className="text-[10px] text-muted-foreground">min: {s.stockMinimo}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
