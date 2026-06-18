import VentasClient from "./ventas-client";
import { getVentas } from "@/actions/ventas";

export default async function VentasHistoryPage() {
  const ventas = await getVentas();

  // Serializar datos si es necesario (manejar Decimal)
  const ventasSerializadas = ventas.map(v => ({
    id: v.id,
    fechaEmision: v.fechaEmision,
    tipoComprobante: v.tipoComprobante,
    serie: v.serie,
    correlativo: v.correlativo,
    clienteNombre: v.cliente?.nombre || "Público en General",
    total: Number(v.total),
    metodoPago: v.metodoPago,
    usuarioNombre: v.usuario.nombre
  }));

  return <VentasClient initialData={ventasSerializadas} />;
}
