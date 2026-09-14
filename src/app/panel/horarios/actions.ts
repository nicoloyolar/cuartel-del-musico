"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function revalidarTodo() {
  revalidatePath("/panel/horarios");
  revalidatePath("/panel/canal");
  revalidatePath("/panel/streaming");
  revalidatePath("/");
}

const DIAS_VALIDOS = new Set([0, 1, 2, 3, 4, 5, 6]);

/** Convierte "HH:MM" (de un <input type="time">) a minutos desde medianoche. */
function parseHora(valor: string): number | null {
  const match = valor.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const horas = Number(match[1]);
  const minutos = Number(match[2]);
  if (horas > 23 || minutos > 59) return null;
  return horas * 60 + minutos;
}

// /panel/horarios se ve sin login (mismo criterio que /panel/canal y
// /panel/streaming — ver proxy.ts), editar sí requiere sesión.
export async function crearBloqueHorario(formData: FormData) {
  const session = await auth();
  if (!session) return;

  const seccion = (formData.get("seccion") as string) === "PODCAST" ? "PODCAST" : "RADIO_TV";
  const dias = formData
    .getAll("dias")
    .map((d) => Number(d))
    .filter((d) => DIAS_VALIDOS.has(d));
  const horaInicioMin = parseHora((formData.get("horaInicio") as string) ?? "");
  const horaFinMin = parseHora((formData.get("horaFin") as string) ?? "");

  if (dias.length === 0 || horaInicioMin === null || horaFinMin === null) return;
  if (horaInicioMin === horaFinMin) return; // ventana de 0 minutos, no tiene sentido

  await prisma.bloqueHorario.create({
    data: { seccion, dias: dias.join(","), horaInicioMin, horaFinMin },
  });

  revalidarTodo();
}

export async function eliminarBloqueHorario(id: string) {
  const session = await auth();
  if (!session) return;

  await prisma.bloqueHorario.delete({ where: { id } });
  revalidarTodo();
}
