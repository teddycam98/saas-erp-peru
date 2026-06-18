"use client";
import { CreditCard, CheckCircle2, X, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function SuscripcionClient() {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tarjeta, setTarjeta] = useState("4242");

  const handleUpdateCard = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowModal(false);
      const rand = Math.floor(1000 + Math.random() * 9000);
      setTarjeta(rand.toString());
      toast.success("Tarjeta actualizada", { description: "Su nueva tarjeta ha sido configurada en Culqi exitosamente." });
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-b border-border/50 pb-4">
        <h2 className="text-xl font-heading font-bold">Suscripción y Facturación</h2>
        <p className="text-sm text-muted-foreground">Gestiona tu plan del SaaS ERP y método de pago (Vía Culqi).</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass border border-primary/50 p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
            Plan Actual
          </div>
          <h3 className="text-2xl font-bold font-heading">Plan Profesional</h3>
          <p className="text-muted-foreground text-sm mt-1">S/ 99.00 mensuales</p>
          
          <ul className="mt-6 space-y-3">
            <li className="flex items-center text-sm"><CheckCircle2 className="w-4 h-4 mr-2 text-primary" /> Sucursales Ilimitadas</li>
            <li className="flex items-center text-sm"><CheckCircle2 className="w-4 h-4 mr-2 text-primary" /> Usuarios ilimitados</li>
            <li className="flex items-center text-sm"><CheckCircle2 className="w-4 h-4 mr-2 text-primary" /> Facturación SUNAT</li>
            <li className="flex items-center text-sm"><CheckCircle2 className="w-4 h-4 mr-2 text-primary" /> Soporte Prioritario</li>
          </ul>

          <button className="w-full mt-6 bg-secondary text-foreground py-2.5 rounded-lg font-bold hover:bg-secondary/80 transition-colors">
            Cambiar Plan
          </button>
        </div>

        <div className="glass border border-border/50 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold font-heading flex items-center">
              <CreditCard className="w-5 h-5 mr-2" /> Método de Pago
            </h3>
            <div className="mt-4 p-4 bg-background/50 rounded-xl border border-border/50 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-6 bg-white rounded flex items-center justify-center text-[10px] font-black text-blue-900 mr-3">VISA</div>
                <div>
                  <p className="text-sm font-bold">•••• •••• •••• {tarjeta}</p>
                  <p className="text-xs text-muted-foreground">Expira 12/28</p>
                </div>
              </div>
            </div>
          </div>
          <button onClick={() => setShowModal(true)} className="text-primary text-sm font-bold mt-4 hover:underline text-left">
            Actualizar tarjeta de crédito
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border/50 shadow-2xl p-6 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-heading font-bold mb-4">Actualizar Tarjeta</h2>
            <form onSubmit={handleUpdateCard} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Número de Tarjeta</label>
                <input required type="text" maxLength={16} minLength={16} placeholder="4242 4242 4242 4242" className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-mono" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">MM/YY</label>
                  <input required type="text" maxLength={5} placeholder="12/28" className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-mono" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">CVC</label>
                  <input required type="password" maxLength={4} placeholder="***" className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-mono" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl font-bold mt-4 flex justify-center items-center disabled:opacity-50">
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Guardar Tarjeta Segura"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
