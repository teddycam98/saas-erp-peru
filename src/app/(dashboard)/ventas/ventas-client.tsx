"use client";
import { Receipt, Trash2, Printer, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { anularVenta } from "@/actions/ventas";

export default function VentasClient({ initialData }: { initialData: any[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAnular = async (id: string) => {
    if (!confirm("¿Estás seguro de anular esta venta? Esto devolverá el stock al inventario.")) return;
    setLoadingId(id);
    try {
      await anularVenta(id);
      toast.success("Venta anulada correctamente");
      router.refresh();
    } catch (error: any) {
      toast.error("Error al anular: " + error.message);
    } finally {
      setLoadingId(null);
    }
  };

  const handleImprimir = (venta: any) => {
    // Generar ventana simple de impresión (Ticket)
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Ticket de Venta</title>
          <style>
            body { font-family: monospace; width: 300px; margin: 0 auto; text-align: center; }
            .header { font-weight: bold; font-size: 1.2em; margin-bottom: 10px; }
            .details { text-align: left; margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
            .total { font-weight: bold; font-size: 1.2em; border-top: 1px dashed #000; padding-top: 10px; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="header">MI EMPRESA</div>
          <div class="details">
            <p>Comprobante: ${venta.serie}-${venta.correlativo.toString().padStart(6, '0')}</p>
            <p>Fecha: ${new Date(venta.fechaEmision).toLocaleString()}</p>
            <p>Cliente: ${venta.clienteNombre}</p>
            <p>Cajero: ${venta.usuarioNombre}</p>
          </div>
          <div class="total">
            TOTAL: S/ ${venta.total.toFixed(2)}
          </div>
          <p>¡Gracias por su compra!</p>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-b border-border/50 pb-4">
        <h2 className="text-xl font-heading font-bold">Historial de Ventas</h2>
        <p className="text-sm text-muted-foreground">Revisa, imprime y anula los comprobantes emitidos.</p>
      </div>

      <div className="bg-background/50 border border-border/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/30 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-bold">Fecha</th>
                <th className="px-6 py-4 font-bold">Comprobante</th>
                <th className="px-6 py-4 font-bold">Cliente</th>
                <th className="px-6 py-4 font-bold">Total</th>
                <th className="px-6 py-4 font-bold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {initialData.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No hay ventas registradas aún.
                  </td>
                </tr>
              )}
              {initialData.map((venta) => (
                <tr key={venta.id} className="hover:bg-secondary/20 transition-colors group">
                  <td className="px-6 py-4">
                    {new Date(venta.fechaEmision).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold">{venta.tipoComprobante}</div>
                    <div className="text-xs text-muted-foreground font-mono">{venta.serie}-{venta.correlativo.toString().padStart(6, '0')}</div>
                  </td>
                  <td className="px-6 py-4">
                    {venta.clienteNombre}
                  </td>
                  <td className="px-6 py-4 font-bold">
                    S/ {venta.total.toFixed(2)}
                    <div className="text-xs text-muted-foreground font-normal">{venta.metodoPago}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => handleImprimir(venta)}
                        className="p-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                        title="Imprimir Ticket"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleAnular(venta.id)}
                        disabled={loadingId === venta.id}
                        className="p-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors disabled:opacity-50"
                        title="Anular Venta"
                      >
                        {loadingId === venta.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
