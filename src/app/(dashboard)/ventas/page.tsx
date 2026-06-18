"use client";
import { Search, ScanBarcode, User, Printer, CreditCard, Banknote, Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useState } from "react";

export default function POSPage() {
  const productosPOS = [
    { id: 1, nombre: "Laptop ThinkPad", precio: 3500, img: "LT" },
    { id: 2, nombre: "Monitor LG", precio: 850, img: "ML" },
    { id: 3, nombre: "Teclado Mecánico", precio: 420, img: "TM" },
    { id: 4, nombre: "Mouse Logitech", precio: 390, img: "ML" },
    { id: 5, nombre: "Cable HDMI 2.1", precio: 45, img: "CH" },
    { id: 6, nombre: "Memoria RAM 16GB", precio: 220, img: "MR" },
  ];

  const [carrito, setCarrito] = useState<{id: number, nombre: string, cant: number, precio: number}[]>([]);

  const addToCart = (prod: typeof productosPOS[0]) => {
    setCarrito(prev => {
      const exists = prev.find(item => item.id === prod.id);
      if (exists) {
        return prev.map(item => item.id === prod.id ? { ...item, cant: item.cant + 1 } : item);
      }
      return [...prev, { id: prod.id, nombre: prod.nombre, cant: 1, precio: prod.precio }];
    });
    toast.success(`${prod.nombre} agregado al carrito`);
  };

  const updateCant = (id: number, delta: number) => {
    setCarrito(prev => {
      const updated = prev.map(item => {
        if (item.id === id) {
          const newCant = item.cant + delta;
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

  const emitirComprobante = () => {
    if (carrito.length === 0) {
      return toast.error("El carrito está vacío", { description: "Agrega al menos un producto." });
    }
    const id = toast.loading("Generando XML para SUNAT...");
    setTimeout(() => {
      toast.success("¡Comprobante Emitido!", { id, description: "B001-000445 ha sido enviado a Nubefact." });
      setCarrito([]); // Limpiar carrito
    }, 2000);
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
                placeholder="Buscar productos en el catálogo..." 
                className="w-full bg-secondary/50 border-none rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {productosPOS.map((prod) => (
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => addToCart(prod)}
                  key={prod.id} 
                  className="glass-panel rounded-xl overflow-hidden cursor-pointer flex flex-col border border-border/50 hover:border-primary/50 transition-colors shadow-sm"
                >
                  <div className="h-24 bg-secondary/30 flex items-center justify-center text-2xl font-bold text-muted-foreground font-heading">
                    {prod.img}
                  </div>
                  <div className="p-3 bg-background/60">
                    <p className="text-sm font-bold text-foreground line-clamp-1">{prod.nombre}</p>
                    <p className="text-primary font-bold mt-1">S/ {prod.precio.toFixed(2)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Ticket / Carrito Interactivo */}
        <div className="w-full lg:w-[400px] flex flex-col bg-background/30 border border-border/50 rounded-2xl overflow-hidden shadow-2xl shadow-black/20 shrink-0">
          <div className="p-4 border-b border-border/50 bg-secondary/20 flex items-center justify-between">
            <div className="flex items-center text-sm font-bold text-foreground cursor-pointer hover:text-primary transition-colors">
              <User className="w-4 h-4 mr-2" />
              Cliente: Público en General
            </div>
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

          <div className="p-4 bg-background border-t border-border/50 space-y-3">
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
                onClick={() => toast.info("Pago en efectivo", { description: "Abriendo gaveta de dinero..." })}
                className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 py-3 rounded-xl font-bold flex items-center justify-center hover:bg-emerald-500/20 transition-colors"
              >
                <Banknote className="w-5 h-5 mr-2" /> Efectivo
              </button>
              <button 
                onClick={() => toast.info("Terminal POS", { description: "Deslice la tarjeta del cliente." })}
                className="bg-blue-500/10 text-blue-500 border border-blue-500/20 py-3 rounded-xl font-bold flex items-center justify-center hover:bg-blue-500/20 transition-colors"
              >
                <CreditCard className="w-5 h-5 mr-2" /> Tarjeta
              </button>
            </div>
            
            <button 
              onClick={emitirComprobante}
              className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-colors mt-2 shadow-[0_0_20px_rgba(var(--primary),0.3)]"
            >
              Emitir Comprobante
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
