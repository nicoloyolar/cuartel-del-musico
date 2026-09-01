"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function crearBanda(formData: FormData) {
  const nombre = (formData.get("nombre") as string)?.trim();
  if (!nombre) return;

  await prisma.banda.create({
    data: {
      nombre,
      contacto: str(formData.get("contacto")),
      telefono: str(formData.get("telefono")),
      email: str(formData.get("email")),
      instagram: str(formData.get("instagram")),
      notas: str(formData.get("notas")),
    },
  });

  revalidatePath("/panel/bandas");
}

export async function eliminarBanda(id: string) {
  await prisma.banda.delete({ where: { id } });
  revalidatePath("/panel/bandas");
}

function str(v: FormDataEntryValue | null): string | undefined {
  const s = (v as string)?.trim();
  return s ? s : undefined;
}
