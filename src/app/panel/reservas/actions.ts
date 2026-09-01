"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { EstadoReserva } from "@prisma/client";

export async function crearReserva(formData: FormData) {
  const bandaId = formData.get("bandaId") as string;
  const inicio = formData.get("inicio") as string;
  const fin = formData.get("fin") as string;
  if (!bandaId || !inicio || !fin) return;

  const precioRaw = formData.get("precio") as string;

  await prisma.reserva.create({
    data: {
      bandaId,
      inicio: new Date(inicio),
      fin: new Date(fin),
      transmitirEnVivo: formData.get("transmitirEnVivo") === "on",
      precio: precioRaw ? Number(precioRaw) : undefined,
      notas: (formData.get("notas") as string)?.trim() || undefined,
    },
  });

  revalidatePath("/panel/reservas");
  revalidatePath("/");
  revalidatePath("/agenda");
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
