"use client";
import { Search, Plus, Minus, Trash2, ShoppingCart, Loader2, Receipt, Banknote, CreditCard, Smartphone, ArrowRightLeft } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { registrarVenta } from "@/actions/ventas";

interface Producto { id: string; nombre: string; codigo: string; descripcion?: string; precio: number; costo: number; categoriaId: string; categoriaNombre: string; img: string; imageUrl?: string; stock: number; }
interface Cliente { id: string; nombre: string; documento: string; tipoDocumento: string; }
interface Categoria { id: string; nombre: string; }
interface CartItem { id: string; nombre: string; cant: number; precio: number; stock: number; imageUrl?: string; }

const METODOS_PAGO = [
  { id: "EFECTIVO", label: "Efectivo", icon: Banknote, color: "emerald" },
  { id: "TARJETA", label: "Tarjeta", icon: CreditCard, color: "blue" },
  { id: "YAPE", label: "Yape", icon: Smartphone, color: "purple" },
  { id: "PLIN", label: "Plin", icon: Smartphone, color: "cyan" },
  { id: "TRANSFERENCIA", label: "Transfer.", icon: ArrowRightLeft, color: "orange" },
];

export default function POSClient({ productos, clientes, categorias }: { productos: Producto[]; clientes: Cliente[]; categorias: Categoria[] }) {
  const router = useRouter();
  const [carrito, setCarrito] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<string | null>(null);
  const [tipoComprobante, setTipoComprobante] = useState<"BOLETA" | "FACTURA">("BOLETA");
  const [clienteId, setClienteId] = useState<string>("");
  const [docCliente, setDocCliente] = useState("");
  const [nombreCliente, setNombreCliente] = useState("");
  const [metodoPago, setMetodoPago] = useState("EFECTIVO");
  const [montoRecibido, setMontoRecibido] = useState("");
  const [descuento, setDescuento] = useState("");
  const [loading, setLoading] = useState(false);

  const filtrados = useMemo(() => {
    return productos.filter(p => {
      const matchSearch = !search || p.nombre.toLowerCase().includes(search.toLowerCase()) || p.codigo.toLowerCase().includes(search.toLowerCase());
      const matchCat = !catFilter || p.categoriaId === catFilter;
      return matchSearch && matchCat;
    });
  }, [productos, search, catFilter]);

  const addToCart = (p: Producto) => {
    setCarrito(prev => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) {
        if (ex.cant >= p.stock) { toast.error("Stock insuficiente"); return prev; }
        return prev.map(i => i.id === p.id ? { ...i, cant: i.cant + 1 } : i);
      }
      return [...prev, { id: p.id, nombre: p.nombre, cant: 1, precio: p.precio, stock: p.stock, imageUrl: p.imageUrl }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCarrito(prev => prev.map(i => {
      if (i.id !== id) return i;
      const n = i.cant + delta;
      if (n > i.stock) { toast.error("Stock insuficiente"); return i; }
      return { ...i, cant: Math.max(0, n) };
    }).filter(i => i.cant > 0));
  };

  const removeItem = (id: string) => setCarrito(prev => prev.filter(i => i.id !== id));

  const subtotal = carrito.reduce((a, i) => a + i.cant * i.precio, 0);
  const descuentoVal = parseFloat(descuento) || 0;
  const baseGravada = subtotal - descuentoVal;
  const igv = baseGravada * 0.18;
  const total = baseGravada + igv;
  const montoRec = parseFloat(montoRecibido) || 0;
  const vuelto = metodoPago === "EFECTIVO" ? Math.max(0, montoRec - total) : 0;

  const emitir = async () => {
    if (carrito.length === 0) return toast.error("El carrito está vacío");
    if (tipoComprobante === "FACTURA" && !clienteId && (!docCliente || !nombreCliente)) {
      return toast.error("Para FACTURA ingrese RUC y Razón Social");
    }
    const montoPagado = montoRecibido ? montoRec : total;
    if (metodoPago === "EFECTIVO" && montoPagado + 0.01 < total) {
      return toast.error("El monto recibido es insuficiente");
    }
    setLoading(true);
    try {
      await registrarVenta({
        tipoComprobante,
        clienteId: clienteId || undefined,
        documentoCliente: !clienteId ? docCliente : undefined,
        nombreCliente: !clienteId ? nombreCliente : undefined,
        metodoPago: metodoPago as any,
        descuento: descuentoVal,
        detalles: carrito.map(c => ({ productoId: c.id, cantidad: c.cant, precioUnitario: c.precio })),
      });
      toast.success("¡Comprobante emitido!");
      setCarrito([]);
      setClienteId("");
      setDocCliente("");
      setNombreCliente("");
      setDescuento("");
      setMontoRecibido("");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Error al registrar venta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-3 animate-fade-in">
      {/* LEFT: Categories */}
      <div className="hidden xl:flex flex-col w-28 shrink-0 gap-1.5 overflow-y-auto pr-1">
        <button
          onClick={() => setCatFilter(null)}
          className={`px-2 py-2.5 rounded-xl text-xs font-bold text-center transition-all ${!catFilter ? "bg-primary text-white shadow-lg shadow-primary/30" : "glass-panel text-muted-foreground hover:text-foreground"}`}
        >
          Todos
        </button>
        {categorias.map(c => (
          <button
            key={c.id}
            onClick={() => setCatFilter(c.id)}
            className={`px-2 py-2.5 rounded-xl text-xs font-bold text-center transition-all truncate ${catFilter === c.id ? "bg-primary text-white shadow-lg shadow-primary/30" : "glass-panel text-muted-foreground hover:text-foreground"}`}
          >
            {c.nombre}
          </button>
        ))}
      </div>

      {/* CENTER: Products */}
      <div className="flex-1 flex flex-col min-w-0 glass rounded-2xl overflow-hidden">
        <div className="p-3 border-b border-border/50 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar producto, código o SKU..."
              className="w-full bg-secondary/50 border-none rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground/50"
            />
          </div>
          {/* Mobile cat filter */}
          <div className="flex gap-1.5 mt-2 overflow-x-auto xl:hidden pb-1">
            <button onClick={() => setCatFilter(null)} className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${!catFilter ? "bg-primary text-white" : "bg-secondary text-muted-foreground"}`}>Todos</button>
            {categorias.map(c => (
              <button key={c.id} onClick={() => setCatFilter(c.id)} className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${catFilter === c.id ? "bg-primary text-white" : "bg-secondary text-muted-foreground"}`}>{c.nombre}</button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-2.5">
            {filtrados.map(p => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                disabled={p.stock <= 0}
                className={`flex flex-col rounded-xl border transition-all text-left group ${p.stock <= 0 ? "opacity-40 cursor-not-allowed border-border/30" : "border-border/50 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.97]"}`}
              >
                <div className="h-28 bg-secondary/30 flex items-center justify-center text-lg font-bold text-muted-foreground/50 font-heading relative rounded-t-xl overflow-hidden group-hover:opacity-90 transition-opacity">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.nombre} className="w-full h-full object-cover" />
                  ) : (
                    p.img
                  )}
                  <span className={`absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold z-10 ${p.stock <= 5 ? "bg-red-500/90 text-white" : "bg-black/50 text-white backdrop-blur-md"}`}>
                    {p.stock}
                  </span>
                </div>
                <div className="p-2.5 flex-1 flex flex-col justify-between">
                  <div>
                    {p.codigo && <p className="text-[10px] font-mono text-muted-foreground mb-0.5">{p.codigo}</p>}
                    <p className="text-xs font-medium text-foreground line-clamp-2 leading-tight">{p.nombre}</p>
                    {p.descripcion && <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1" title={p.descripcion}>{p.descripcion}</p>}
                  </div>
                  <p className="text-primary font-bold text-sm mt-2">S/ {p.precio.toFixed(2)}</p>
                </div>
              </button>
            ))}
            {filtrados.length === 0 && (
              <div className="col-span-full py-16 text-center text-muted-foreground text-sm">No se encontraron productos</div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: Cart + Payment */}
      <div className="w-full sm:w-[340px] lg:w-[370px] flex flex-col glass rounded-2xl overflow-hidden shrink-0">
        {/* Boleta/Factura Toggle */}
        <div className="p-3 border-b border-border/50 space-y-2.5 shrink-0">
          <div className="grid grid-cols-2 gap-1 bg-secondary/50 p-0.5 rounded-lg">
            <button onClick={() => setTipoComprobante("BOLETA")} className={`py-1.5 text-xs font-bold rounded-md transition-all ${tipoComprobante === "BOLETA" ? "bg-primary text-white shadow" : "text-muted-foreground"}`}>BOLETA</button>
            <button onClick={() => setTipoComprobante("FACTURA")} className={`py-1.5 text-xs font-bold rounded-md transition-all ${tipoComprobante === "FACTURA" ? "bg-primary text-white shadow" : "text-muted-foreground"}`}>FACTURA</button>
          </div>
          <select
            value={clienteId}
            onChange={e => { setClienteId(e.target.value); if (e.target.value) { setDocCliente(""); setNombreCliente(""); }}}
            className="w-full bg-background border border-border/50 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">— Cliente Nuevo / General —</option>
            {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre} ({c.documento})</option>)}
          </select>
          {!clienteId && (
            <div className="grid grid-cols-2 gap-2">
              <input type="text" placeholder={tipoComprobante === "FACTURA" ? "RUC" : "DNI"} value={docCliente} onChange={e => setDocCliente(e.target.value)} className="bg-background border border-border/50 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
              <input type="text" placeholder={tipoComprobante === "FACTURA" ? "Razón Social" : "Nombre"} value={nombreCliente} onChange={e => setNombreCliente(e.target.value)} className="bg-background border border-border/50 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {carrito.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground/40 gap-2">
              <ShoppingCart className="w-10 h-10" />
              <p className="text-xs">Agrega productos al carrito</p>
            </div>
          ) : carrito.map(item => (
            <div key={item.id} className="flex items-center gap-2 p-2 bg-secondary/20 rounded-lg border border-border/30 group">
              <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                {item.imageUrl ? <img src={item.imageUrl} alt={item.nombre} className="w-full h-full object-cover" /> : <div className="text-[10px] font-bold text-muted-foreground">{item.nombre.substring(0, 2).toUpperCase()}</div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{item.nombre}</p>
                <p className="text-[10px] text-muted-foreground">S/ {item.precio.toFixed(2)} c/u</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 rounded bg-secondary flex items-center justify-center hover:bg-secondary/80 text-foreground"><Minus className="w-3 h-3" /></button>
                <span className="text-xs font-bold w-5 text-center">{item.cant}</span>
                <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 rounded bg-secondary flex items-center justify-center hover:bg-secondary/80 text-foreground"><Plus className="w-3 h-3" /></button>
              </div>
              <p className="text-xs font-bold text-foreground w-16 text-right">S/ {(item.cant * item.precio).toFixed(2)}</p>
              <button onClick={() => removeItem(item.id)} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>

        {/* Totals + Payment */}
        <div className="p-3 border-t border-border/50 space-y-2.5 bg-card/80 shrink-0 relative">
          {loading && <div className="absolute inset-0 bg-card/80 backdrop-blur-sm z-10 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground">Descuento S/</span>
            <input type="number" value={descuento} onChange={e => setDescuento(e.target.value)} placeholder="0.00" className="w-20 bg-background border border-border/50 rounded px-2 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>S/ {subtotal.toFixed(2)}</span></div>
            {descuentoVal > 0 && <div className="flex justify-between text-red-400"><span>Descuento</span><span>-S/ {descuentoVal.toFixed(2)}</span></div>}
            <div className="flex justify-between text-muted-foreground"><span>IGV (18%)</span><span>S/ {igv.toFixed(2)}</span></div>
            <div className="flex justify-between text-lg font-black text-foreground pt-1 border-t border-border/50">
              <span>TOTAL</span>
              <span className="text-primary">S/ {total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="flex gap-1.5 flex-wrap">
            {METODOS_PAGO.map(m => (
              <button
                key={m.id}
                onClick={() => setMetodoPago(m.id)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                  metodoPago === m.id 
                    ? "bg-primary text-white shadow-lg shadow-primary/30" 
                    : "bg-secondary/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                <m.icon className="w-3 h-3" />
                {m.label}
              </button>
            ))}
          </div>

          {metodoPago === "EFECTIVO" && (
            <div className="flex items-center gap-2">
              <input type="number" placeholder="Monto recibido" value={montoRecibido} onChange={e => setMontoRecibido(e.target.value)} className="flex-1 bg-background border border-border/50 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
              {montoRec > 0 && <span className="text-xs font-bold text-emerald-400">Vuelto: S/ {vuelto.toFixed(2)}</span>}
            </div>
          )}

          <button
            onClick={emitir}
            disabled={loading || carrito.length === 0}
            className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] disabled:opacity-50 disabled:shadow-none"
          >
            <Receipt className="w-4 h-4" />
            EMITIR {tipoComprobante}
          </button>
        </div>
      </div>
    </div>
  );
}
