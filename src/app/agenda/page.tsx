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
    const key = new Intl.DateTimeFormat("es-CL", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(r.inicio);
    porDia.set(key, [...(porDia.get(key) ?? []), r]);
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-10">
      <div>
        <Link
          href="/"
          className="text-sm text-neutral-400 underline underline-offset-4 hover:text-white"
        >
          ← Volver al streaming
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">
          Agenda de la semana
        </h1>
      </div>

      {porDia.size === 0 ? (
        <p className="text-neutral-400">
          No hay ensayos programados para transmitir esta semana.
        </p>
      ) : (
        [...porDia.entries()].map(([dia, items]) => (
          <section key={dia}>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-400">
              {dia}
            </h2>
            <ul className="divide-y divide-neutral-800 rounded-lg border border-neutral-800">
              {items.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <span className="font-medium">{r.banda.nombre}</span>
                  <span className="text-sm text-neutral-400">
                    {formatHora(r.inicio)} – {formatHora(r.fin)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))
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
