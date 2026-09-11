import { StreamPlayer } from "@/components/StreamPlayer";
import { extraerVideoId } from "@/lib/youtube";

// Enlace de prueba pasado por el usuario:
// https://www.youtube.com/live/rFuPb91Avd4
const ENLACE_PRUEBA = "https://www.youtube.com/live/rFuPb91Avd4";
const videoId = extraerVideoId(ENLACE_PRUEBA);

/**
 * Misma presentación que el reproductor público (home) — reutiliza
 * StreamPlayer en modo "live" para que la prueba se vea con el mismo pulido
 * visual del sitio real (mismo componente, badge "EN VIVO", audio activado
 * por defecto), no como una maqueta aparte.
 */
export default function PruebaEnVivoPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 py-2">
      <div>
        <a href="/panel/pruebas-streaming" className="text-sm text-muted underline underline-offset-4">
          ← Volver a pruebas
        </a>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-neutral-100">
          Prueba: streaming en vivo externo
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Valida si un streaming/podcast hecho por YouTube, fuera de la señal
          principal del canal, se puede traer a la plataforma con la misma
          presentación del reproductor público del sitio.
        </p>
      </div>

      {videoId ? (
        <StreamPlayer
          estado={{ tipo: "live", youtubeId: videoId, titulo: "Prueba — Streaming En Vivo" }}
        />
      ) : (
        <p className="text-sm text-accent-soft">
          No se pudo extraer el ID de video del enlace de prueba.
        </p>
      )}

      <div className="max-w-3xl rounded-lg border border-ink-border bg-ink-card p-4 text-sm text-muted">
        <strong className="text-neutral-200">Qué mirar:</strong> si el video
        carga y reproduce normalmente, la prueba es exitosa — confirma que un
        stream/podcast externo por YouTube se puede embeber igual que la
        señal principal (mismo componente que ya usa <code>/</code> en modo
        &quot;live&quot;).
      </div>
    </div>
  );
}
