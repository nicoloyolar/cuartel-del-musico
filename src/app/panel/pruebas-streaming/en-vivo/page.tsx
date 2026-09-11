import { extraerVideoId } from "@/lib/youtube";

// Enlace de prueba pasado por el usuario:
// https://www.youtube.com/live/rFuPb91Avd4
const ENLACE_PRUEBA = "https://www.youtube.com/live/rFuPb91Avd4";
const videoId = extraerVideoId(ENLACE_PRUEBA);

export default function PruebaEnVivoPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <a href="/panel/pruebas-streaming" className="text-sm text-muted underline underline-offset-4">
          ← Volver a pruebas
        </a>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-neutral-100">
          Prueba: streaming en vivo externo
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Valida si un streaming/podcast hecho por YouTube, fuera de la señal
          principal del canal, se puede traer a la plataforma. Si esto se ve
          bien, la idea de streaming externo vía YouTube es viable.
        </p>
      </div>

      {videoId ? (
        <div className="relative aspect-video w-full max-w-3xl overflow-hidden rounded-2xl border border-ink-border bg-black">
          <iframe
            className="h-full w-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&modestbranding=1&rel=0`}
            title="Prueba — streaming en vivo externo"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <p className="text-sm text-accent-soft">
          No se pudo extraer el ID de video del enlace de prueba.
        </p>
      )}

      <div className="max-w-3xl rounded-lg border border-ink-border bg-ink-card p-4 text-sm text-muted">
        <strong className="text-neutral-200">Qué mirar:</strong> si el video
        carga y reproduce normalmente, la prueba es exitosa — confirma que un
        stream/podcast externo por YouTube se puede embeber igual que la
        señal principal (mismo mecanismo que ya usa <code>/</code> en modo
        &quot;live&quot;).
      </div>
    </div>
  );
}
