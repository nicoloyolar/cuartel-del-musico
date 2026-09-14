"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  crearSesionSuscriptor,
  cerrarSesionSuscriptor,
  obtenerSuscriptorIdSesion,
} from "@/lib/suscriptorSession";
import { crearPreferenciaPago, mercadoPagoConfigurado } from "@/lib/mercadoPago";

export type PlusFormState = { error?: string };

export async function registrarSuscriptor(
  _prevState: PlusFormState,
  formData: FormData
): Promise<PlusFormState> {
  const email = ((formData.get("email") as string) ?? "").trim().toLowerCase();
  const password = (formData.get("password") as string) ?? "";
  const nombre = ((formData.get("nombre") as string) ?? "").trim();

  if (!email || !email.includes("@")) {
    return { error: "Ingresá un email válido." };
  }
  if (password.length < 8) {
    return { error: "La contraseña tiene que tener al menos 8 caracteres." };
  }

  const existente = await prisma.suscriptor.findUnique({ where: { email } });
  if (existente) {
    return { error: "Ya existe una cuenta con ese email — iniciá sesión en vez de registrarte." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const suscriptor = await prisma.suscriptor.create({
    data: { email, passwordHash, nombre: nombre || null },
  });

  await crearSesionSuscriptor(suscriptor.id);
  redirect("/plus/cuenta");
}

export async function iniciarSesionSuscriptor(
  _prevState: PlusFormState,
  formData: FormData
): Promise<PlusFormState> {
  const email = ((formData.get("email") as string) ?? "").trim().toLowerCase();
  const password = (formData.get("password") as string) ?? "";

  const suscriptor = await prisma.suscriptor.findUnique({ where: { email } });
  const valido = suscriptor ? await bcrypt.compare(password, suscriptor.passwordHash) : false;
  if (!suscriptor || !valido) {
    return { error: "Email o contraseña incorrectos." };
  }

  await crearSesionSuscriptor(suscriptor.id);
  redirect("/plus/cuenta");
}

export async function cerrarSesionSuscriptorAction() {
  await cerrarSesionSuscriptor();
  redirect("/plus");
}

/**
 * Arranca un pago: crea el registro PagoPlus (pendiente) y redirige al
 * checkout hospedado de MercadoPago. El webhook (/api/mercadopago/webhook)
 * es quien confirma el pago y extiende Suscriptor.activaHasta — acá solo se
 * inicia.
 */
export async function iniciarPagoPlus() {
  const suscriptorId = await obtenerSuscriptorIdSesion();
  if (!suscriptorId) redirect("/plus/login");

  const plan = await prisma.planPlusConfig.findUnique({ where: { id: 1 } });
  if (!plan) redirect("/plus/cuenta?pago=error");

  const pago = await prisma.pagoPlus.create({
    data: { suscriptorId, monto: plan.precioMensual, estado: "pendiente" },
  });

  if (!mercadoPagoConfigurado()) {
    // Sin credenciales todavía (falta confirmar con el cliente si ya tiene
    // cuenta de MercadoPago — ver memoria de proyecto). El pago queda
    // pendiente en la base para no perder el registro; /plus/cuenta avisa
    // en vez de romper.
    redirect("/plus/cuenta?pago=sin_configurar");
  }

  const hdrs = await headers();
  const origin = `${hdrs.get("x-forwarded-proto") ?? "https"}://${hdrs.get("host")}`;

  let initPoint: string | undefined;
  try {
    initPoint = await crearPreferenciaPago({
      pagoId: pago.id,
      monto: plan.precioMensual,
      descripcion: plan.nombre,
      origin,
    });
  } catch (e) {
    console.error("Error creando preferencia de MercadoPago", e);
    redirect("/plus/cuenta?pago=error");
  }

  if (!initPoint) redirect("/plus/cuenta?pago=error");
  redirect(initPoint);
}
