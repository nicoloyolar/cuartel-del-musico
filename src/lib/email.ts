import { Resend } from "resend";

/**
 * Sin RESEND_API_KEY el envío se avisa como "no configurado" en vez de
 * romper (mismo criterio que src/lib/mercadoPago.ts para MercadoPago).
 */
export function resendConfigurado(): boolean {
  return !!process.env.RESEND_API_KEY;
}

/**
 * Remitente por defecto: mientras no se verifique un dominio propio en
 * Resend, `onboarding@resend.dev` es el único que Resend deja usar sin
 * configuración — pero en modo prueba (sin dominio verificado) solo entrega
 * al email con el que se creó la cuenta de Resend, no a cualquier
 * suscriptor. Hace falta verificar un dominio propio (ver RESEND_API_KEY en
 * .env/README) para mandar a cualquiera de verdad.
 */
const REMITENTE_DEFECTO = "Cuartel del Músico <onboarding@resend.dev>";

export async function enviarEmail(opts: { to: string; subject: string; html: string }) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY no configurado");
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  const remitente = process.env.RESEND_FROM_EMAIL || REMITENTE_DEFECTO;

  const resultado = await resend.emails.send({
    from: remitente,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });

  if (resultado.error) {
    throw new Error(`Resend rechazó el envío: ${resultado.error.message}`);
  }
  return resultado;
}
