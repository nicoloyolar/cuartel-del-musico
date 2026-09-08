import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AgendaPage() {
  const inicioSemana = new Date();
  inicioSemana.setHours(0, 0, 0, 0);
  const finSemana = new Date(inicioSemana);
  finSemana.setDate(finSemana.getDate() + 7);

  const reservas = await prisma.reserva.findMany({
    where: {
      inicio: { gte: inicioSemana, lt: finSemana },
      estado: "CONFIRMADA",
      transmitirEnVivo: true,
    },
    include: { banda: true },
    orderBy: { inicio: "asc" },
  });

  const porDia = new Map<string, typeof reservas>();
  for (const r of reservas) {
    const key = formatDia(r.inicio);
    porDia.set(key, [...(porDia.get(key) ?? []), r]);
  }

  const ahora = new Date();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-3 px-6 py-6 sm:px-10">
      <header className="flex items-center justify-between py-4">
        <div>
          <Link
            href="/"
            className="font-display text-xs font-semibold tracking-widest text-muted uppercase hover:text-neutral-100"
          >
            ← Volver al streaming
          </Link>
          <h1 className="mt-2 font-display text-lg font-semibold tracking-widest text-neutral-100 uppercase">
            Agenda de la semana
          </h1>
        </div>
      </header>

      {porDia.size === 0 ? (
        <p className="rounded-xl border border-ink-border bg-ink-card px-5 py-6 text-sm text-muted">
          No hay ensayos programados para transmitir esta semana.
        </p>
      ) : (
        <div className="flex flex-col gap-8 pb-8">
          {[...porDia.entries()].map(([dia, items]) => (
            <section key={dia}>
              <div className="mb-5 flex items-baseline gap-3.5">
                <h3 className="font-display text-sm font-semibold tracking-[0.2em] text-neutral-100 uppercase">
                  {dia}
                </h3>
                <div className="h-px flex-1 bg-ink-border" />
              </div>

              <ul className="divide-y divide-ink-border overflow-hidden rounded-xl border border-ink-border bg-ink-card">
                {items.map((r) => {
                  const tocandoAhora = ahora >= r.inicio && ahora <= r.fin;
                  return (
                    <li
                      key={r.id}
                      className="relative flex items-center justify-between gap-4 px-5 py-4"
                    >
                      {tocandoAhora && (
                        <div className="absolute inset-y-0 left-0 w-0.5 bg-gradient-to-b from-accent to-orange-400" />
                      )}
                      <div className="flex items-center gap-3">
                        <span className="font-display text-sm font-semibold text-neutral-100">
                          {r.banda.nombre}
                        </span>
                        {tocandoAhora && (
                          <span className="inline-block rounded-md bg-accent/10 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-accent-soft uppercase">
                            Ensayando ahora
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-muted-2">
                        {formatHora(r.inicio)} – {formatHora(r.fin)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}

function formatHora(d: Date) {
  return new Intl.DateTimeFormat("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function formatDia(d: Date) {
  const texto = new Intl.DateTimeFormat("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(d);
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
