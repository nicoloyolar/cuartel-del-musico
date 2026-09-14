import { cookies } from "next/headers";
import crypto from "crypto";

/**
 * Sesión de los suscriptores de Plus (público que paga), separada a
 * propósito de NextAuth: NextAuth ya está configurado en src/auth.ts solo
 * para el staff del panel (login manual, cuentas creadas a mano). Acá el
 * login es de autoservicio — cualquiera se registra — y es un dominio
 * distinto (clientes pagando, no empleados), así que en vez de forzar un
 * segundo provider/rol dentro del mismo sistema de auth del panel, se usa
 * una cookie firmada propia y liviana. Firma con HMAC-SHA256 reusando
 * AUTH_SECRET (mismo secreto que ya existe en .env para NextAuth — no hace
 * falta uno nuevo, son usos independientes del mismo valor).
 */

const COOKIE = "plus_session";
const MAX_AGE_SEG = 60 * 60 * 24 * 30; // 30 días

function firmar(valor: string): string {
  const secreto = process.env.AUTH_SECRET;
  if (!secreto) throw new Error("Falta AUTH_SECRET en el entorno");
  return crypto.createHmac("sha256", secreto).update(valor).digest("hex");
}

export async function crearSesionSuscriptor(suscriptorId: string) {
  const payload = JSON.stringify({ id: suscriptorId, exp: Date.now() + MAX_AGE_SEG * 1000 });
  const valor = Buffer.from(payload, "utf8").toString("base64url");
  const firma = firmar(valor);

  const jar = await cookies();
  jar.set(COOKIE, `${valor}.${firma}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SEG,
  });
}

/** Devuelve el id del suscriptor logueado, o null si no hay sesión válida. */
export async function obtenerSuscriptorIdSesion(): Promise<string | null> {
  const jar = await cookies();
  const cookie = jar.get(COOKIE)?.value;
  if (!cookie) return null;

  const separador = cookie.lastIndexOf(".");
  if (separador === -1) return null;
  const valor = cookie.slice(0, separador);
  const firma = cookie.slice(separador + 1);

  let firmaEsperada: string;
  try {
    firmaEsperada = firmar(valor);
  } catch {
    return null;
  }
  // Comparación en tiempo constante — evita filtrar la firma por timing.
  const a = Buffer.from(firma);
  const b = Buffer.from(firmaEsperada);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(Buffer.from(valor, "base64url").toString("utf8")) as {
      id: string;
      exp: number;
    };
    if (typeof payload.id !== "string" || payload.exp < Date.now()) return null;
    return payload.id;
  } catch {
    return null;
  }
}

export async function cerrarSesionSuscriptor() {
  const jar = await cookies();
  jar.delete(COOKIE);
}
