import { getDashboardData } from "@/actions/reportes";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  let data;
  try {
    data = await getDashboardData();
  } catch {
    data = null;
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No se pudo cargar el dashboard. Verifica tu sesión.</p>
      </div>
    );
  }

  return <DashboardClient data={data} />;
}
