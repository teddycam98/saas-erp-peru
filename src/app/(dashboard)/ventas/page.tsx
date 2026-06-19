import VentasClient from "./ventas-client";
import { getVentas } from "@/actions/ventas";
import { getEmpresa } from "@/actions/empresa";

export default async function VentasPage() {
  const ventas = await getVentas();
  const empresa = await getEmpresa();

  const data = ventas.ventas.map((v: any) => ({
    id: v.id,
    fechaEmision: v.fechaEmision?.toISOString?.() || v.fechaEmision,
    tipoComprobante: v.tipoComprobante,
    serie: v.serie,
    correlativo: v.correlativo,
    clienteNombre: v.cliente?.nombre || "Público en General",
    clienteDoc: v.cliente?.numeroDocumento || "",
    total: Number(v.total),
    subtotal: Number(v.subtotal),
    igv: Number(v.igv),
    descuento: Number(v.descuento || 0),
    metodoPago: v.metodoPago || "EFECTIVO",
    estadoSunat: v.estadoSunat,
    usuarioNombre: v.usuario?.nombre || "",
    itemsCount: v.detalles?.length || 0,
    detalles: (v.detalles || []).map((d: any) => ({
      nombre: d.producto?.nombre || "Producto",
      cantidad: d.cantidad,
      precioUnitario: Number(d.precioUnitario),
      total: Number(d.total),
    })),
  }));

  return <VentasClient initialData={data} empresa={empresa} />;
}
