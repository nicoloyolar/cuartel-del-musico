import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { calcularPosicionActual } from "@/lib/canal";
import { seccionActiva } from "@/lib/horarios";
import { StreamingSubNav } from "@/components/panel/StreamingSubNav";
import { crearCanalItem, eliminarCanalItem, moverCanalItem, reactivarCanalItem } from "./actions";

export const dynamic = "force-dynamic";

const SECCIONES = [
  { valor: "RADIO_TV" as const, etiqueta: "Radio-TV" },
  { valor: "PODCAST" as const, etiqueta: "Podcast" },
];

export default async function CanalPage({
  searchParams,
}: {
  searchParams: Promise<{ seccion?: string }>;
}) {
  const { seccion: seccionParam } = await searchParams;
  const seccionVista = seccionParam === "PODCAST" ? "PODCAST" : "RADIO_TV";

  const [items, bloques, session] = await Promise.all([
    prisma.canalItem.findMany({ where: { seccion: seccionVista }, orderBy: { orden: "asc" } }),
    prisma.bloqueHorario.findMany({ orderBy: { createdAt: "asc" } }),
    auth(),
  ]);

  // La sección que se ve/edita acá (seccionVista, por tab) no siempre es la
  // que está al aire ahora mismo (eso lo decide el horario en /panel/horarios)
  // — "sonando ahora" solo se muestra si coinciden.
  const seccionEnAire = seccionActiva(bloques, new Date());
  const itemsActivos = items.filter((i) => !i.bloqueado);
  const posicion =
    seccionVista === seccionEnAire ? calcularPosicionActual(itemsActivos, new Date()) : null;
  const duracionTotal = itemsActivos.reduce((acc, i) => acc + i.duracionSegundos, 0);

  const contenido = (
    <>
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-neutral-100">
          Canal (Radio-TV / Podcast)
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Cada sección tiene su propia lista y su propio ciclo — cuál está al aire ahora se decide
          por el horario configurado en{" "}
          <Link href="/panel/horarios" className="underline underline-offset-4 hover:text-neutral-200">
            /panel/horarios
          </Link>
          . Dentro de cada sección se reproduce en este orden, en loop, calculado por reloj de
          servidor para que todos los visitantes vean el mismo punto.
        </p>
      </div>

      <nav className="flex items-center gap-2">
        {SECCIONES.map((s) => (
          <Link
            key={s.valor}
            href={`/panel/canal?seccion=${s.valor}`}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              seccionVista === s.valor
                ? "bg-accent text-neutral-50"
                : "bg-ink-card text-muted hover:text-neutral-100"
            }`}
          >
            {s.etiqueta}
            {seccionEnAire === s.valor && (
              <span className="ml-1.5 text-[10px] uppercase opacity-80">· al aire</span>
            )}
          </Link>
        ))}
      </nav>

      <p className="text-sm text-muted">
        Duración total del ciclo de <strong>{SECCIONES.find((s) => s.valor === seccionVista)?.etiqueta}</strong>:{" "}
        <strong>{formatDuracion(duracionTotal)}</strong>.
      </p>

      {session ? (
        <form
          action={crearCanalItem}
          className="grid grid-cols-1 gap-3 rounded-lg border border-ink-border bg-ink-card p-4 md:grid-cols-2"
        >
          <input type="hidden" name="seccion" value={seccionVista} />
          <input
            name="titulo"
            placeholder="Título (ej: Krohma — Onírica) *"
            required
            className="rounded-md border border-ink-border bg-ink px-3 py-2 text-sm text-neutral-100 md:col-span-2"
          />
          <input
            name="youtubeId"
            placeholder="Link o ID de YouTube *"
            required
            className="rounded-md border border-ink-border bg-ink px-3 py-2 text-sm text-neutral-100 md:col-span-2"
          />
          <div className="flex items-center gap-2 md:col-span-2">
            <label className="text-sm text-muted">Duración:</label>
            <input
              name="minutos"
              type="number"
              min={0}
              placeholder="min"
              required
              className="w-20 rounded-md border border-ink-border bg-ink px-3 py-2 text-sm text-neutral-100"
            />
            <span className="text-muted-2">:</span>
            <input
              name="segundos"
              type="number"
              min={0}
              max={59}
              placeholder="seg"
              required
              className="w-20 rounded-md border border-ink-border bg-ink px-3 py-2 text-sm text-neutral-100"
            />
            <span className="text-xs text-muted-2">(duración real del video, para la sincronía)</span>
          </div>
          <button
            type="submit"
            className="col-span-full rounded-md bg-accent px-3 py-2 text-sm font-semibold text-neutral-50 transition-colors hover:bg-accent-soft md:w-fit"
          >
            Agregar a {SECCIONES.find((s) => s.valor === seccionVista)?.etiqueta}
          </button>
        </form>
      ) : (
        <p className="rounded-lg border border-ink-border bg-ink-card p-4 text-sm text-muted">
          Estás viendo el canal sin iniciar sesión — se puede revisar pero no editar.{" "}
          <Link
            href="/panel/login?callbackUrl=/panel/canal"
            className="underline underline-offset-4 hover:text-neutral-200"
          >
            Iniciar sesión para editar →
          </Link>
        </p>
      )}

      <ul className="divide-y divide-ink-border rounded-lg border border-ink-border">
        {items.map((item, index) => {
          const sonandoAhora = posicion?.item.id === item.id;
          return (
            <li
              key={item.id}
              className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 ${
                sonandoAhora ? "bg-ink-card" : ""
              }`}
            >
              <div>
                <p className="font-medium text-neutral-100">
                  {item.titulo}{" "}
                  {sonandoAhora && (
                    <span className="ml-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-amber-400 uppercase">
                      Sonando ahora
                    </span>
                  )}
                  {item.bloqueado && (
                    <span
                      className="ml-1 rounded-md bg-red-500/10 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-red-400 uppercase"
                      title="YouTube rechazó embeber este video (eliminado o bloqueado por reclamo de derechos) — no se programa hasta reactivarlo"
                    >
                      Bloqueado
                    </span>
                  )}
                </p>
                <p className="text-sm text-muted">
                  youtube.com/watch?v={item.youtubeId} · {formatDuracion(item.duracionSegundos)}
                </p>
              </div>
              {session && (
                <div className="flex items-center gap-3">
                  {item.bloqueado && (
                    <form
                      action={async () => {
                        "use server";
                        await reactivarCanalItem(item.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="text-sm text-muted-2 hover:text-neutral-200"
                        title="Reactivar (volver a incluir en la programación)"
                      >
                        Reactivar
                      </button>
                    </form>
                  )}
                  <form
                    action={async () => {
                      "use server";
                      await moverCanalItem(item.id, "arriba");
                    }}
                  >
                    <button
                      type="submit"
                      disabled={index === 0}
                      className="text-sm text-muted-2 hover:text-neutral-200 disabled:opacity-30"
                      title="Mover arriba"
                    >
                      ↑
                    </button>
                  </form>
                  <form
                    action={async () => {
                      "use server";
                      await moverCanalItem(item.id, "abajo");
                    }}
                  >
                    <button
                      type="submit"
                      disabled={index === items.length - 1}
                      className="text-sm text-muted-2 hover:text-neutral-200 disabled:opacity-30"
                      title="Mover abajo"
                    >
                      ↓
                    </button>
                  </form>
                  <form
                    action={async () => {
                      "use server";
                      await eliminarCanalItem(item.id);
                    }}
                  >
                    <button type="submit" className="text-sm text-muted-2 hover:text-red-400">
                      Eliminar
                    </button>
                  </form>
                </div>
              )}
            </li>
          );
        })}
        {items.length === 0 && (
          <li className="px-4 py-6 text-center text-muted">
            Esta sección está vacía — mientras no cargues nada acá, si le toca estar al aire la
            home mostrará &quot;streaming en preparación&quot;.
          </li>
        )}
      </ul>
    </>
  );

  // Sin sesión no hay barra lateral (ver panel/layout.tsx), así que esta
  // página se hace cargo de su propio padding y de una mini-nav.
  if (!session) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-8">
        <StreamingSubNav />
        {contenido}
      </div>
    );
  }

  return <div className="flex flex-col gap-8">{contenido}</div>;
}

function formatDuracion(totalSegundos: number) {
  const minutos = Math.floor(totalSegundos / 60);
  const segundos = totalSegundos % 60;
  return `${minutos}:${segundos.toString().padStart(2, "0")}`;
}
