import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { resolverEstadoStream } from "@/lib/stream";
import { StreamPlayer } from "@/components/StreamPlayer";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [estado, hoy] = await Promise.all([resolverEstadoStream(), reservasDeHoy()]);

  const ahora = new Date();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-3 px-6 py-6 sm:px-10">
      <header className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-accent to-orange-500">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 20V6a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4Z"
                stroke="#0a0908"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="font-display text-lg font-semibold tracking-widest text-neutral-100 uppercase">
            Cuartel del Músico
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="/explorar"
            className="font-display text-xs font-semibold tracking-widest text-muted uppercase hover:text-neutral-100"
          >
            Explorar la escena →
          </Link>
          <Link
            href="/agenda"
            className="font-display text-xs font-semibold tracking-widest text-muted uppercase hover:text-neutral-100"
          >
            Ver agenda completa →
          </Link>
        </div>
      </header>

      <StreamPlayer estado={estado} />

      <div className="pt-5 pb-8">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-neutral-100">
          {estado.tipo === "canal"
            ? estado.tituloItem
            : estado.tipo === "live"
              ? (estado.titulo ?? "Cuartel del Músico — En Vivo")
              : "Cuartel del Músico — En Vivo"}
        </h2>
        <p className="mt-1 text-sm text-muted">
          Transmisión continua desde la sala de ensayo — Concepción, Chile
        </p>
      </div>

      <section>
        <div className="mb-5 flex items-baseline gap-3.5">
          <h3 className="font-display text-sm font-semibold tracking-[0.2em] text-neutral-100 uppercase">
            Hoy en la sala
          </h3>
          <div className="h-px flex-1 bg-ink-border" />
          <span className="text-xs text-muted-2">{formatFecha(ahora)}</span>
        </div>

        {hoy.length === 0 ? (
          <p className="rounded-xl border border-ink-border bg-ink-card px-5 py-6 text-sm text-muted">
            No hay ensayos programados para transmitir hoy.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {hoy.map((r) => {
              const tocandoAhora = ahora >= r.inicio && ahora <= r.fin;
              return (
                <div
                  key={r.id}
                  className="relative rounded-xl border bg-ink-card p-5"
                  style={{
                    borderColor: tocandoAhora ? undefined : "var(--color-ink-border)",
                  }}
                >
                  {tocandoAhora && (
                    <>
                      <div className="absolute inset-0 rounded-xl border border-ink-border-soft" />
                      <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-xl bg-gradient-to-r from-accent to-orange-400" />
                    </>
                  )}

                  <div className="relative mb-4 flex items-center justify-between">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-lg font-display text-sm font-semibold ${
                        tocandoAhora
                          ? "bg-gradient-to-br from-accent to-red-900 text-neutral-100"
                          : "bg-ink-border text-muted"
                      }`}
                    >
                      {iniciales(r.banda.nombre)}
                    </div>
                    {tocandoAhora && (
                      <div className="flex h-4 items-end gap-[3px]">
                        <span className="animate-eq-bar h-full w-[3px] rounded-sm bg-accent-soft [animation-delay:0s]" />
                        <span className="animate-eq-bar h-full w-[3px] rounded-sm bg-accent-soft [animation-delay:0.2s]" />
                        <span className="animate-eq-bar h-full w-[3px] rounded-sm bg-accent-soft [animation-delay:0.4s]" />
                      </div>
                    )}
                  </div>

                  <p className="relative font-display text-base font-semibold text-neutral-100">
                    {r.banda.nombre}
                  </p>
                  <p className="relative mt-1 text-sm text-muted-2">
                    {formatHora(r.inicio)} – {formatHora(r.fin)}
                  </p>

                  <span
                    className={`relative mt-3.5 inline-block rounded-md px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase ${
                      tocandoAhora
                        ? "bg-accent/10 text-accent-soft"
                        : "bg-ink-border text-muted"
                    }`}
                  >
                    {tocandoAhora ? "Ensayando ahora" : "Programado"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

async function reservasDeHoy() {
  const inicioDia = new Date();
  inicioDia.setHours(0, 0, 0, 0);
  const finDia = new Date(inicioDia);
  finDia.setDate(finDia.getDate() + 1);

  return prisma.reserva.findMany({
    where: {
      inicio: { gte: inicioDia, lt: finDia },
      estado: "CONFIRMADA",
      transmitirEnVivo: true,
    },
    include: { banda: true },
    orderBy: { inicio: "asc" },
  });
}

function formatHora(d: Date) {
  return new Intl.DateTimeFormat("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function formatFecha(d: Date) {
  const texto = new Intl.DateTimeFormat("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(d);
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function iniciales(nombre: string) {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => palabra[0]?.toUpperCase())
    .join("");
}
