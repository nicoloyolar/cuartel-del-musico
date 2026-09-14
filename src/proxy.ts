import { auth } from "@/auth";
import { NextResponse } from "next/server";

// Protege todo /panel excepto la página de login y, por ahora, todo lo de
// streaming (/panel/streaming, /panel/canal y /panel/horarios): el panel
// interno de gestión (reservas/bandas/equipos/cobros) todavía no está
// desarrollado ni diseñado, así que mientras tanto se deja sin login para
// poder revisarlo libremente. Ojo: esto deja las páginas visibles sin
// sesión, pero sus Server Actions (guardar config, crear/mover/eliminar
// items del canal, crear/eliminar bloques horarios) están protegidas aparte,
// cada una con su propio chequeo de auth() (ver canal/actions.ts,
// horarios/actions.ts y streaming/actions.ts) — solo ver está abierto,
// editar sigue exigiendo login.
// (Next.js 16 renombró la convención "middleware" a "proxy"; misma API.)
//
// (/panel/pruebas-streaming existió acá temporalmente para validar una
// prueba de concepto de contenido externo de YouTube — se borró una vez
// terminada la validación: "oculto" se convirtió en el mecanismo real de
// Cuartel del Músico Plus, "en vivo" ya se probó y se dejó atrás.)
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const esPublicoTemporal =
    pathname === "/panel/login" ||
    pathname.startsWith("/panel/streaming") ||
    pathname.startsWith("/panel/canal") ||
    pathname.startsWith("/panel/horarios");
  const isProtected = pathname.startsWith("/panel") && !esPublicoTemporal;

  if (isProtected && !req.auth) {
    const loginUrl = new URL("/panel/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/panel/:path*"],
};
