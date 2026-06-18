"use client";
import { Bot, Send, User, Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function IAPage() {
  const [mensajes, setMensajes] = useState([
    { role: "ai", text: "Hola, soy tu CFO Virtual. He analizado tus operaciones de esta semana. ¿En qué te ayudo hoy?" }
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setMensajes(prev => [...prev, { role: "user", text: userText }]);
    setInput("");

    // Respuesta inteligente simulada
    setTimeout(() => {
      let aiResponse = "He cruzado los datos de las sucursales y todo parece estar en orden.";
      const lower = userText.toLowerCase();
      
      if (lower.includes("venta") || lower.includes("factura")) {
        aiResponse = "Tus ventas de hoy ascienden a S/ 4,250.00 (15 comprobantes). Un 12% más que el martes pasado. Te sugiero revisar el stock de Laptops que fueron el producto estrella.";
      } else if (lower.includes("stock") || lower.includes("inventario") || lower.includes("producto")) {
        aiResponse = "Alerta: Tienes 3 productos por debajo del stock mínimo. (Mouse Logitech, Cable HDMI). Te recomiendo emitir una Orden de Compra urgente.";
      } else if (lower.includes("cliente") || lower.includes("deuda")) {
        aiResponse = "El cliente 'Inversiones Acme SAC' concentra el 45% de tus ventas B2B. No hay deudas pendientes en facturas a crédito.";
      }

      setMensajes(prev => [...prev, { role: "ai", text: aiResponse }]);
    }, 1500);
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-6">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground flex items-center">
            IA Empresarial <Sparkles className="w-6 h-6 ml-3 text-primary" />
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Tu asistente financiero y analítico integrado.</p>
        </div>
      </div>

      <div className="flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden border border-primary/20 shadow-[0_0_30px_rgba(var(--primary),0.1)] relative">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {mensajes.map((m, i) => (
            <div key={i} className={`flex items-start ${m.role === 'user' ? 'justify-end' : ''}`}>
              {m.role === 'ai' && (
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-4 border border-primary/50 shrink-0">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
              )}
              
              <div className={`p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed ${
                m.role === 'user' 
                  ? 'bg-primary text-primary-foreground rounded-tr-sm shadow-[0_5px_15px_rgba(var(--primary),0.3)]' 
                  : 'bg-secondary/50 text-foreground rounded-tl-sm border border-border/50'
              }`}>
                {m.text}
              </div>

              {m.role === 'user' && (
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center ml-4 border border-border/50 shrink-0">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <div className="p-4 bg-background/50 border-t border-border/50 backdrop-blur-md">
          <form onSubmit={handleSend} className="relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ej: ¿Cómo van las ventas hoy? o ¿Qué productos están por agotarse?" 
              className="w-full bg-secondary/30 border border-border/50 rounded-xl pl-4 pr-12 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
            />
            <button type="submit" disabled={!input.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
