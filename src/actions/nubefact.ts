"use server";
import { prisma } from "@/lib/prisma";

const NUBEFACT_URL = "https://api.nubefact.com/api/v1/ingreso";

export async function emitirComprobanteNubefact(ventaId: string) {
  try {
    const venta = await prisma.venta.findUnique({
      where: { id: ventaId },
      include: {
        empresa: true,
        cliente: true,
        detalles: { include: { producto: true } }
      }
    });

    if (!venta || !venta.empresa.nubefactToken) throw new Error("Faltan datos o token");

    const payload = {
      operacion: "generar_comprobante",
      tipo_de_comprobante: venta.tipoComprobante === "BOLETA" ? 2 : 1,
      serie: venta.serie,
      numero: venta.correlativo,
      sunat_transaction: 1,
      cliente_tipo_de_documento: venta.cliente?.tipoDocumento === "DNI" ? 1 : 6,
      cliente_numero_de_documento: venta.cliente?.numeroDocumento,
      cliente_denominacion: venta.cliente?.nombre,
      cliente_direccion: venta.cliente?.direccion,
      fecha_de_emision: new Date().toISOString().split('T')[0],
      moneda: 1, // Soles
      porcentaje_de_igv: 18.00,
      total_igv: Number(venta.igv),
      total_gravada: Number(venta.subtotal),
      total: Number(venta.total),
      items: venta.detalles.map(det => ({
        unidad_de_medida: "NIU",
        codigo: det.producto.codigo,
        descripcion: det.producto.nombre,
        cantidad: det.cantidad,
        valor_unitario: Number(det.precioUnitario) / 1.18,
        precio_unitario: Number(det.precioUnitario),
        subtotal: (Number(det.total) / 1.18),
        tipo_de_igv: 1,
        igv: (Number(det.total) - (Number(det.total) / 1.18)),
        total: Number(det.total),
        anticipo_regularizacion: false
      }))
    };

    const response = await fetch(venta.empresa.nubefactUrl || NUBEFACT_URL, {
      method: "POST",
      headers: {
        "Authorization": `Token token="${venta.empresa.nubefactToken}"`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (data.errors) throw new Error(data.errors);

    // Actualizamos el estado del comprobante con la respuesta de SUNAT/Nubefact
    await prisma.venta.update({
      where: { id: ventaId },
      data: {
        estadoSunat: data.aceptada_por_sunat ? "ACEPTADO" : "ENVIADO",
        xmlUrl: data.enlace_del_xml,
        pdfUrl: data.enlace_del_pdf,
        cdrUrl: data.enlace_del_cdr,
        
      }
    });

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
