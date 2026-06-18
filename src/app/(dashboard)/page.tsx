"use client";
import { motion } from "framer-motion";
import { ArrowUpRight, DollarSign, Users, ShoppingBag, CreditCard } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const chartData = [
    { name: 'Lun', ventas: 4000 },
    { name: 'Mar', ventas: 3000 },
    { name: 'Mie', ventas: 2000 },
    { name: 'Jue', ventas: 2780 },
    { name: 'Vie', ventas: 1890 },
    { name: 'Sab', ventas: 2390 },
    { name: 'Dom', ventas: 3490 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-heading font-bold text-foreground">Visión General</h1>
        <div className="bg-secondary/50 px-4 py-2 rounded-full text-sm font-medium border border-border/50">
          🟢 Sistema Online (Nubefact Ok)
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Ingresos Totales", value: "S/ 45,231.89", trend: "+20.1%", icon: DollarSign, color: "text-emerald-500" },
          { title: "Comprobantes Emitidos", value: "1,204", trend: "+12.5%", icon: CreditCard, color: "text-blue-500" },
          { title: "Nuevos Clientes", value: "89", trend: "+5.2%", icon: Users, color: "text-purple-500" },
          { title: "Productos Vendidos", value: "3,422", trend: "+18.9%", icon: ShoppingBag, color: "text-orange-500" },
        ].map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            key={i} className="glass border border-border/50 p-6 rounded-2xl hover:border-primary/50 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-muted-foreground text-sm font-medium">{stat.title}</p>
                <h3 className="text-3xl font-bold font-heading mt-2 text-foreground">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-xl bg-background/50 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-emerald-500 flex items-center font-bold">
                <ArrowUpRight className="w-4 h-4 mr-1" /> {stat.trend}
              </span>
              <span className="text-muted-foreground ml-2">vs mes anterior</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl">
          <h3 className="text-xl font-heading font-bold mb-6">Flujo de Ingresos (Últimos 7 días)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `S/${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="ventas" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, fill: "var(--primary)" }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-xl font-heading font-bold mb-6">Ventas Recientes</h3>
          <div className="space-y-4">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/30 transition-colors">
                <div>
                  <p className="text-sm font-bold text-foreground">F001-00{845 + i}</p>
                  <p className="text-xs text-muted-foreground">Hace {i * 12} min</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-500">S/ {(150.5 * i).toFixed(2)}</p>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full font-bold">Pagado</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
