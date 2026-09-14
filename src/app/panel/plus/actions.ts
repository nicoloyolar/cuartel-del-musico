"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { extraerVideoId } from "@/lib/youtube";

// /panel/plus vive dentro del panel protegido normal (no está en la lista
// de excepciones públicas de proxy.ts, a diferencia de /panel/canal o
// /panel/streaming) — maneja datos de suscriptores y pagos, así que exige
// login siempre, sin la salvedad temporal que tienen esas otras páginas.
// Mismo criterio que /panel/sesiones: la protección la da la ruta, estas
// acciones no repiten el chequeo de auth().

function revalidarTodo() {
  revalidatePath("/panel/plus");
  revalidatePath("/plus");
  revalidatePath("/plus/catalogo");
}

export async function guardarPlanPlusConfig(formData: FormData) {
  const nombre = (formData.get("nombre") as string)?.trim();
  const precioMensual = Number(formData.get("precioMensual") ?? 0);

  if (!nombre || !Number.isFinite(precioMensual) || precioMensual <= 0) return;

  await prisma.planPlusConfig.upsert({
    where: { id: 1 },
    update: { nombre, precioMensual },
    create: { id: 1, nombre, precioMensual },
  });

  revalidarTodo();
}

export async function crearVideoPlus(formData: FormData) {
  const titulo = (formData.get("titulo") as string)?.trim();
  const youtubeIdRaw = (formData.get("youtubeId") as string)?.trim();
  const youtubeId = youtubeIdRaw ? extraerVideoId(youtubeIdRaw) : null;
  const descripcion = (formData.get("descripcion") as string)?.trim() || undefined;

  if (!titulo || !youtubeId) return;

  const ultimo = await prisma.videoPlus.findFirst({ orderBy: { orden: "desc" } });

  await prisma.videoPlus.create({
    data: { titulo, youtubeId, descripcion, orden: (ultimo?.orden ?? 0) + 1 },
  });

  revalidarTodo();
}

export async function eliminarVideoPlus(id: string) {
  await prisma.videoPlus.delete({ where: { id } });
  revalidarTodo();
}

/**
 * Otorgar/extender acceso a mano — necesario mientras el cobro por
 * MercadoPago no esté configurado (ver memoria de proyecto: falta
 * confirmar la cuenta con el cliente), y útil después también para casos
 * de soporte (alguien pagó por fuera, hay que darle acceso de prueba, etc).
 */
export async function extenderSuscripcion(formData: FormData) {
  const suscriptorId = formData.get("suscriptorId") as string;
  const dias = Number(formData.get("dias") ?? 0);
  if (!suscriptorId || !Number.isFinite(dias) || dias <= 0) return;

  const suscriptor = await prisma.suscriptor.findUnique({ where: { id: suscriptorId } });
  if (!suscriptor) return;

  const base =
    suscriptor.activaHasta && suscriptor.activaHasta.getTime() > Date.now()
      ? suscriptor.activaHasta
      : new Date();
  const nuevaFecha = new Date(base);
  nuevaFecha.setDate(nuevaFecha.getDate() + dias);

  await prisma.suscriptor.update({ where: { id: suscriptorId }, data: { activaHasta: nuevaFecha } });

  revalidarTodo();
}

export async function quitarAccesoSuscriptor(suscriptorId: string) {
  await prisma.suscriptor.update({ where: { id: suscriptorId }, data: { activaHasta: null } });
  revalidarTodo();
}
