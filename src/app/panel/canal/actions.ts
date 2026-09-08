"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { extraerVideoId } from "@/lib/youtube";

function revalidarTodo() {
  revalidatePath("/panel/canal");
  revalidatePath("/panel/streaming");
  revalidatePath("/");
}

// /panel/canal se ve sin login (ver proxy.ts), pero editar el canal sí
// requiere sesión — cada acción se protege acá, no solo ocultando los
// controles en la UI.
export async function crearCanalItem(formData: FormData) {
  const session = await auth();
  if (!session) return;

  const titulo = (formData.get("titulo") as string)?.trim();
  const youtubeIdRaw = (formData.get("youtubeId") as string)?.trim();
  const youtubeId = youtubeIdRaw ? extraerVideoId(youtubeIdRaw) : null;
  const minutos = Number(formData.get("minutos") ?? 0) || 0;
  const segundos = Number(formData.get("segundos") ?? 0) || 0;
  const duracionSegundos = minutos * 60 + segundos;

  if (!titulo || !youtubeId || duracionSegundos <= 0) return;

  const ultimo = await prisma.canalItem.findFirst({ orderBy: { orden: "desc" } });

  await prisma.canalItem.create({
    data: {
      titulo,
      youtubeId,
      duracionSegundos,
      orden: (ultimo?.orden ?? 0) + 1,
    },
  });

  revalidarTodo();
}

export async function eliminarCanalItem(id: string) {
  const session = await auth();
  if (!session) return;

  await prisma.canalItem.delete({ where: { id } });
  revalidarTodo();
}

export async function moverCanalItem(id: string, direccion: "arriba" | "abajo") {
  const session = await auth();
  if (!session) return;

  const items = await prisma.canalItem.findMany({ orderBy: { orden: "asc" } });
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) return;

  const vecinoIndex = direccion === "arriba" ? index - 1 : index + 1;
  if (vecinoIndex < 0 || vecinoIndex >= items.length) return;

  const actual = items[index];
  const vecino = items[vecinoIndex];

  await prisma.$transaction([
    prisma.canalItem.update({ where: { id: actual.id }, data: { orden: vecino.orden } }),
    prisma.canalItem.update({ where: { id: vecino.id }, data: { orden: actual.orden } }),
  ]);

  revalidarTodo();
}
