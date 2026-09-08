import { prisma } from "@/lib/prisma";
import { crearCobro, eliminarCobro } from "./actions";
import { PagadoToggle } from "./PagadoToggle";

export const dynamic = "force-dynamic";

export default async function CobrosPage() {
  const [reservas, cobros] = await Promise.all([
    prisma.reserva.findMany({
      include: { banda: true },
      orderBy: { inicio: "desc" },
      take: 50,
    }),
    prisma.cobro.findMany({
      include: { reserva: { include: { banda: true } } },
      orderBy: { fecha: "desc" },
      take: 100,
    }),
  ]);

  const totalPendiente = cobros
    .filter((c) => !c.pagado)
    .reduce((acc, c) => acc + c.monto, 0);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-neutral-100">
          Cobros
        </h1>
        <p className="text-sm text-muted">
          Pendiente por cobrar:{" "}
          <span className="font-semibold text-amber-300">
            ${totalPendiente.toLocaleString("es-CL")}
          </span>
        </p>
      </div>

      <form
        action={crearCobro}
        className="grid grid-cols-1 gap-3 rounded-lg border border-ink-border bg-ink-card p-4 md:grid-cols-3"
      >
        <select
          name="reservaId"
          required
          className="rounded-md border border-ink-border bg-ink px-3 py-2 text-sm text-neutral-100 md:col-span-2"
        >
          <option value="">Selecciona una reserva *</option>
          {reservas.map((r) => (
            <option key={r.id} value={r.id}>
              {r.banda.nombre} — {formatFecha(r.inicio)}
            </option>
          ))}
        </select>
        <input
          type="number"
          name="monto"
          placeholder="Monto (CLP) *"
          required
          className="rounded-md border border-ink-border bg-ink px-3 py-2 text-sm text-neutral-100"
        />
        <input
          name="metodo"
          placeholder="Método (efectivo, transferencia...)"
          className="rounded-md border border-ink-border bg-ink px-3 py-2 text-sm text-neutral-100"
        />
        <input
          name="notas"
          placeholder="Notas"
          className="rounded-md border border-ink-border bg-ink px-3 py-2 text-sm text-neutral-100"
        />
        <label className="flex items-center gap-2 text-sm text-neutral-300">
          <input type="checkbox" name="pagado" />
          Ya pagado
        </label>
        <button
          type="submit"
          className="col-span-full rounded-md bg-accent px-3 py-2 text-sm font-semibold text-neutral-50 transition-colors hover:bg-accent-soft md:w-fit"
        >
          Registrar cobro
        </button>
      </form>

      <ul className="divide-y divide-ink-border rounded-lg border border-ink-border">
        {cobros.map((c) => (
          <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="font-medium text-neutral-100">
                {c.reserva.banda.nombre} · ${c.monto.toLocaleString("es-CL")}
              </p>
              <p className="text-sm text-muted">
                {formatFecha(c.reserva.inicio)}
                {c.metodo ? ` · ${c.metodo}` : ""}
                {c.notas ? ` · ${c.notas}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <PagadoToggle id={c.id} pagado={c.pagado} />
              <form
                action={async () => {
                  "use server";
                  await eliminarCobro(c.id);
                }}
              >
                <button type="submit" className="text-sm text-muted-2 hover:text-red-400">
                  Eliminar
                </button>
              </form>
            </div>
          </li>
        ))}
        {cobros.length === 0 && (
          <li className="px-4 py-6 text-center text-muted">
            No hay cobros registrados.
          </li>
        )}
      </ul>
    </div>
  );
}

function formatFecha(d: Date) {
  return new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}
