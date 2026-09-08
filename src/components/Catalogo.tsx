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

  // Orden de aparición: la primera vez que aparece cada banda en la lista
  // (ya viene ordenada por `orden` desde /panel/sesiones).
  const bandas = [...new Set(sesiones.map((s) => s.bandaNombre))];
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
            src={`https://www.youtube.com/embed/${activa.youtubeId}?autoplay=1`}
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

        {/* Filtro por banda — solo se muestra si hay más de una banda. */}
        {bandas.length > 1 && (
          <div className="mb-5 flex flex-wrap gap-2">
            <button
              onClick={() => elegirFiltro(null)}
              className={`rounded-full border px-3 py-1 font-display text-xs font-medium tracking-wide uppercase transition-colors ${
                !filtroBanda
                  ? "border-accent bg-accent/10 text-accent-soft"
                  : "border-ink-border text-muted hover:border-ink-border-soft hover:text-neutral-100"
              }`}
            >
              Todas
            </button>
            {bandas.map((banda) => (
              <button
                key={banda}
                onClick={() => elegirFiltro(banda)}
                className={`rounded-full border px-3 py-1 font-display text-xs font-medium tracking-wide uppercase transition-colors ${
                  filtroBanda === banda
                    ? "border-accent bg-accent/10 text-accent-soft"
                    : "border-ink-border text-muted hover:border-ink-border-soft hover:text-neutral-100"
                }`}
              >
                {banda}
              </button>
            ))}
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
