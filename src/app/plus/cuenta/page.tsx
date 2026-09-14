import Link from "next/link";
import { redirect } from "next/navigation";
import { obtenerSuscriptorActual, tieneAccesoActivo } from "@/lib/plusAcceso";
import { cerrarSesionSuscriptorAction, iniciarPagoPlus } from "../actions";

const MENSAJES_PAGO: Record<string, { texto: string; tono: "info" | "error" | "ok" }> = {
  ok: { texto: "¡Pago aprobado! Ya deberías tener acceso — si no se ve, refrescá la página.", tono: "ok" },
  pendiente: {
    texto: "El pago quedó pendiente de confirmación. Te avisamos apenas se apruebe.",
    tono: "info",
  },
  error: { texto: "Hubo un problema iniciando el pago. Probá de nuevo en un rato.", tono: "error" },
  sin_configurar: {
    texto:
      "Los pagos todavía no están habilitados en la plataforma — estamos terminando de configurar la pasarela. Volvé a intentarlo pronto.",
    tono: "info",
  },
};

export default async function CuentaPlusPage({
  searchParams,
}: {
  searchParams: Promise<{ pago?: string }>;
}) {
  const suscriptor = await obtenerSuscriptorActual();
  if (!suscriptor) redirect("/plus/login");

  const { pago } = await searchParams;
  const mensaje = pago ? MENSAJES_PAGO[pago] : undefined;
  const activo = tieneAccesoActivo(suscriptor);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-10">
      <div>
        <Link
          href="/plus"
          className="text-xs font-semibold tracking-widest text-muted uppercase hover:text-neutral-100"
        >
          ← Cuartel del Músico Plus
        </Link>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-neutral-100">
          Mi cuenta
        </h1>
        <p className="mt-1 text-sm text-muted">{suscriptor.email}</p>
      </div>

      {mensaje && (
        <p
          className={`rounded-md border px-3 py-2 text-sm ${
            mensaje.tono === "error"
              ? "border-red-900 bg-red-950/50 text-red-300"
              : mensaje.tono === "ok"
                ? "border-emerald-900 bg-emerald-950/50 text-emerald-300"
                : "border-ink-border bg-ink-card text-muted"
          }`}
        >
          {mensaje.texto}
        </p>
      )}

      <div className="rounded-lg border border-ink-border bg-ink-card p-5">
        {activo ? (
          <>
            <p className="font-display text-sm font-semibold tracking-wide text-emerald-400 uppercase">
              Suscripción activa
            </p>
            <p className="mt-1 text-sm text-muted">
              Vence el{" "}
              {new Intl.DateTimeFormat("es-CL", { dateStyle: "long" }).format(suscriptor.activaHasta!)}
              .
            </p>
            <Link
              href="/plus/catalogo"
              className="mt-4 inline-block rounded-md bg-accent px-3 py-2 text-sm font-semibold text-neutral-50 transition-colors hover:bg-accent-soft"
            >
              Ver contenido exclusivo →
            </Link>
          </>
        ) : (
          <>
            <p className="font-display text-sm font-semibold tracking-wide text-amber uppercase">
              Sin suscripción activa
            </p>
            <p className="mt-1 text-sm text-muted">
              {suscriptor.activaHasta
                ? "Tu suscripción venció — renová para volver a tener acceso."
                : "Todavía no tenés una suscripción activa."}
            </p>
            <form action={iniciarPagoPlus}>
              <button
                type="submit"
                className="mt-4 rounded-md bg-accent px-3 py-2 text-sm font-semibold text-neutral-50 transition-colors hover:bg-accent-soft"
              >
                Pagar suscripción
              </button>
            </form>
          </>
        )}
      </div>

      <form action={cerrarSesionSuscriptorAction}>
        <button type="submit" className="text-sm text-muted-2 hover:text-neutral-200">
          Cerrar sesión
        </button>
      </form>
    </main>
  );
}
