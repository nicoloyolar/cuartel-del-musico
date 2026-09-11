import { extraerVideoId } from "@/lib/youtube";

// Enlace de prueba pasado por el usuario: https://youtu.be/fVzOsi4HYAY
const ENLACE_PRUEBA = "https://youtu.be/fVzOsi4HYAY";
const videoId = extraerVideoId(ENLACE_PRUEBA);

export default function PruebaOcultoPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <a href="/panel/pruebas-streaming" className="text-sm text-muted underline underline-offset-4">
          ← Volver a pruebas
        </a>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-neutral-100">
          Prueba: video oculto (no listado)
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Valida si un video no listado de YouTube se puede embeber en la
          plataforma. Se espera que sí funcione.
        </p>
      </div>

      {videoId ? (
        <div className="relative aspect-video w-full max-w-3xl overflow-hidden rounded-2xl border border-ink-border bg-black">
          <iframe
            className="h-full w-full"
            src={`https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0`}
            title="Prueba — video oculto"
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
        <p>
          <strong className="text-neutral-200">Qué mirar:</strong> si el
          video carga, la prueba técnica es exitosa.
        </p>
        <p className="mt-2 text-accent-soft">
          <strong>Pero ojo:</strong> esto <strong>no es un mecanismo de
          acceso pago real</strong>. Para que este iframe funcione, el ID del
          video (<code>{videoId ?? "…"}</code>) tiene que viajar en el
          HTML/red que le servimos al navegador — cualquier visitante puede
          copiarlo con las herramientas de desarrollador y verlo directo en
          YouTube, sin pagar ninguna suscripción. &quot;No listado&quot;
          significa difícil de encontrar por búsqueda, no protegido. No
          alcanza como base técnica para la versión &quot;plus&quot;.
        </p>
      </div>
    </div>
  );
}
