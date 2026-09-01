"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function guardarStreamConfig(formData: FormData) {
  const modo = (formData.get("modo") as string) === "live" ? "live" : "playlist";
  const youtubeId = (formData.get("youtubeId") as string)?.trim() || null;
  const titulo = (formData.get("titulo") as string)?.trim() || null;

  await prisma.streamConfig.upsert({
    where: { id: 1 },
    update: { modo, youtubeId, titulo },
    create: { id: 1, modo, youtubeId, titulo },
  });

  revalidatePath("/");
  revalidatePath("/panel/streaming");
}
