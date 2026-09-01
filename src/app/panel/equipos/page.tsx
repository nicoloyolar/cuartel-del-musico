import { prisma } from "@/lib/prisma";
import { crearEquipo, eliminarEquipo } from "./actions";
import { EstadoSelect } from "./EstadoSelect";

export const dynamic = "force-dynamic";

export default async function EquiposPage() {
  const equipos = await prisma.equipo.findMany({ orderBy: { nombre: "asc" } });

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold tracking-tight">Inventario de equipos</h1>

      <form
        action={crearEquipo}
        className="grid grid-cols-1 gap-3 rounded-lg border border-neutral-800 bg-neutral-900 p-4 md:grid-cols-3"
      >
        <input
          name="nombre"
          placeholder="Nombre del equipo *"
          required
          className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
        />
        <input
          name="categoria"
          placeholder="Categoría (ej: Percusión, Audio)"
          className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
        />
        <input
          name="notas"
          placeholder="Notas"
          className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="col-span-full rounded-md bg-white px-3 py-2 text-sm font-medium text-neutral-950 hover:bg-neutral-200 md:w-fit"
        >
          Agregar equipo
        </button>
      </form>

      <ul className="divide-y divide-neutral-800 rounded-lg border border-neutral-800">
        {equipos.map((e) => (
          <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="font-medium">{e.nombre}</p>
              <p className="text-sm text-neutral-400">
                {e.categoria ?? "Sin categoría"}
                {e.notas ? ` · ${e.notas}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <EstadoSelect id={e.id} estado={e.estado} />
              <form
                action={async () => {
                  "use server";
                  await eliminarEquipo(e.id);
                }}
              >
                <button type="submit" className="text-sm text-neutral-500 hover:text-red-400">
                  Eliminar
                </button>
              </form>
            </div>
          </li>
        ))}
        {equipos.length === 0 && (
          <li className="px-4 py-6 text-center text-neutral-400">
            No hay equipos registrados.
          </li>
        )}
      </ul>
    </div>
  );
}

