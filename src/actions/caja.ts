"use server";

import { prisma } from "@/lib/prisma";
import { getSessionData } from "@/lib/auth-utils";
import { z } from "zod";
import { Prisma } from "@prisma/client";

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const abrirTurnoSchema = z.object({
  montoInicial: z.number().min(0, "Monto inicial no puede ser negativo"),
  cajaId: z.string().uuid().optional().nullable(),
});

const cerrarTurnoSchema = z.object({
  turnoId: z.string().uuid(),
  montoFinal: z.number().min(0, "Monto final no puede ser negativo"),
});

const registrarMovimientoSchema = z.object({
  tipoMovimiento: z.enum(["INGRESO", "EGRESO"]),
  monto: z.number().positive("El monto debe ser mayor a 0"),
  concepto: z.string().min(1, "Concepto es obligatorio"),
  metodoPago: z.string().min(1, "Método de pago es obligatorio"),
  referenciaId: z.string().optional().nullable(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function findOrCreateDefaultCaja(
  tx: Prisma.TransactionClient,
  sucursalId: string
) {
  let caja = await tx.caja.findFirst({
    where: { sucursalId, estado: true, deletedAt: null },
    orderBy: { createdAt: "asc" },
  });

  if (!caja) {
    caja = await tx.caja.create({
      data: {
        sucursalId,
        nombre: "Caja Principal",
        estado: true,
      },
    });
  }

  return caja;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export async function abrirTurno(input: z.infer<typeof abrirTurnoSchema>) {
  const { empresaId, sucursalId, userId } = await getSessionData();
  const data = abrirTurnoSchema.parse(input);

  // Check that the user doesn't already have an open turno
  const turnoAbierto = await prisma.turnoCaja.findFirst({
    where: {
      empresaId,
      usuarioId: userId,
      estado: "ABIERTO",
    },
  });

  if (turnoAbierto) {
    throw new Error(
      "Ya tienes un turno de caja abierto. Cierra el turno actual antes de abrir uno nuevo."
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    // Resolve caja
    let cajaId = data.cajaId;
    if (!cajaId) {
      const caja = await findOrCreateDefaultCaja(tx, sucursalId);
      cajaId = caja.id;
    } else {
      // Verify the caja exists and belongs to the sucursal
      const caja = await tx.caja.findFirst({
        where: { id: cajaId, sucursalId, estado: true, deletedAt: null },
      });
      if (!caja) {
        throw new Error("Caja no encontrada o no pertenece a esta sucursal");
      }
    }

    // Check there's no other open turno for this specific caja
    const cajaOcupada = await tx.turnoCaja.findFirst({
      where: {
        cajaId,
        estado: "ABIERTO",
      },
    });

    if (cajaOcupada) {
      throw new Error(
        "Esta caja ya tiene un turno abierto por otro usuario. Seleccione otra caja."
      );
    }

    const turno = await tx.turnoCaja.create({
      data: {
        empresaId,
        cajaId,
        usuarioId: userId,
        montoInicial: new Prisma.Decimal(data.montoInicial),
        estado: "ABIERTO",
      },
      include: {
        caja: { select: { id: true, nombre: true } },
      },
    });

    return turno;
  });

  return {
    ...result,
    montoInicial: Number(result.montoInicial),
    montoFinal: result.montoFinal ? Number(result.montoFinal) : null,
    diferencia: result.diferencia ? Number(result.diferencia) : null,
  };
}

export async function cerrarTurno(input: z.infer<typeof cerrarTurnoSchema>) {
  const { empresaId, userId } = await getSessionData();
  const data = cerrarTurnoSchema.parse(input);

  const turno = await prisma.turnoCaja.findFirst({
    where: {
      id: data.turnoId,
      empresaId,
      usuarioId: userId,
      estado: "ABIERTO",
    },
    include: { movimientos: true },
  });

  if (!turno) {
    throw new Error(
      "Turno no encontrado, ya cerrado, o no te pertenece"
    );
  }

  // Calculate expected total
  let totalIngresos = new Prisma.Decimal(0);
  let totalEgresos = new Prisma.Decimal(0);

  for (const mov of turno.movimientos) {
    if (mov.tipoMovimiento === "INGRESO") {
      totalIngresos = totalIngresos.add(mov.monto);
    } else {
      totalEgresos = totalEgresos.add(mov.monto);
    }
  }

  const montoEsperado = new Prisma.Decimal(turno.montoInicial)
    .add(totalIngresos)
    .sub(totalEgresos);

  const montoFinalDecimal = new Prisma.Decimal(data.montoFinal);
  const diferencia = montoFinalDecimal.sub(montoEsperado);

  const result = await prisma.turnoCaja.update({
    where: { id: data.turnoId },
    data: {
      montoFinal: montoFinalDecimal,
      diferencia,
      fechaCierre: new Date(),
      estado: "CERRADO",
    },
    include: {
      caja: { select: { id: true, nombre: true } },
    },
  });

  return {
    ...result,
    montoInicial: Number(result.montoInicial),
    montoFinal: result.montoFinal ? Number(result.montoFinal) : null,
    diferencia: result.diferencia ? Number(result.diferencia) : null,
  };
}

export async function getTurnoActivo() {
  const { empresaId, userId } = await getSessionData();

  const turno = await prisma.turnoCaja.findFirst({
    where: {
      empresaId,
      usuarioId: userId,
      estado: "ABIERTO",
    },
    include: {
      caja: { select: { id: true, nombre: true } },
      movimientos: {
        orderBy: { fecha: "desc" },
        take: 10,
      },
    },
  });

  if (!turno) {
    return null;
  }

  // Calculate running totals
  const allMovimientos = await prisma.cajaMovimiento.findMany({
    where: { turnoCajaId: turno.id },
  });

  let totalIngresos = 0;
  let totalEgresos = 0;

  for (const mov of allMovimientos) {
    if (mov.tipoMovimiento === "INGRESO") {
      totalIngresos += Number(mov.monto);
    } else {
      totalEgresos += Number(mov.monto);
    }
  }

  return {
    ...turno,
    montoInicial: Number(turno.montoInicial),
    montoFinal: turno.montoFinal ? Number(turno.montoFinal) : null,
    diferencia: turno.diferencia ? Number(turno.diferencia) : null,
    movimientos: turno.movimientos.map((m) => ({
      ...m,
      monto: Number(m.monto),
    })),
    resumen: {
      totalIngresos,
      totalEgresos,
      saldoEsperado: Number(turno.montoInicial) + totalIngresos - totalEgresos,
    },
  };
}

export async function registrarMovimiento(
  input: z.infer<typeof registrarMovimientoSchema>
) {
  const { empresaId, userId } = await getSessionData();
  const data = registrarMovimientoSchema.parse(input);

  // Verify there's an active turno
  const turnoActivo = await prisma.turnoCaja.findFirst({
    where: {
      empresaId,
      usuarioId: userId,
      estado: "ABIERTO",
    },
  });

  if (!turnoActivo) {
    throw new Error(
      "No tienes un turno de caja abierto. Abre un turno antes de registrar movimientos."
    );
  }

  const movimiento = await prisma.cajaMovimiento.create({
    data: {
      empresaId,
      turnoCajaId: turnoActivo.id,
      usuarioId: userId,
      tipoMovimiento: data.tipoMovimiento,
      monto: new Prisma.Decimal(data.monto),
      concepto: data.concepto,
      metodoPago: data.metodoPago,
      referenciaId: data.referenciaId || null,
    },
  });

  return {
    ...movimiento,
    monto: Number(movimiento.monto),
  };
}

export async function getMovimientos(turnoId: string) {
  const { empresaId } = await getSessionData();

  // Verify the turno belongs to the empresa
  const turno = await prisma.turnoCaja.findFirst({
    where: { id: turnoId, empresaId },
  });

  if (!turno) {
    throw new Error("Turno no encontrado");
  }

  const movimientos = await prisma.cajaMovimiento.findMany({
    where: { turnoCajaId: turnoId },
    include: {
      usuario: { select: { id: true, nombre: true } },
    },
    orderBy: { fecha: "desc" },
  });

  return movimientos.map((m) => ({
    ...m,
    monto: Number(m.monto),
  }));
}

export async function getHistorialTurnos(options?: {
  page?: number;
  pageSize?: number;
}) {
  const { empresaId } = await getSessionData();

  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 20;
  const skip = (page - 1) * pageSize;

  const [turnos, total] = await Promise.all([
    prisma.turnoCaja.findMany({
      where: { empresaId },
      include: {
        caja: { select: { id: true, nombre: true } },
        _count: { select: { movimientos: true } },
      },
      orderBy: { fechaApertura: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.turnoCaja.count({ where: { empresaId } }),
  ]);

  return {
    turnos: turnos.map((t) => ({
      ...t,
      montoInicial: Number(t.montoInicial),
      montoFinal: t.montoFinal ? Number(t.montoFinal) : null,
      diferencia: t.diferencia ? Number(t.diferencia) : null,
    })),
    total,
    page,
    pageSize,
  };
}
