import { prisma } from "@/lib/prisma";
import { crearSesion, eliminarSesion } from "./actions";

export const dynamic = "force-dynamic";

export default async function SesionesPage() {
  const sesiones = await prisma.sesion.findMany({ orderBy: { orden: "asc" } });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-neutral-100">
          Catálogo de sesiones (modo Netflix)
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Grabaciones de bandas de la escena de Concepción que el público puede
          explorar y elegir en{" "}
          <a href="/explorar" target="_blank" className="underline underline-offset-4">
            /explorar
          </a>
          , aparte del canal continuo de la home.
        </p>
      </div>

      <form
        action={crearSesion}
        className="grid grid-cols-1 gap-3 rounded-lg border border-ink-border bg-ink-card p-4 md:grid-cols-2"
      >
        <input
          name="bandaNombre"
          placeholder="Banda *"
          required
          className="rounded-md border border-ink-border bg-ink px-3 py-2 text-sm text-neutral-100"
        />
        <input
          name="titulo"
          placeholder="Título de la sesión *"
          required
          className="rounded-md border border-ink-border bg-ink px-3 py-2 text-sm text-neutral-100"
        />
        <input
          name="youtubeId"
          placeholder="Link o ID de YouTube *"
          required
          className="rounded-md border border-ink-border bg-ink px-3 py-2 text-sm text-neutral-100 md:col-span-2"
        />
        <input
          name="descripcion"
          placeholder="Descripción (opcional)"
          className="rounded-md border border-ink-border bg-ink px-3 py-2 text-sm text-neutral-100 md:col-span-2"
        />
        <button
          type="submit"
          className="col-span-full rounded-md bg-accent px-3 py-2 text-sm font-semibold text-neutral-50 transition-colors hover:bg-accent-soft md:w-fit"
        >
          Agregar sesión
        </button>
      </form>

      <ul className="divide-y divide-ink-border rounded-lg border border-ink-border">
        {sesiones.map((s) => (
          <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="font-medium text-neutral-100">
                {s.bandaNombre} — {s.titulo}
              </p>
              <p className="text-sm text-muted">
                youtube.com/watch?v={s.youtubeId}
                {s.descripcion ? ` · ${s.descripcion}` : ""}
              </p>
            </div>
            <form
              action={async () => {
                "use server";
                await eliminarSesion(s.id);
              }}
            >
              <button type="submit" className="text-sm text-muted-2 hover:text-red-400">
                Eliminar
              </button>
            </form>
          </li>
        ))}
        {sesiones.length === 0 && (
          <li className="px-4 py-6 text-center text-muted">
            No hay sesiones cargadas todavía.
          </li>
        )}
      </ul>
    </div>
  );
}
