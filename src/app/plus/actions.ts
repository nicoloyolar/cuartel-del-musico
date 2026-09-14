"use server";

import crypto from "crypto";
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
import { enviarEmail, resendConfigurado } from "@/lib/email";

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

const RESET_TOKEN_MAX_AGE_MS = 60 * 60 * 1000; // 1 hora

export type ResetSolicitudState = { mensaje?: string; error?: string };

// Mismo mensaje exista o no la cuenta — no revela si un email está
// registrado (evita que se use esto para "adivinar" suscriptores).
const MENSAJE_RESET_GENERICO =
  "Si existe una cuenta con ese email, te mandamos un link para resetear la contraseña.";

export async function solicitarResetPassword(
  _prevState: ResetSolicitudState,
  formData: FormData
): Promise<ResetSolicitudState> {
  const email = ((formData.get("email") as string) ?? "").trim().toLowerCase();
  if (!email) return { error: "Ingresá un email." };

  const suscriptor = await prisma.suscriptor.findUnique({ where: { email } });
  if (!suscriptor) return { mensaje: MENSAJE_RESET_GENERICO };

  if (!resendConfigurado()) {
    // Sin RESEND_API_KEY todavía — no hay forma de mandar el email. Se
    // avisa en el log del servidor (para que el staff lo note) pero al
    // suscriptor se le muestra el mismo mensaje genérico de siempre, no un
    // error que delate que el envío de emails no está configurado.
    console.error(
      "RESEND_API_KEY no configurado — no se pudo enviar el email de reseteo a",
      email
    );
    return { mensaje: MENSAJE_RESET_GENERICO };
  }

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  await prisma.resetTokenPlus.create({
    data: {
      suscriptorId: suscriptor.id,
      tokenHash,
      expiraEn: new Date(Date.now() + RESET_TOKEN_MAX_AGE_MS),
    },
  });

  const hdrs = await headers();
  const origin = `${hdrs.get("x-forwarded-proto") ?? "https"}://${hdrs.get("host")}`;
  const link = `${origin}/plus/resetear-password?token=${token}`;

  try {
    await enviarEmail({
      to: suscriptor.email,
      subject: "Resetear tu contraseña — Cuartel del Músico Plus",
      html: `
        <p>Pediste resetear tu contraseña de <strong>Cuartel del Músico Plus</strong>.</p>
        <p><a href="${link}">Hacé clic acá para elegir una nueva contraseña</a></p>
        <p>Este link vence en 1 hora. Si no fuiste vos, ignorá este email — tu contraseña sigue igual.</p>
      `,
    });
  } catch (e) {
    console.error("Error enviando email de reseteo de contraseña", e);
  }

  return { mensaje: MENSAJE_RESET_GENERICO };
}

export type ResetPasswordState = { error?: string };

export async function resetearPassword(
  _prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const token = (formData.get("token") as string) ?? "";
  const password = (formData.get("password") as string) ?? "";

  if (!token) return { error: "Link inválido — pedí uno nuevo desde /plus/olvide-password." };
  if (password.length < 8) {
    return { error: "La contraseña tiene que tener al menos 8 caracteres." };
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const registro = await prisma.resetTokenPlus.findUnique({ where: { tokenHash } });

  if (!registro || registro.usado || registro.expiraEn.getTime() < Date.now()) {
    return {
      error: "Este link venció o ya se usó — pedí uno nuevo desde /plus/olvide-password.",
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.$transaction([
    prisma.suscriptor.update({ where: { id: registro.suscriptorId }, data: { passwordHash } }),
    prisma.resetTokenPlus.update({ where: { id: registro.id }, data: { usado: true } }),
  ]);

  redirect("/plus/login");
}
