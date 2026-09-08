"use client";

import { useState } from "react";

type Sesion = {
  id: string;
  bandaNombre: string;
  titulo: string;
  youtubeId: string;
  descripcion: string | null;
};

export function Catalogo({ sesiones }: { sesiones: Sesion[] }) {
  const [activaId, setActivaId] = useState(sesiones[0]?.id);
  const [filtroBanda, setFiltroBanda] = useState<string | null>(null);
  const activa = sesiones.find((s) => s.id === activaId) ?? sesiones[0];

  if (!activa) {
    return (
      <p className="rounded-xl border border-ink-border bg-ink-card px-5 py-6 text-sm text-muted">
        Todavía no hay sesiones cargadas en el catálogo.
      </p>
    );
  }

  // Orden alfabético: con pocas bandas el orden de aparición se leía bien,
  // pero con el catálogo completo (70+) hace falta poder ubicar una banda
  // puntual rápido — alfabético es lo que se espera de un desplegable así.
  const bandas = [...new Set(sesiones.map((s) => s.bandaNombre))].sort((a, b) =>
    a.localeCompare(b, "es")
  );
  const sesionesFiltradas = filtroBanda
    ? sesiones.filter((s) => s.bandaNombre === filtroBanda)
    : sesiones;

  // Si el video destacado no pertenece a la banda que se acaba de elegir,
  // salta al primero de la lista filtrada — si no, el reproductor de
  // arriba se queda mostrando algo de otra banda que ya no está en la
  // grilla de abajo.
  function elegirFiltro(banda: string | null) {
    setFiltroBanda(banda);
    const lista = banda ? sesiones.filter((s) => s.bandaNombre === banda) : sesiones;
    if (!lista.some((s) => s.id === activaId)) {
      setActivaId(lista[0]?.id);
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <div>
        <div className="aspect-video w-full overflow-hidden rounded-2xl border border-ink-border bg-black">
          <iframe
            key={activa.id}
            className="h-full w-full"
            src={`https://www.youtube.com/embed/${activa.youtubeId}?autoplay=1&mute=1&modestbranding=1&rel=0&iv_load_policy=3&cc_load_policy=0`}
            title={`${activa.bandaNombre} — ${activa.titulo}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="pt-5">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-neutral-100">
            {activa.bandaNombre} — {activa.titulo}
          </h2>
          {activa.descripcion && (
            <p className="mt-1 text-sm text-muted">{activa.descripcion}</p>
          )}
        </div>
      </div>

      <div>
        <div className="mb-5 flex items-baseline gap-3.5">
          <h3 className="font-display text-sm font-semibold tracking-[0.2em] text-neutral-100 uppercase">
            Grabado en la sala
          </h3>
          <div className="h-px flex-1 bg-ink-border" />
        </div>

        {/* Filtro por banda — desplegable en vez de pastillas: con el
            catálogo completo (70+ bandas) una fila de chips se desborda en
            varias líneas y se ve desprolijo; un select escala sin problema
            y es más fácil de ubicar una banda puntual (alfabético). */}
        {bandas.length > 1 && (
          <div className="mb-5 flex items-center gap-3">
            <label
              htmlFor="filtro-banda"
              className="font-display text-xs font-semibold tracking-widest text-muted uppercase"
            >
              Banda
            </label>
            <select
              id="filtro-banda"
              value={filtroBanda ?? ""}
              onChange={(e) => elegirFiltro(e.target.value || null)}
              className="rounded-md border border-ink-border bg-ink-card px-3 py-1.5 font-display text-xs font-medium tracking-wide text-neutral-100 uppercase outline-none focus:border-accent"
            >
              <option value="">Todas ({sesiones.length})</option>
              {bandas.map((banda) => (
                <option key={banda} value={banda}>
                  {banda}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {sesionesFiltradas.map((s) => {
            const seleccionada = s.id === activa.id;
            return (
              <button
                key={s.id}
                onClick={() => setActivaId(s.id)}
                className="group flex flex-col gap-2 text-left"
              >
                <div
                  className="relative aspect-video overflow-hidden rounded-lg border bg-ink-card"
                  style={{
                    borderColor: seleccionada
                      ? "var(--color-accent)"
                      : "var(--color-ink-border)",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://img.youtube.com/vi/${s.youtubeId}/hqdefault.jpg`}
                    alt=""
                    className="h-full w-full object-cover transition-opacity group-hover:opacity-80"
                  />
                  {seleccionada && (
                    <div className="absolute top-2 left-2 rounded-full bg-accent px-2 py-0.5 font-display text-[10px] font-semibold tracking-widest text-neutral-50 uppercase">
                      Viendo
                    </div>
                  )}
                </div>
                <div>
                  <p className="truncate text-sm font-semibold text-neutral-100">
                    {s.bandaNombre}
                  </p>
                  <p className="truncate text-xs text-muted-2">{s.titulo}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
