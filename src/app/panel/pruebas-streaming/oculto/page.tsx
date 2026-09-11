import { StreamPlayer } from "@/components/StreamPlayer";
import { extraerVideoId } from "@/lib/youtube";

// Enlace de prueba pasado por el usuario: https://youtu.be/fVzOsi4HYAY
const ENLACE_PRUEBA = "https://youtu.be/fVzOsi4HYAY";
const videoId = extraerVideoId(ENLACE_PRUEBA);

/**
 * Misma presentación que el reproductor público (home) — reutiliza
 * StreamPlayer en modo "live" para que la prueba se vea con el mismo pulido
 * visual del sitio real, no como una maqueta aparte.
 */
export default function PruebaOcultoPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 py-2">
      <div>
        <a href="/panel/pruebas-streaming" className="text-sm text-muted underline underline-offset-4">
          ← Volver a pruebas
        </a>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-neutral-100">
          Prueba de concepto — video no listado
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Contenido externo de YouTube embebido con la misma presentación del
          reproductor público del sitio.
        </p>
      </div>

      {videoId ? (
        <StreamPlayer
          estado={{ tipo: "live", youtubeId: videoId, titulo: "Prueba — Video Oculto" }}
        />
      ) : (
        <p className="text-sm text-accent-soft">
          No se pudo extraer el ID de video del enlace de prueba.
        </p>
      )}

      <p className="max-w-2xl text-xs text-muted-2">
        Nota técnica: un video &quot;no listado&quot; se puede embeber sin
        problema, pero el enlace no queda protegido — no es la base para un
        contenido de acceso pago, solo para validar el formato.
      </p>
    </div>
  );
}
