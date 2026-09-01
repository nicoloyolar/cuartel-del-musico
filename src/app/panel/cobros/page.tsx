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
        <h1 className="text-2xl font-bold tracking-tight">Cobros</h1>
        <p className="text-sm text-neutral-400">
          Pendiente por cobrar:{" "}
          <span className="font-semibold text-amber-300">
            ${totalPendiente.toLocaleString("es-CL")}
          </span>
        </p>
      </div>

      <form
        action={crearCobro}
        className="grid grid-cols-1 gap-3 rounded-lg border border-neutral-800 bg-neutral-900 p-4 md:grid-cols-3"
      >
        <select
          name="reservaId"
          required
          className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm md:col-span-2"
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
          className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
        />
        <input
          name="metodo"
          placeholder="Método (efectivo, transferencia...)"
          className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
        />
        <input
          name="notas"
          placeholder="Notas"
          className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
        />
        <label className="flex items-center gap-2 text-sm text-neutral-300">
          <input type="checkbox" name="pagado" />
          Ya pagado
        </label>
        <button
          type="submit"
          className="col-span-full rounded-md bg-white px-3 py-2 text-sm font-medium text-neutral-950 hover:bg-neutral-200 md:w-fit"
        >
          Registrar cobro
        </button>
      </form>

      <ul className="divide-y divide-neutral-800 rounded-lg border border-neutral-800">
        {cobros.map((c) => (
          <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="font-medium">
                {c.reserva.banda.nombre} · ${c.monto.toLocaleString("es-CL")}
              </p>
              <p className="text-sm text-neutral-400">
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
                <button type="submit" className="text-sm text-neutral-500 hover:text-red-400">
                  Eliminar
                </button>
              </form>
            </div>
          </li>
        ))}
        {cobros.length === 0 && (
          <li className="px-4 py-6 text-center text-neutral-400">
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
