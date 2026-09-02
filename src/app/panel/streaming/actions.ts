"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { extraerVideoId } from "@/lib/youtube";

export type StreamActionState = {
  error?: string;
  success?: boolean;
};

export async function guardarStreamConfig(
  _prevState: StreamActionState,
  formData: FormData
): Promise<StreamActionState> {
  const modo = (formData.get("modo") as string) === "live" ? "live" : "playlist";
  const youtubeIdRaw = ((formData.get("youtubeId") as string) ?? "").trim();
  const titulo = ((formData.get("titulo") as string) ?? "").trim() || null;

  let youtubeId: string | null = null;
  if (modo === "live" && youtubeIdRaw) {
    youtubeId = extraerVideoId(youtubeIdRaw);
    if (!youtubeId) {
      return {
        error:
          "No se reconoce ese link/ID de video. Pega la URL completa (youtube.com/watch?v=... o youtu.be/...) o el ID pelado.",
      };
    }
  }

  await prisma.streamConfig.upsert({
    where: { id: 1 },
    update: { modo, youtubeId, titulo },
    create: { id: 1, modo, youtubeId, titulo },
  });

  revalidatePath("/");
  revalidatePath("/panel/streaming");

  return { success: true };
}
