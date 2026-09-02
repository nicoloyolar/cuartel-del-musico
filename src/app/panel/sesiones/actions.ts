"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { extraerVideoId } from "@/lib/youtube";

export async function crearSesion(formData: FormData) {
  const bandaNombre = (formData.get("bandaNombre") as string)?.trim();
  const titulo = (formData.get("titulo") as string)?.trim();
  const youtubeIdRaw = (formData.get("youtubeId") as string)?.trim();
  const youtubeId = youtubeIdRaw ? extraerVideoId(youtubeIdRaw) : null;

  if (!bandaNombre || !titulo || !youtubeId) return;

  const ultima = await prisma.sesion.findFirst({ orderBy: { orden: "desc" } });

  await prisma.sesion.create({
    data: {
      bandaNombre,
      titulo,
      youtubeId,
      descripcion: (formData.get("descripcion") as string)?.trim() || undefined,
      orden: (ultima?.orden ?? 0) + 1,
    },
  });

  revalidatePath("/panel/sesiones");
  revalidatePath("/explorar");
}

export async function eliminarSesion(id: string) {
  await prisma.sesion.delete({ where: { id } });
  revalidatePath("/panel/sesiones");
  revalidatePath("/explorar");
}
