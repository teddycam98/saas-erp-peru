import { UserPlus, ShieldCheck } from "lucide-react";

export default function UsuariosSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border/50 pb-4">
        <div>
          <h2 className="text-xl font-heading font-bold">Usuarios y Accesos</h2>
          <p className="text-sm text-muted-foreground">Administra quién puede acceder a tu empresa y qué permisos tiene.</p>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium flex items-center">
          <UserPlus className="w-4 h-4 mr-2" />
          Invitar Usuario
        </button>
      </div>

      <div className="bg-background/50 border border-border/50 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-secondary/30 text-muted-foreground">
            <tr>
              <th className="px-6 py-4 font-bold">Usuario</th>
              <th className="px-6 py-4 font-bold">Rol</th>
              <th className="px-6 py-4 font-bold">Estado</th>
              <th className="px-6 py-4 font-bold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            <tr className="hover:bg-secondary/20">
              <td className="px-6 py-4">
                <p className="font-bold text-foreground">Administrador Principal</p>
                <p className="text-muted-foreground text-xs">admin@empresa.com</p>
              </td>
              <td className="px-6 py-4">
                <span className="flex items-center text-primary font-medium">
                  <ShieldCheck className="w-4 h-4 mr-1" /> Dueño
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-md text-xs font-bold">Activo</span>
              </td>
              <td className="px-6 py-4 text-right">
                <button className="text-muted-foreground hover:text-foreground">Editar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
