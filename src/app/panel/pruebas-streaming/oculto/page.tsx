import { StreamPlayer } from "@/components/StreamPlayer";
import { extraerVideoId } from "@/lib/youtube";

// Enlace de prueba pasado por el usuario: https://youtu.be/fVzOsi4HYAY
const ENLACE_PRUEBA = "https://youtu.be/fVzOsi4HYAY";
const videoId = extraerVideoId(ENLACE_PRUEBA);

/**
 * Solo el reproductor, sin texto explicativo (a pedido del usuario, para
 * mostrarle esto al cliente sin ruido) — reutiliza StreamPlayer en modo
 * "live" para que se vea con el mismo pulido visual del sitio real.
 */
export default function PruebaOcultoPage() {
  return (
    <div className="mx-auto w-full max-w-4xl py-2">
      {videoId ? (
        <StreamPlayer
          estado={{ tipo: "live", youtubeId: videoId, titulo: "Prueba — Video Oculto" }}
        />
      ) : (
        <p className="text-sm text-accent-soft">
          No se pudo extraer el ID de video del enlace de prueba.
        </p>
      )}
    </div>
  );
}
