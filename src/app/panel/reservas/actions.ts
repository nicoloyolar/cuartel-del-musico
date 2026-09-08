"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { EstadoReserva } from "@prisma/client";

export type ReservaActionState = {
  error?: string;
  success?: boolean;
};

export async function crearReserva(
  _prevState: ReservaActionState,
  formData: FormData
): Promise<ReservaActionState> {
  const bandaId = formData.get("bandaId") as string;
  const inicioRaw = formData.get("inicio") as string;
  const finRaw = formData.get("fin") as string;
  if (!bandaId || !inicioRaw || !finRaw) {
    return { error: "Completa banda, inicio y fin." };
  }

  const inicio = new Date(inicioRaw);
  const fin = new Date(finRaw);
  if (fin <= inicio) {
    return { error: "El fin tiene que ser posterior al inicio." };
  }

  // La sala es una sola: dos reservas no pueden ocupar el mismo tramo de
  // horario (se ignoran las canceladas, que no ocupan la sala de verdad).
  const conflicto = await prisma.reserva.findFirst({
    where: {
      estado: { not: "CANCELADA" },
      inicio: { lt: fin },
      fin: { gt: inicio },
    },
    include: { banda: true },
  });
  if (conflicto) {
    return {
      error: `La sala ya está reservada para ${conflicto.banda.nombre} en ese horario (${formatRango(conflicto.inicio, conflicto.fin)}).`,
    };
  }

  const precioRaw = formData.get("precio") as string;

  await prisma.reserva.create({
    data: {
      bandaId,
      inicio,
      fin,
      transmitirEnVivo: formData.get("transmitirEnVivo") === "on",
      precio: precioRaw ? Number(precioRaw) : undefined,
      notas: (formData.get("notas") as string)?.trim() || undefined,
    },
  });

  revalidatePath("/panel/reservas");
  revalidatePath("/");
  revalidatePath("/agenda");

  return { success: true };
}

function formatRango(inicio: Date, fin: Date) {
  const dia = new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "short",
  }).format(inicio);
  const hora = (d: Date) =>
    new Intl.DateTimeFormat("es-CL", { hour: "2-digit", minute: "2-digit" }).format(d);
  return `${dia} ${hora(inicio)}–${hora(fin)}`;
}

export async function cambiarEstadoReserva(id: string, estado: EstadoReserva) {
  await prisma.reserva.update({ where: { id }, data: { estado } });
  revalidatePath("/panel/reservas");
  revalidatePath("/");
  revalidatePath("/agenda");
}

export async function eliminarReserva(id: string) {
  await prisma.reserva.delete({ where: { id } });
  revalidatePath("/panel/reservas");
  revalidatePath("/");
  revalidatePath("/agenda");
}
