import { StreamPlayer } from "@/components/StreamPlayer";
import { extraerVideoId } from "@/lib/youtube";

// Enlace de prueba pasado por el usuario:
// https://www.youtube.com/live/rFuPb91Avd4
const ENLACE_PRUEBA = "https://www.youtube.com/live/rFuPb91Avd4";
const videoId = extraerVideoId(ENLACE_PRUEBA);

/**
 * Solo el reproductor, sin texto explicativo (a pedido del usuario, para
 * mostrarle esto al cliente sin ruido) — reutiliza StreamPlayer en modo
 * "live" para que se vea con el mismo pulido visual del sitio real.
 */
export default function PruebaEnVivoPage() {
  return (
    <div className="mx-auto w-full max-w-4xl py-2">
      {videoId ? (
        <StreamPlayer
          estado={{ tipo: "live", youtubeId: videoId, titulo: "Prueba — Streaming En Vivo" }}
        />
      ) : (
        <p className="text-sm text-accent-soft">
          No se pudo extraer el ID de video del enlace de prueba.
        </p>
      )}
    </div>
  );
}
