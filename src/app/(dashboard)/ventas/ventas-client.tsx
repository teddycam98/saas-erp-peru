"use client";
import { Trash2, Printer, Loader2, Search, FileText, Eye, X } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { anularVenta } from "@/actions/ventas";

interface VentaData {
  id: string; fechaEmision: string; tipoComprobante: string; serie: string; correlativo: number;
  clienteNombre: string; clienteDoc: string; total: number; subtotal: number; igv: number; descuento: number;
  metodoPago: string; estadoSunat: string; usuarioNombre: string; itemsCount: number;
  detalles: { nombre: string; cantidad: number; precioUnitario: number; total: number }[];
}

export default function VentasClient({ initialData, empresa }: { initialData: VentaData[], empresa: any }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<string>("ALL");
  const [detalleVenta, setDetalleVenta] = useState<VentaData | null>(null);

  const filtradas = useMemo(() => {
    return initialData.filter(v => {
      const matchSearch = !search || v.clienteNombre.toLowerCase().includes(search.toLowerCase()) || v.clienteDoc.includes(search) || `${v.serie}-${v.correlativo}`.includes(search);
      const matchTipo = filtroTipo === "ALL" || v.tipoComprobante === filtroTipo;
      return matchSearch && matchTipo;
    });
  }, [initialData, search, filtroTipo]);

  const handleAnular = async (id: string) => {
    if (!confirm("¿Anular esta venta? Se devolverá el stock al inventario.")) return;
    setLoadingId(id);
    try {
      await anularVenta(id);
      toast.success("Venta anulada");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const handlePrintTicket = (v: VentaData) => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Ticket</title><style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Courier New', monospace; width: 280px; margin: 0 auto; padding: 10px; color: #000; font-size: 11px; }
      .center { text-align: center; }
      .bold { font-weight: bold; }
      .line { border-top: 1px dashed #000; margin: 6px 0; }
      .row { display: flex; justify-content: space-between; }
      .items { margin: 6px 0; }
      .item { margin-bottom: 3px; }
      h2 { font-size: 14px; margin-bottom: 2px; }
      .company-info { text-align: center; margin-bottom: 10px; }
    </style></head><body onload="window.print();window.close();">
      <div class="company-info">
        <h2 class="bold">${empresa.razonSocial || "Empresa"}</h2>
        <div>RUC: ${empresa.ruc || "00000000000"}</div>
        <div>${empresa.direccion || "Dirección no especificada"}</div>
      </div>
      <div class="line"></div>
      <div class="center"><h2>COMPROBANTE DE VENTA</h2></div>
      <div class="line"></div>
      <div class="row"><span>${v.tipoComprobante}</span><span class="bold">${v.serie}-${String(v.correlativo).padStart(8, "0")}</span></div>
      <div class="row"><span>Fecha:</span><span>${new Date(v.fechaEmision).toLocaleString()}</span></div>
      <div class="row"><span>Cliente:</span><span>${v.clienteNombre}</span></div>
      <div class="row"><span>Cajero:</span><span>${v.usuarioNombre}</span></div>
      <div class="line"></div>
      <div class="items">${v.detalles.map(d => `<div class="item"><div>${d.nombre}</div><div class="row"><span>${d.cantidad} x S/${d.precioUnitario.toFixed(2)}</span><span class="bold">S/${d.total.toFixed(2)}</span></div></div>`).join("")}</div>
      <div class="line"></div>
      <div class="row"><span>Subtotal:</span><span>S/ ${v.subtotal.toFixed(2)}</span></div>
      ${v.descuento > 0 ? `<div class="row"><span>Descuento:</span><span>-S/ ${v.descuento.toFixed(2)}</span></div>` : ""}
      <div class="row"><span>IGV (18%):</span><span>S/ ${v.igv.toFixed(2)}</span></div>
      <div class="line"></div>
      <div class="row bold" style="font-size:14px"><span>TOTAL:</span><span>S/ ${v.total.toFixed(2)}</span></div>
      <div class="line"></div>
      <div class="row"><span>Pago:</span><span>${v.metodoPago}</span></div>
      <div class="center" style="margin-top:10px;font-size:10px">¡Gracias por su compra!</div>
    </body></html>`);
    w.document.close();
  };

  const handlePrintA4 = (v: VentaData) => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>${v.tipoComprobante} ${v.serie}-${v.correlativo}</title><style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #333; font-size: 12px; }
      .header { display: flex; justify-content: space-between; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #7C3AED; }
      .company { font-size: 18px; font-weight: bold; color: #7C3AED; }
      .doc-info { text-align: right; }
      .doc-type { font-size: 16px; font-weight: bold; color: #7C3AED; border: 2px solid #7C3AED; padding: 8px 16px; display: inline-block; border-radius: 8px; }
      .doc-num { font-size: 14px; font-weight: bold; margin-top: 5px; }
      .client-info { background: #f8f8f8; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
      table { width: 100%; border-collapse: collapse; margin: 20px 0; }
      th { background: #7C3AED; color: white; padding: 10px; text-align: left; font-size: 11px; }
      td { padding: 8px 10px; border-bottom: 1px solid #eee; }
      .totals { float: right; width: 250px; }
      .totals .row { display: flex; justify-content: space-between; padding: 5px 0; }
      .totals .total { font-size: 16px; font-weight: bold; border-top: 2px solid #7C3AED; padding-top: 8px; margin-top: 5px; color: #7C3AED; }
    </style></head><body onload="window.print();">
      <div class="header">
        <div><div class="company">${empresa.razonSocial || "Empresa"}</div><div>RUC: ${empresa.ruc || "00000000000"}</div><div>${empresa.direccion || "Dirección no especificada"}</div></div>
        <div class="doc-info"><div class="doc-type">${v.tipoComprobante}</div><div class="doc-num">${v.serie}-${String(v.correlativo).padStart(8, "0")}</div><div>Fecha: ${new Date(v.fechaEmision).toLocaleDateString()}</div></div>
      </div>
      <div class="client-info"><strong>Cliente:</strong> ${v.clienteNombre} ${v.clienteDoc ? `| Doc: ${v.clienteDoc}` : ""}</div>
      <table><thead><tr><th>#</th><th>Descripción</th><th>Cant.</th><th>P.Unit.</th><th>Total</th></tr></thead>
      <tbody>${v.detalles.map((d, i) => `<tr><td>${i + 1}</td><td>${d.nombre}</td><td>${d.cantidad}</td><td>S/ ${d.precioUnitario.toFixed(2)}</td><td>S/ ${d.total.toFixed(2)}</td></tr>`).join("")}</tbody></table>
      <div class="totals">
        <div class="row"><span>Subtotal:</span><span>S/ ${v.subtotal.toFixed(2)}</span></div>
        ${v.descuento > 0 ? `<div class="row"><span>Descuento:</span><span>-S/ ${v.descuento.toFixed(2)}</span></div>` : ""}
        <div class="row"><span>IGV (18%):</span><span>S/ ${v.igv.toFixed(2)}</span></div>
        <div class="row total"><span>TOTAL:</span><span>S/ ${v.total.toFixed(2)}</span></div>
      </div>
      <div style="clear:both;padding-top:60px;text-align:center;color:#999;font-size:10px">Documento generado por ERP SaaS Perú</div>
    </body></html>`);
    w.document.close();
  };

  const estadoColor: Record<string, string> = {
    BORRADOR: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    ACEPTADO: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    ANULADO: "bg-red-500/10 text-red-400 border-red-500/20",
    ENVIADO: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    RECHAZADO: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold">Historial de Ventas</h1>
          <p className="text-sm text-muted-foreground">Comprobantes emitidos — imprime, visualiza o anula</p>
        </div>
        <div className="flex gap-2">
          {["ALL", "BOLETA", "FACTURA"].map(t => (
            <button key={t} onClick={() => setFiltroTipo(t)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filtroTipo === t ? "bg-primary text-white" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
              {t === "ALL" ? "Todas" : t}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por cliente, documento o serie..." className="w-full bg-card border border-border/50 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/30 text-muted-foreground text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left font-bold">Fecha</th>
                <th className="px-4 py-3 text-left font-bold">Comprobante</th>
                <th className="px-4 py-3 text-left font-bold">Cliente</th>
                <th className="px-4 py-3 text-center font-bold">Items</th>
                <th className="px-4 py-3 text-right font-bold">Total</th>
                <th className="px-4 py-3 text-center font-bold">Pago</th>
                <th className="px-4 py-3 text-center font-bold">Estado</th>
                <th className="px-4 py-3 text-right font-bold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filtradas.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">No hay ventas registradas</td></tr>
              )}
              {filtradas.map(v => (
                <tr key={v.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{new Date(v.fechaEmision).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-xs">{v.tipoComprobante}</span>
                    <span className="text-[10px] text-muted-foreground font-mono ml-1">{v.serie}-{String(v.correlativo).padStart(6, "0")}</span>
                  </td>
                  <td className="px-4 py-3 text-xs">{v.clienteNombre}</td>
                  <td className="px-4 py-3 text-center text-xs text-muted-foreground">{v.itemsCount}</td>
                  <td className="px-4 py-3 text-right text-xs font-bold">S/ {v.total.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center"><span className="text-[10px] bg-secondary px-2 py-0.5 rounded font-medium">{v.metodoPago}</span></td>
                  <td className="px-4 py-3 text-center"><span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${estadoColor[v.estadoSunat] || estadoColor.BORRADOR}`}>{v.estadoSunat}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => setDetalleVenta(v)} className="p-1.5 bg-secondary rounded-lg hover:bg-secondary/80" title="Ver detalle"><Eye className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handlePrintTicket(v)} className="p-1.5 bg-secondary rounded-lg hover:bg-secondary/80" title="Ticket"><Printer className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handlePrintA4(v)} className="p-1.5 bg-secondary rounded-lg hover:bg-secondary/80" title="A4"><FileText className="w-3.5 h-3.5" /></button>
                      {v.estadoSunat !== "ANULADO" && (
                        <button onClick={() => handleAnular(v.id)} disabled={loadingId === v.id} className="p-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 disabled:opacity-50" title="Anular">
                          {loadingId === v.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {detalleVenta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-card w-full max-w-lg rounded-2xl border border-border/50 shadow-2xl p-6 relative max-h-[80vh] overflow-y-auto">
            <button onClick={() => setDetalleVenta(null)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            <h2 className="text-lg font-bold mb-1">{detalleVenta.tipoComprobante} {detalleVenta.serie}-{String(detalleVenta.correlativo).padStart(6, "0")}</h2>
            <p className="text-xs text-muted-foreground mb-4">{new Date(detalleVenta.fechaEmision).toLocaleString()} · {detalleVenta.usuarioNombre}</p>
            <div className="bg-secondary/30 rounded-lg p-3 mb-4">
              <p className="text-sm font-medium">{detalleVenta.clienteNombre}</p>
              {detalleVenta.clienteDoc && <p className="text-xs text-muted-foreground">{detalleVenta.clienteDoc}</p>}
            </div>
            <table className="w-full text-xs mb-4">
              <thead><tr className="text-muted-foreground border-b border-border/50"><th className="text-left py-2">Producto</th><th className="text-center py-2">Cant</th><th className="text-right py-2">P.Unit</th><th className="text-right py-2">Total</th></tr></thead>
              <tbody>{detalleVenta.detalles.map((d, i) => (
                <tr key={i} className="border-b border-border/20"><td className="py-2">{d.nombre}</td><td className="text-center py-2">{d.cantidad}</td><td className="text-right py-2">S/ {d.precioUnitario.toFixed(2)}</td><td className="text-right py-2 font-bold">S/ {d.total.toFixed(2)}</td></tr>
              ))}</tbody>
            </table>
            <div className="space-y-1 text-xs border-t border-border/50 pt-3">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>S/ {detalleVenta.subtotal.toFixed(2)}</span></div>
              {detalleVenta.descuento > 0 && <div className="flex justify-between text-red-400"><span>Descuento</span><span>-S/ {detalleVenta.descuento.toFixed(2)}</span></div>}
              <div className="flex justify-between"><span className="text-muted-foreground">IGV 18%</span><span>S/ {detalleVenta.igv.toFixed(2)}</span></div>
              <div className="flex justify-between text-base font-bold pt-2 border-t border-border/50"><span>TOTAL</span><span className="text-primary">S/ {detalleVenta.total.toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
