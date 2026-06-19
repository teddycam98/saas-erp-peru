"use server";

import { prisma } from "@/lib/prisma";
import { getSessionData } from "@/lib/auth-utils";
import { Prisma } from "@prisma/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface VentasPorDia {
  fecha: string; // YYYY-MM-DD
  total: number;
  cantidad: number;
}

interface TopProducto {
  productoId: string;
  nombre: string;
  codigo: string | null;
  cantidadVendida: number;
  totalVendido: number;
}

interface TopCliente {
  clienteId: string;
  nombre: string;
  numeroDocumento: string;
  totalGastado: number;
  cantidadCompras: number;
}

interface StockCritico {
  productoId: string;
  nombre: string;
  codigo: string | null;
  stockActual: number;
  stockMinimo: number;
  sucursalNombre: string;
}

export interface DashboardData {
  ventasHoy: { count: number; total: number };
  ventasSemana: { count: number; total: number };
  ventasMes: { count: number; total: number };
  topProductos: TopProducto[];
  topClientes: TopCliente[];
  stockCritico: StockCritico[];
  ventasPorDia: VentasPorDia[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sunday
  const diff = day === 0 ? 6 : day - 1; // Monday-based week
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth(date: Date): Date {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export async function getDashboardData(): Promise<DashboardData> {
  const { empresaId, sucursalId } = await getSessionData();

  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = startOfWeek(now);
  const monthStart = startOfMonth(now);
  const thirtyDaysAgo = daysAgo(30);

  // Base filter: active (non-anulado) sales for this empresa
  const baseWhere: Prisma.VentaWhereInput = {
    empresaId,
    deletedAt: null,
    estadoSunat: { not: "ANULADO" },
  };

  // -------------------------------------------------------------------------
  // 1. Ventas aggregates (today, week, month)
  // -------------------------------------------------------------------------
  const [ventasHoyAgg, ventasSemanaAgg, ventasMesAgg] = await Promise.all([
    prisma.venta.aggregate({
      where: { ...baseWhere, fechaEmision: { gte: todayStart } },
      _count: true,
      _sum: { total: true },
    }),
    prisma.venta.aggregate({
      where: { ...baseWhere, fechaEmision: { gte: weekStart } },
      _count: true,
      _sum: { total: true },
    }),
    prisma.venta.aggregate({
      where: { ...baseWhere, fechaEmision: { gte: monthStart } },
      _count: true,
      _sum: { total: true },
    }),
  ]);

  // -------------------------------------------------------------------------
  // 2. Top 5 Productos (by quantity sold this month)
  // -------------------------------------------------------------------------
  const ventasMesIds = await prisma.venta.findMany({
    where: { ...baseWhere, fechaEmision: { gte: monthStart } },
    select: { id: true },
  });
  const ventaIds = ventasMesIds.map((v) => v.id);

  const topProductosRaw = await prisma.ventaDetalle.groupBy({
    by: ["productoId"],
    where: { ventaId: { in: ventaIds } },
    _sum: { cantidad: true, total: true },
    orderBy: { _sum: { cantidad: "desc" } },
    take: 5,
  });

  const topProductoIds = topProductosRaw.map((p) => p.productoId);
  const productosMap = new Map(
    (
      await prisma.producto.findMany({
        where: { id: { in: topProductoIds } },
        select: { id: true, nombre: true, codigo: true },
      })
    ).map((p) => [p.id, p])
  );

  const topProductos: TopProducto[] = topProductosRaw.map((p) => {
    const prod = productosMap.get(p.productoId);
    return {
      productoId: p.productoId,
      nombre: prod?.nombre ?? "Producto eliminado",
      codigo: prod?.codigo ?? null,
      cantidadVendida: p._sum.cantidad ?? 0,
      totalVendido: Number(p._sum.total ?? 0),
    };
  });

  // -------------------------------------------------------------------------
  // 3. Top 5 Clientes (by total spent this month)
  // -------------------------------------------------------------------------
  const ventasMesConCliente = await prisma.venta.findMany({
    where: {
      ...baseWhere,
      fechaEmision: { gte: monthStart },
      clienteId: { not: null },
    },
    select: { clienteId: true, total: true },
  });

  const clienteTotals = new Map<
    string,
    { total: number; count: number }
  >();

  for (const v of ventasMesConCliente) {
    if (!v.clienteId) continue;
    const existing = clienteTotals.get(v.clienteId) ?? {
      total: 0,
      count: 0,
    };
    existing.total += Number(v.total);
    existing.count += 1;
    clienteTotals.set(v.clienteId, existing);
  }

  const sortedClientes = Array.from(clienteTotals.entries())
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5);

  const clienteIds = sortedClientes.map(([id]) => id);
  const clientesMap = new Map(
    (
      await prisma.cliente.findMany({
        where: { id: { in: clienteIds } },
        select: { id: true, nombre: true, numeroDocumento: true },
      })
    ).map((c) => [c.id, c])
  );

  const topClientes: TopCliente[] = sortedClientes.map(([id, data]) => {
    const cli = clientesMap.get(id);
    return {
      clienteId: id,
      nombre: cli?.nombre ?? "Cliente eliminado",
      numeroDocumento: cli?.numeroDocumento ?? "",
      totalGastado: Math.round(data.total * 100) / 100,
      cantidadCompras: data.count,
    };
  });

  // -------------------------------------------------------------------------
  // 4. Stock Crítico (stock < stockMinimo)
  // -------------------------------------------------------------------------
  const inventarioCritico = await prisma.inventarioSucursal.findMany({
    where: {
      sucursal: { empresaId, deletedAt: null },
      producto: { empresaId, deletedAt: null, stockMinimo: { gt: 0 } },
    },
    include: {
      producto: { select: { id: true, nombre: true, codigo: true, stockMinimo: true } },
      sucursal: { select: { nombre: true } },
    },
  });

  const stockCritico: StockCritico[] = inventarioCritico
    .filter((inv) => inv.stockActual < inv.producto.stockMinimo)
    .map((inv) => ({
      productoId: inv.producto.id,
      nombre: inv.producto.nombre,
      codigo: inv.producto.codigo,
      stockActual: inv.stockActual,
      stockMinimo: inv.producto.stockMinimo,
      sucursalNombre: inv.sucursal.nombre,
    }))
    .sort((a, b) => a.stockActual - a.stockMinimo - (b.stockActual - b.stockMinimo));

  // -------------------------------------------------------------------------
  // 5. Ventas por día (last 30 days)
  // -------------------------------------------------------------------------
  const ventasUltimos30 = await prisma.venta.findMany({
    where: {
      ...baseWhere,
      fechaEmision: { gte: thirtyDaysAgo },
    },
    select: { fechaEmision: true, total: true },
    orderBy: { fechaEmision: "asc" },
  });

  // Aggregate by day
  const dayMap = new Map<string, { total: number; count: number }>();

  // Pre-fill all 30 days
  for (let i = 30; i >= 0; i--) {
    const d = daysAgo(i);
    dayMap.set(formatDateKey(d), { total: 0, count: 0 });
  }

  for (const v of ventasUltimos30) {
    const key = formatDateKey(v.fechaEmision);
    const existing = dayMap.get(key) ?? { total: 0, count: 0 };
    existing.total += Number(v.total);
    existing.count += 1;
    dayMap.set(key, existing);
  }

  const ventasPorDia: VentasPorDia[] = Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fecha, data]) => ({
      fecha,
      total: Math.round(data.total * 100) / 100,
      cantidad: data.count,
    }));

  // -------------------------------------------------------------------------
  // Assemble response
  // -------------------------------------------------------------------------
  return {
    ventasHoy: {
      count: ventasHoyAgg._count,
      total: Number(ventasHoyAgg._sum.total ?? 0),
    },
    ventasSemana: {
      count: ventasSemanaAgg._count,
      total: Number(ventasSemanaAgg._sum.total ?? 0),
    },
    ventasMes: {
      count: ventasMesAgg._count,
      total: Number(ventasMesAgg._sum.total ?? 0),
    },
    topProductos,
    topClientes,
    stockCritico,
    ventasPorDia,
  };
}
