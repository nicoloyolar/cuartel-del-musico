import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { calcularPosicionActual } from "@/lib/canal";
import { StreamingSubNav } from "@/components/panel/StreamingSubNav";
import { crearCanalItem, eliminarCanalItem, moverCanalItem } from "./actions";

export const dynamic = "force-dynamic";

export default async function CanalPage() {
  const [items, session] = await Promise.all([
    prisma.canalItem.findMany({ orderBy: { orden: "asc" } }),
    auth(),
  ]);
  const posicion = calcularPosicionActual(items, new Date());
  const duracionTotal = items.reduce((acc, i) => acc + i.duracionSegundos, 0);

  const contenido = (
    <>
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-neutral-100">
          Canal (Radio-TV)
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Lista de reproducción del canal simulado que se ve en la home mientras no hay señal en
          vivo real. Se reproduce en este orden, en loop, y se calcula por reloj de servidor qué
          item corresponde ahora mismo — todos los visitantes ven el mismo punto, como una
          transmisión real. Duración total del ciclo:{" "}
          <strong>{formatDuracion(duracionTotal)}</strong>.
        </p>
      </div>

      {session ? (
        <form
          action={crearCanalItem}
          className="grid grid-cols-1 gap-3 rounded-lg border border-ink-border bg-ink-card p-4 md:grid-cols-2"
        >
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
            Agregar al canal
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
                </p>
                <p className="text-sm text-muted">
                  youtube.com/watch?v={item.youtubeId} · {formatDuracion(item.duracionSegundos)}
                </p>
              </div>
              {session && (
                <div className="flex items-center gap-3">
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
            El canal está vacío — mientras no cargues nada acá, la home mostrará &quot;streaming en
            preparación&quot;.
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
