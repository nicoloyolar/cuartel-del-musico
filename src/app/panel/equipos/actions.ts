"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { EstadoEquipo } from "@prisma/client";

export async function crearEquipo(formData: FormData) {
  const nombre = (formData.get("nombre") as string)?.trim();
  if (!nombre) return;

  await prisma.equipo.create({
    data: {
      nombre,
      categoria: (formData.get("categoria") as string)?.trim() || undefined,
      notas: (formData.get("notas") as string)?.trim() || undefined,
    },
  });

  revalidatePath("/panel/equipos");
}

export async function cambiarEstadoEquipo(id: string, estado: EstadoEquipo) {
  await prisma.equipo.update({ where: { id }, data: { estado } });
  revalidatePath("/panel/equipos");
}

export async function eliminarEquipo(id: string) {
  await prisma.equipo.delete({ where: { id } });
  revalidatePath("/panel/equipos");
}
