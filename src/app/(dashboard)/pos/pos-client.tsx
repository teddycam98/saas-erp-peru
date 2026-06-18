"use client";
import { Search, ScanBarcode, User, Printer, CreditCard, Banknote, Trash2, Plus, Minus, ShoppingCart, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { registrarVenta } from "@/actions/ventas";

export default function POSClient({ productos, clientes }: { productos: any[], clientes: any[] }) {
  const router = useRouter();
  const [carrito, setCarrito] = useState<{id: string, nombre: string, cant: number, precio: number, stock: number}[]>([]);
  const [search, setSearch] = useState("");
  const [clienteId, setClienteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const filtrados = productos.filter(p => p.nombre.toLowerCase().includes(search.toLowerCase()));

  const addToCart = (prod: any) => {
    if (prod.stock <= 0) {
      toast.error("Producto agotado");
      return;
    }
    setCarrito(prev => {
      const exists = prev.find(item => item.id === prod.id);
      if (exists) {
        if (exists.cant >= prod.stock) {
          toast.error("Stock insuficiente");
          return prev;
        }
        return prev.map(item => item.id === prod.id ? { ...item, cant: item.cant + 1 } : item);
      }
      return [...prev, { id: prod.id, nombre: prod.nombre, cant: 1, precio: prod.precio, stock: prod.stock }];
    });
  };

  const updateCant = (id: string, delta: number) => {
    setCarrito(prev => {
      const updated = prev.map(item => {
        if (item.id === id) {
          const newCant = item.cant + delta;
          if (newCant > item.stock) {
            toast.error("Stock insuficiente");
            return item;
          }
          return { ...item, cant: newCant > 0 ? newCant : 0 };
        }
        return item;
      }).filter(item => item.cant > 0);
      return updated;
    });
  };

  const subtotal = carrito.reduce((acc, item) => acc + (item.cant * item.precio), 0);
  const igv = subtotal * 0.18;
  const total = subtotal + igv;

  const emitirComprobante = async (metodoPago: string) => {
    if (carrito.length === 0) return toast.error("El carrito está vacío");
    setLoading(true);
    const tId = toast.loading("Registrando venta...");
    try {
      await registrarVenta({
        clienteId: clienteId || undefined,
        metodoPago,
        detalles: carrito.map(c => ({
          productoId: c.id,
          cantidad: c.cant,
          precio: c.precio
        }))
      });
      toast.success("¡Comprobante Emitido!", { id: tId, description: "La venta se guardó exitosamente y el stock fue descontado." });
      setCarrito([]);
      setClienteId(null);
      router.refresh(); // Refresh stock in server
    } catch (error: any) {
      toast.error("Error al registrar venta: " + error.message, { id: tId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-heading font-bold text-foreground">Punto de Venta (POS)</h1>
        <div className="flex space-x-2">
           <button 
             onClick={() => toast.info("Escáner no detectado", { description: "Conecta tu lector de código de barras USB." })}
             className="glass-panel text-foreground px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-secondary transition-colors"
           >
            <ScanBarcode className="w-4 h-4 mr-2" /> Escanear
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Catálogo Interactivo */}
        <div className="flex-1 flex flex-col min-h-0 bg-background/30 rounded-2xl border border-border/50 overflow-hidden">
          <div className="p-4 border-b border-border/50 bg-background/50 backdrop-blur-md">
             <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                type="text" 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar productos en el catálogo..." 
                className="w-full bg-secondary/50 border-none rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtrados.map((prod) => (
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => addToCart(prod)}
                  key={prod.id} 
                  className={`glass-panel rounded-xl overflow-hidden cursor-pointer flex flex-col border transition-colors shadow-sm ${prod.stock <= 0 ? 'opacity-50 border-destructive/50' : 'border-border/50 hover:border-primary/50'}`}
                >
                  <div className="h-24 bg-secondary/30 flex items-center justify-center text-2xl font-bold text-muted-foreground font-heading relative">
                    {prod.img}
                    <div className="absolute top-2 right-2 bg-background/80 px-2 py-0.5 rounded text-xs font-bold border border-border/50">
                      Stock: {prod.stock}
                    </div>
                  </div>
                  <div className="p-3 bg-background/60">
                    <p className="text-sm font-bold text-foreground line-clamp-1">{prod.nombre}</p>
                    <p className="text-primary font-bold mt-1">S/ {prod.precio.toFixed(2)}</p>
                  </div>
                </motion.div>
              ))}
              {filtrados.length === 0 && (
                <div className="col-span-full py-12 text-center text-muted-foreground">No se encontraron productos. Crea algunos en la pestaña Productos.</div>
              )}
            </div>
          </div>
        </div>

        {/* Ticket / Carrito Interactivo */}
        <div className="w-full lg:w-[400px] flex flex-col bg-background/30 border border-border/50 rounded-2xl overflow-hidden shadow-2xl shadow-black/20 shrink-0">
          <div className="p-4 border-b border-border/50 bg-secondary/20 flex flex-col gap-2">
            <label className="text-xs text-muted-foreground font-medium">Cliente:</label>
            <select 
              value={clienteId || ""} 
              onChange={e => setClienteId(e.target.value || null)}
              className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Público en General</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nombre} ({c.documento})</option>
              ))}
            </select>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {carrito.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <ShoppingCart className="w-12 h-12 mb-3 opacity-20" />
                <p>Carrito vacío</p>
              </div>
            ) : carrito.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-3 glass rounded-lg border border-border/30 group">
                <div className="flex-1">
                  <p className="font-bold text-sm text-foreground">{item.nombre}</p>
                  <div className="flex items-center mt-2 space-x-2">
                    <button onClick={() => updateCant(item.id, -1)} className="w-6 h-6 rounded bg-secondary flex items-center justify-center hover:bg-secondary/80"><Minus className="w-3 h-3" /></button>
                    <span className="text-sm font-bold w-4 text-center">{item.cant}</span>
                    <button onClick={() => updateCant(item.id, 1)} className="w-6 h-6 rounded bg-secondary flex items-center justify-center hover:bg-secondary/80"><Plus className="w-3 h-3" /></button>
                    <span className="text-xs text-muted-foreground ml-2">x S/ {item.precio.toFixed(2)}</span>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <p className="font-bold text-foreground text-sm">S/ {(item.cant * item.precio).toFixed(2)}</p>
                  <button onClick={() => updateCant(item.id, -item.cant)} className="text-destructive mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-background border-t border-border/50 space-y-3 relative">
            {loading && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>S/ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>IGV (18%)</span>
              <span>S/ {igv.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-2xl font-heading font-black text-foreground pt-2 border-t border-border/50">
              <span>Total</span>
              <span className="text-primary">S/ {total.toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <button 
                disabled={loading || carrito.length === 0}
                onClick={() => emitirComprobante("EFECTIVO")}
                className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 py-3 rounded-xl font-bold flex items-center justify-center hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
              >
                <Banknote className="w-5 h-5 mr-2" /> Efectivo
              </button>
              <button 
                disabled={loading || carrito.length === 0}
                onClick={() => emitirComprobante("TARJETA")}
                className="bg-blue-500/10 text-blue-500 border border-blue-500/20 py-3 rounded-xl font-bold flex items-center justify-center hover:bg-blue-500/20 transition-colors disabled:opacity-50"
              >
                <CreditCard className="w-5 h-5 mr-2" /> Tarjeta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
