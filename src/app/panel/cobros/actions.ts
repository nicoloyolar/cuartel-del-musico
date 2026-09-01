"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function crearCobro(formData: FormData) {
  const reservaId = formData.get("reservaId") as string;
  const monto = Number(formData.get("monto"));
  if (!reservaId || !monto) return;

  await prisma.cobro.create({
    data: {
      reservaId,
      monto,
      metodo: (formData.get("metodo") as string)?.trim() || undefined,
      pagado: formData.get("pagado") === "on",
      notas: (formData.get("notas") as string)?.trim() || undefined,
    },
  });

  revalidatePath("/panel/cobros");
}

export async function marcarPagado(id: string, pagado: boolean) {
  await prisma.cobro.update({ where: { id }, data: { pagado } });
  revalidatePath("/panel/cobros");
}

export async function eliminarCobro(id: string) {
  await prisma.cobro.delete({ where: { id } });
  revalidatePath("/panel/cobros");
}
