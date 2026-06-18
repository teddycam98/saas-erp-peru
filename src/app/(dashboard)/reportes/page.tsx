"use client";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Download, FileSpreadsheet, FileText, TrendingUp, DollarSign } from 'lucide-react';

export default function ReportesPage() {
  const dataVentas = [
    { name: 'Ene', ingresos: 4000, gastos: 2400 },
    { name: 'Feb', ingresos: 3000, gastos: 1398 },
    { name: 'Mar', ingresos: 9800, gastos: 2000 },
    { name: 'Abr', ingresos: 3908, gastos: 2780 },
    { name: 'May', ingresos: 4800, gastos: 1890 },
    { name: 'Jun', ingresos: 3800, gastos: 2390 },
  ];

  const dataCategorias = [
    { name: 'Laptops', ventas: 400 },
    { name: 'Monitores', ventas: 300 },
    { name: 'Teclados', ventas: 300 },
    { name: 'Mouse', ventas: 200 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Analítica y Reportes</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Métricas clave, gráficos y exportación contable.
          </p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => {
              const id = toast.loading("Generando Excel...");
              setTimeout(() => {
                const csvData = "Fecha,Ingresos,Egresos\n2023-10-01,1500,500\n2023-10-02,2300,400";
                const blob = new Blob([csvData], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'Reporte_Financiero.csv';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                toast.success("¡Reporte_Financiero.csv descargado!", { id });
              }, 1500);
            }}
            className="glass-panel text-foreground px-4 py-2 rounded-lg font-medium hover:bg-secondary transition-colors flex items-center shadow-sm"
          >
            <Download className="w-4 h-4 mr-2" /> Exportar Excel
          </button>
          <button 
            onClick={() => {
              const id = toast.loading("Generando PDF...");
              setTimeout(() => {
                const blob = new Blob(["Simulación de Documento PDF - ERP SaaS Multiempresa"], { type: 'text/plain' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'Reporte_Financiero.pdf';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                toast.success("¡Reporte_Financiero.pdf descargado!", { id });
              }, 2000);
            }}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(var(--primary),0.4)] flex items-center"
          >
            <FileText className="w-4 h-4 mr-2 text-white" /> Reporte PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel rounded-2xl p-6 border border-border/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading font-bold text-lg">Flujo de Caja (Últimos 6 meses)</h3>
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataVentas} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `S/${value}`} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="ingresos" stroke="hsl(255, 85%, 65%)" strokeWidth={3} dot={{ r: 4, fill: "hsl(255, 85%, 65%)" }} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="gastos" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: "#ef4444" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-border/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading font-bold text-lg">Ventas por Categoría</h3>
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataCategorias} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Bar dataKey="ventas" fill="hsl(255, 85%, 65%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
