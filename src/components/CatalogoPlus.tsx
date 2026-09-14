"use client";

import { useState } from "react";

type VideoPlus = {
  id: string;
  titulo: string;
  youtubeId: string;
  descripcion: string | null;
};

/**
 * Catálogo de contenido exclusivo Plus — mismo patrón visual que
 * src/components/Catalogo.tsx (el de /explorar), simplificado (sin filtro
 * por banda: acá no hay ese dato, es contenido curado directo por el
 * staff). Los videos son unlisted de YouTube (ver VideoPlus en el schema)
 * — embeben igual que uno público, pero solo quien tenga este link llega a
 * verlos, y esta página ya está gateada por suscripción activa.
 */
export function CatalogoPlus({ videos }: { videos: VideoPlus[] }) {
  const [activaId, setActivaId] = useState(videos[0]?.id);
  const activa = videos.find((v) => v.id === activaId) ?? videos[0];

  if (!activa) {
    return (
      <p className="rounded-xl border border-ink-border bg-ink-card px-5 py-6 text-sm text-muted">
        Todavía no hay contenido cargado en Plus — vuelve pronto.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <div>
        <div className="aspect-video w-full overflow-hidden rounded-2xl border border-ink-border bg-black">
          <iframe
            key={activa.id}
            className="h-full w-full"
            src={`https://www.youtube.com/embed/${activa.youtubeId}?autoplay=1&mute=1&modestbranding=1&rel=0&iv_load_policy=3&cc_load_policy=0`}
            title={activa.titulo}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="pt-5">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-neutral-100">
            {activa.titulo}
          </h2>
          {activa.descripcion && <p className="mt-1 text-sm text-muted">{activa.descripcion}</p>}
        </div>
      </div>

      {videos.length > 1 && (
        <div>
          <div className="mb-5 flex items-baseline gap-3.5">
            <h3 className="font-display text-sm font-semibold tracking-[0.2em] text-neutral-100 uppercase">
              Más contenido Plus
            </h3>
            <div className="h-px flex-1 bg-ink-border" />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {videos.map((v) => {
              const seleccionado = v.id === activa.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setActivaId(v.id)}
                  className="group flex flex-col gap-2 text-left"
                >
                  <div
                    className="relative aspect-video overflow-hidden rounded-lg border bg-ink-card"
                    style={{
                      borderColor: seleccionado ? "var(--color-accent)" : "var(--color-ink-border)",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`}
                      alt=""
                      className="h-full w-full object-cover transition-opacity group-hover:opacity-80"
                    />
                    {seleccionado && (
                      <div className="absolute top-2 left-2 rounded-full bg-accent px-2 py-0.5 font-display text-[10px] font-semibold tracking-widest text-neutral-50 uppercase">
                        Viendo
                      </div>
                    )}
                  </div>
                  <p className="truncate text-sm font-semibold text-neutral-100">{v.titulo}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
