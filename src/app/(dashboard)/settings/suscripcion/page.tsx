import { CreditCard, CheckCircle2 } from "lucide-react";

export default function SuscripcionSettingsPage() {
  return (
    <div className="space-y-6">
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
            <li className="flex items-center text-sm"><CheckCircle2 className="w-4 h-4 mr-2 text-primary" /> 5 Usuarios incluidos</li>
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
                  <p className="text-sm font-bold">•••• •••• •••• 4242</p>
                  <p className="text-xs text-muted-foreground">Expira 12/28</p>
                </div>
              </div>
            </div>
          </div>
          <button className="text-primary text-sm font-bold mt-4 hover:underline text-left">
            Actualizar tarjeta de crédito
          </button>
        </div>
      </div>
    </div>
  );
}
