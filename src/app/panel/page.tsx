import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const inicioDia = new Date();
  inicioDia.setHours(0, 0, 0, 0);
  const finDia = new Date(inicioDia);
  finDia.setDate(finDia.getDate() + 1);

  const [reservasHoy, totalBandas, equiposPrestados, cobrosPendientes] =
    await Promise.all([
      prisma.reserva.count({
        where: { inicio: { gte: inicioDia, lt: finDia }, estado: "CONFIRMADA" },
      }),
      prisma.banda.count(),
      prisma.equipo.count({ where: { estado: "PRESTADO" } }),
      prisma.cobro.count({ where: { pagado: false } }),
    ]);

  const cards = [
    { label: "Reservas hoy", value: reservasHoy, href: "/panel/reservas" },
    { label: "Bandas registradas", value: totalBandas, href: "/panel/bandas" },
    { label: "Equipos prestados", value: equiposPrestados, href: "/panel/equipos" },
    { label: "Cobros pendientes", value: cobrosPendientes, href: "/panel/cobros" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-neutral-100">
        Dashboard
      </h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-lg border border-ink-border bg-ink-card p-4 hover:border-ink-border-soft"
          >
            <p className="font-display text-3xl font-semibold text-neutral-100">{c.value}</p>
            <p className="text-sm text-muted">{c.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
