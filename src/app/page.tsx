import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StreamPlayer } from "@/components/StreamPlayer";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [config, hoy] = await Promise.all([
    prisma.streamConfig.findUnique({ where: { id: 1 } }),
    reservasDeHoy(),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Cuartel del Músico
          </h1>
          <p className="text-sm text-neutral-400">
            Streaming en vivo de bandas de Concepción
          </p>
        </div>
        <Link
          href="/agenda"
          className="text-sm text-neutral-300 underline underline-offset-4 hover:text-white"
        >
          Ver agenda completa →
        </Link>
      </header>

      <StreamPlayer config={config} />

      <section>
        <h2 className="mb-3 text-lg font-semibold">Hoy en la sala</h2>
        {hoy.length === 0 ? (
          <p className="text-neutral-400">
            No hay ensayos programados para transmitir hoy.
          </p>
        ) : (
          <ul className="divide-y divide-neutral-800 rounded-lg border border-neutral-800">
            {hoy.map((r) => (
              <li key={r.id} className="flex items-center justify-between px-4 py-3">
                <span className="font-medium">{r.banda.nombre}</span>
                <span className="text-sm text-neutral-400">
                  {formatHora(r.inicio)} – {formatHora(r.fin)}
                </span>
              </li>
            ))}
          </ul>
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
