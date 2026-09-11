import type { EstadoStream } from "@/lib/stream";
import { CanalAutoRefresh } from "@/components/CanalAutoRefresh";

/**
 * Reproductor embebido del canal público.
 * - tipo "canal": canal simulado (fase 1) armado con `CanalItem` — todos los
 *   visitantes ven el mismo punto de la programación, calculado por reloj de
 *   servidor (ver `src/lib/canal.ts`), y avanza solo al siguiente item.
 * - tipo "live": señal en vivo real de YouTube (fase 2).
 * - tipo "vacio": sin contenido configurado, muestra un aviso.
 */
export function StreamPlayer({ estado }: { estado: EstadoStream }) {
  if (estado.tipo === "vacio") {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-ink-border bg-ink-card">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(225,29,46,0.12),transparent_45%)]" />
        <div className="relative flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
          <span className="font-display text-lg font-semibold tracking-wide text-neutral-200">
            El streaming está en preparación
          </span>
          <p className="text-sm text-muted">Vuelve pronto 🤘</p>
        </div>
      </div>
    );
  }

  const esVivo = estado.tipo === "live";
  // modestbranding/rel/iv_load_policy: reduce el chrome propio de YouTube
  // (logo grande, sugeridos) para que se sienta canal propio, no un video
  // embebido — sin sacar controls (ahí vive el botón de mute/volumen).
  // mute=1 es obligatorio: varios navegadores bloquean el autoplay con
  // sonido sin interacción previa del visitante y, si eso pasa, YouTube deja
  // el video pausado en vez de sonar — y un video pausado al entrar no es
  // aceptable bajo ninguna circunstancia (a pedido del usuario). Entra
  // silenciado pero reproduciendo siempre; el visitante puede sacarle el
  // mute a mano con el control de volumen.
  const paramsComunes =
    "autoplay=1&mute=1&modestbranding=1&rel=0&iv_load_policy=3&cc_load_policy=0";
  const src = esVivo
    ? `https://www.youtube.com/embed/${estado.youtubeId}?${paramsComunes}`
    : `https://www.youtube.com/embed/${estado.youtubeId}?${paramsComunes}&start=${estado.startSegundos}`;
  const titulo = esVivo ? (estado.titulo ?? "Cuartel del Músico — En Vivo") : estado.tituloItem;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-ink-border bg-black">
      {estado.tipo === "canal" && <CanalAutoRefresh refreshEnMs={estado.refreshEnMs} />}
      <iframe
        key={src}
        className="h-full w-full"
        src={src}
        title={titulo}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />

      {/* badge de estado */}
      <div className="pointer-events-none absolute top-4 left-4 flex items-center gap-2 rounded-full border border-white/10 bg-ink/55 px-4 py-2 backdrop-blur-sm">
        <span
          className={`h-2.5 w-2.5 rounded-full animate-pulse-dot ${
            esVivo ? "bg-accent" : "bg-amber"
          }`}
        />
        <span
          className={`font-display text-xs font-semibold tracking-[0.2em] uppercase ${
            esVivo ? "text-accent-soft" : "text-amber"
          }`}
        >
          {esVivo ? "En vivo" : "En reproducción"}
        </span>
      </div>

      {/* tag de contenido — oculto en mobile: junto al badge de estado no
          entran los dos en el ancho del video, y el de estado es el que
          importa de verdad. */}
      {!esVivo && (
        <div className="pointer-events-none absolute top-4 right-4 hidden items-center gap-2 rounded-full border border-white/10 bg-ink/55 px-3.5 py-2 backdrop-blur-sm sm:flex">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 18V5l12-2v13"
              stroke="#f2a900"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="6" cy="18" r="3" stroke="#f2a900" strokeWidth="2" />
            <circle cx="18" cy="16" r="3" stroke="#f2a900" strokeWidth="2" />
          </svg>
          <span className="text-[11px] font-semibold tracking-wide text-neutral-300 uppercase">
            Canal · Cuartel del Músico
          </span>
        </div>
      )}
    </div>
  );
}
