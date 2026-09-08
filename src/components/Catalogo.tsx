"use client";

import { useMemo, useState } from "react";

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

        {/* Filtro por banda — buscador con desplegable en vez de pastillas:
            con el catálogo completo (70+ bandas) una fila de chips se
            desbordaba en varias filas; esto escala sin romperse y es más
            rápido para ubicar una banda puntual que scrollear un <select>. */}
        {bandas.length > 1 && (
          <FiltroBanda
            bandas={bandas}
            total={sesiones.length}
            filtroBanda={filtroBanda}
            onElegir={elegirFiltro}
          />
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

function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function FiltroBanda({
  bandas,
  total,
  filtroBanda,
  onElegir,
}: {
  bandas: string[];
  total: number;
  filtroBanda: string | null;
  onElegir: (banda: string | null) => void;
}) {
  const [query, setQuery] = useState(filtroBanda ?? "");
  const [abierto, setAbierto] = useState(false);

  const sugerencias = useMemo(() => {
    const q = normalizar(query.trim());
    if (!q) return bandas;
    return bandas.filter((b) => normalizar(b).includes(q));
  }, [bandas, query]);

  function elegir(banda: string | null) {
    onElegir(banda);
    setQuery(banda ?? "");
    setAbierto(false);
  }

  return (
    <div className="relative mb-5 max-w-xs">
      <label
        htmlFor="filtro-banda"
        className="mb-1.5 block font-display text-xs font-semibold tracking-widest text-muted uppercase"
      >
        Banda
      </label>
      <div className="relative">
        <input
          id="filtro-banda"
          type="text"
          role="combobox"
          aria-expanded={abierto}
          aria-controls="filtro-banda-lista"
          aria-autocomplete="list"
          autoComplete="off"
          placeholder={`Buscar entre ${total} sesiones…`}
          value={query}
          onFocus={() => setAbierto(true)}
          onBlur={() => setAbierto(false)}
          onChange={(e) => {
            setQuery(e.target.value);
            setAbierto(true);
            // Si borra el texto a mano, vuelve a "Todas" al toque —
            // no hace falta un botón de limpiar aparte.
            if (e.target.value === "" && filtroBanda) onElegir(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && sugerencias[0]) elegir(sugerencias[0]);
            if (e.key === "Escape") setAbierto(false);
          }}
          className="w-full rounded-md border border-ink-border bg-ink-card px-3 py-1.5 pr-8 text-sm text-neutral-100 outline-none placeholder:text-muted-2 focus:border-accent"
        />
        {filtroBanda && (
          <button
            type="button"
            aria-label="Quitar filtro"
            onMouseDown={(e) => {
              e.preventDefault();
              elegir(null);
            }}
            className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-2 hover:text-neutral-100"
          >
            ✕
          </button>
        )}
      </div>

      {abierto && (
        <ul
          id="filtro-banda-lista"
          className="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-ink-border bg-ink-card py-1 shadow-lg"
        >
          <li>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                elegir(null);
              }}
              className={`block w-full px-3 py-1.5 text-left text-sm hover:bg-ink-border ${
                !filtroBanda ? "text-accent-soft" : "text-neutral-100"
              }`}
            >
              Todas ({total})
            </button>
          </li>
          {sugerencias.length === 0 && (
            <li className="px-3 py-1.5 text-sm text-muted-2">Sin resultados</li>
          )}
          {sugerencias.map((banda) => (
            <li key={banda}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  elegir(banda);
                }}
                className={`block w-full px-3 py-1.5 text-left text-sm hover:bg-ink-border ${
                  filtroBanda === banda ? "text-accent-soft" : "text-neutral-100"
                }`}
              >
                {banda}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
