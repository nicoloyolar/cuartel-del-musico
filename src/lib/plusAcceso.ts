import { prisma } from "@/lib/prisma";
import { obtenerSuscriptorIdSesion } from "@/lib/suscriptorSession";

/** Suscriptor logueado ahora mismo (por la cookie de sesión), o null. */
export async function obtenerSuscriptorActual() {
  const id = await obtenerSuscriptorIdSesion();
  if (!id) return null;
  return prisma.suscriptor.findUnique({ where: { id } });
}

/**
 * v1 pragmática (sin cobro recurrente automático, ver PagoPlus): el acceso
 * depende solo de que `activaHasta` no haya pasado todavía. Vencido, no
 * entra a /plus hasta pagar de nuevo — nada se cancela automáticamente por
 * webhook, solo se extiende cuando un pago se aprueba.
 */
export function tieneAccesoActivo(suscriptor: { activaHasta: Date | null } | null): boolean {
  return !!suscriptor?.activaHasta && suscriptor.activaHasta.getTime() > Date.now();
}
