import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obtenerPagoMp, mercadoPagoConfigurado } from "@/lib/mercadoPago";

/**
 * Notificación de MercadoPago cuando cambia el estado de un pago. Formato
 * moderno ("Webhooks", no el IPN legacy): body JSON `{ type: "payment",
 * data: { id } }`; por las dudas también se busca en query (`?data.id=` /
 * `?id=`) para el caso legacy. Siempre respondemos 200 — un error nuestro
 * no debería disparar la tanda de reintentos agresivos de MercadoPago.
 */
export async function POST(req: NextRequest) {
  if (!mercadoPagoConfigurado()) {
    // Sin credenciales todavía no debería llegar tráfico real acá.
    return NextResponse.json({ ok: true });
  }

  let paymentId: string | null = null;
  try {
    const body = (await req.json()) as { data?: { id?: string | number } };
    if (body?.data?.id) paymentId = String(body.data.id);
  } catch {
    // Notificaciones legacy (o sin body) — se sigue intentando por query.
  }
  if (!paymentId) {
    paymentId = req.nextUrl.searchParams.get("data.id") ?? req.nextUrl.searchParams.get("id");
  }
  if (!paymentId) return NextResponse.json({ ok: true });

  try {
    const pago = await obtenerPagoMp(paymentId);
    const externalRef = pago.external_reference;
    if (!externalRef) return NextResponse.json({ ok: true });

    const pagoPlus = await prisma.pagoPlus.findUnique({ where: { id: externalRef } });
    if (!pagoPlus) return NextResponse.json({ ok: true });

    if (pago.status === "approved") {
      if (pagoPlus.estado !== "aprobado") {
        const suscriptor = await prisma.suscriptor.findUnique({
          where: { id: pagoPlus.suscriptorId },
        });
        // Si ya tenía una suscripción vigente, el nuevo período se suma al
        // final (no se pisa) — así renovar antes de vencer no hace perder
        // los días que quedaban.
        const base =
          suscriptor?.activaHasta && suscriptor.activaHasta.getTime() > Date.now()
            ? suscriptor.activaHasta
            : new Date();
        const nuevaFecha = new Date(base);
        nuevaFecha.setMonth(nuevaFecha.getMonth() + 1);

        await prisma.$transaction([
          prisma.pagoPlus.update({
            where: { id: pagoPlus.id },
            data: { estado: "aprobado", referenciaMp: String(pago.id) },
          }),
          prisma.suscriptor.update({
            where: { id: pagoPlus.suscriptorId },
            data: { activaHasta: nuevaFecha },
          }),
        ]);
      }
    } else if (pago.status === "rejected" || pago.status === "cancelled") {
      await prisma.pagoPlus.update({
        where: { id: pagoPlus.id },
        data: { estado: "rechazado", referenciaMp: String(pago.id) },
      });
    }
  } catch (e) {
    console.error("Error procesando webhook de MercadoPago", e);
  }

  return NextResponse.json({ ok: true });
}

// MercadoPago a veces valida la URL de notificación con un GET antes de
// activarla — sin esto, la validación falla con 405.
export async function GET() {
  return NextResponse.json({ ok: true });
}
