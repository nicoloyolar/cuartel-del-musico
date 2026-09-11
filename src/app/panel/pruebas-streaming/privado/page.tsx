import { extraerVideoId } from "@/lib/youtube";

// Enlace de prueba pasado por el usuario: https://youtu.be/3MPeiwNZFkM
const ENLACE_PRUEBA = "https://youtu.be/3MPeiwNZFkM";
const videoId = extraerVideoId(ENLACE_PRUEBA);

export default function PruebaPrivadoPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 py-2">
      <div>
        <a href="/panel/pruebas-streaming" className="text-sm text-muted underline underline-offset-4">
          ← Volver a pruebas
        </a>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-neutral-100">
          Prueba: video privado
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Valida si un video privado de YouTube se puede embeber en la
          plataforma.{" "}
          <strong className="text-accent-soft">
            Se espera que esto falle
          </strong>{" "}
          — YouTube no permite embeber videos privados en sitios de terceros
          bajo ninguna circunstancia, ni con el visitante logueado en una
          cuenta con acceso. Esta página es para confirmarlo en los hechos.
        </p>
      </div>

      {videoId ? (
        <div className="relative aspect-video w-full max-w-3xl overflow-hidden rounded-2xl border border-ink-border bg-black">
          <iframe
            className="h-full w-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&modestbranding=1&rel=0`}
            title="Prueba — video privado"
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
        <strong className="text-neutral-200">Qué mirar:</strong> el recuadro
        de arriba debería mostrar un mensaje de YouTube tipo &quot;Video no
        disponible&quot; / &quot;Este video es privado&quot;. Si eso es lo
        que ves, la prueba confirma el límite: videos privados de YouTube no
        sirven como base técnica para contenido exclusivo de la versión
        &quot;plus&quot; — haría falta un proveedor de video distinto (con
        URLs firmadas/token de acceso) para eso.
      </div>
    </div>
  );
}
