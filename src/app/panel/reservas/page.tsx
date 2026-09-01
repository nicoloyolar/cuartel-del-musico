import { prisma } from "@/lib/prisma";
import { crearReserva, cambiarEstadoReserva, eliminarReserva } from "./actions";

export const dynamic = "force-dynamic";

export default async function ReservasPage() {
  const [bandas, reservas] = await Promise.all([
    prisma.banda.findMany({ orderBy: { nombre: "asc" } }),
    prisma.reserva.findMany({
      include: { banda: true },
      orderBy: { inicio: "desc" },
      take: 100,
    }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold tracking-tight">Reservas de sala</h1>

      <form
        action={crearReserva}
        className="grid grid-cols-1 gap-3 rounded-lg border border-neutral-800 bg-neutral-900 p-4 md:grid-cols-3"
      >
        <select
          name="bandaId"
          required
          className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
        >
          <option value="">Selecciona una banda *</option>
          {bandas.map((b) => (
            <option key={b.id} value={b.id}>
              {b.nombre}
            </option>
          ))}
        </select>
        <input
          type="datetime-local"
          name="inicio"
          required
          className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
        />
        <input
          type="datetime-local"
          name="fin"
          required
          className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
        />
        <input
          type="number"
          name="precio"
          placeholder="Precio (CLP)"
          className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
        />
        <input
          type="text"
          name="notas"
          placeholder="Notas"
          className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm md:col-span-2"
        />
        <label className="flex items-center gap-2 text-sm text-neutral-300">
          <input type="checkbox" name="transmitirEnVivo" defaultChecked />
          Transmitir en vivo
        </label>
        <button
          type="submit"
          className="col-span-full rounded-md bg-white px-3 py-2 text-sm font-medium text-neutral-950 hover:bg-neutral-200 md:w-fit"
        >
          Crear reserva
        </button>
      </form>

      {bandas.length === 0 && (
        <p className="text-sm text-amber-400">
          Primero agrega al menos una banda para poder crear reservas.
        </p>
      )}

      <ul className="divide-y divide-neutral-800 rounded-lg border border-neutral-800">
        {reservas.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="font-medium">
                {r.banda.nombre}{" "}
                <span
                  className={`ml-2 rounded px-1.5 py-0.5 text-xs ${estadoEstilo(r.estado)}`}
                >
                  {r.estado}
                </span>
                {r.transmitirEnVivo && (
                  <span className="ml-1 rounded bg-red-900 px-1.5 py-0.5 text-xs text-red-200">
                    LIVE
                  </span>
                )}
              </p>
              <p className="text-sm text-neutral-400">
                {formatFecha(r.inicio)} – {formatHora(r.fin)}
                {r.precio ? ` · $${r.precio.toLocaleString("es-CL")}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {r.estado === "CONFIRMADA" && (
                <>
                  <EstadoButton id={r.id} estado="COMPLETADA" label="Marcar completada" />
                  <EstadoButton id={r.id} estado="CANCELADA" label="Cancelar" danger />
                </>
              )}
              <form
                action={async () => {
                  "use server";
                  await eliminarReserva(r.id);
                }}
              >
                <button type="submit" className="text-sm text-neutral-500 hover:text-red-400">
                  Eliminar
                </button>
              </form>
            </div>
          </li>
        ))}
        {reservas.length === 0 && (
          <li className="px-4 py-6 text-center text-neutral-400">
            No hay reservas registradas.
          </li>
        )}
      </ul>
    </div>
  );
}

function EstadoButton({
  id,
  estado,
  label,
  danger,
}: {
  id: string;
  estado: "COMPLETADA" | "CANCELADA";
  label: string;
  danger?: boolean;
}) {
  return (
    <form
      action={async () => {
        "use server";
        await cambiarEstadoReserva(id, estado);
      }}
    >
      <button
        type="submit"
        className={`text-sm ${danger ? "text-red-400 hover:text-red-300" : "text-neutral-300 hover:text-white"}`}
      >
        {label}
      </button>
    </form>
  );
}

function estadoEstilo(estado: string) {
  switch (estado) {
    case "CONFIRMADA":
      return "bg-emerald-900 text-emerald-200";
    case "CANCELADA":
      return "bg-neutral-800 text-neutral-400";
    case "COMPLETADA":
      return "bg-blue-900 text-blue-200";
    default:
      return "bg-neutral-800 text-neutral-300";
  }
}

function formatFecha(d: Date) {
  return new Intl.DateTimeFormat("es-CL", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function formatHora(d: Date) {
  return new Intl.DateTimeFormat("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}
