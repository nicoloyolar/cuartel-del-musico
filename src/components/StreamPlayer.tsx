type StreamConfig = {
  modo: string;
  youtubeId: string | null;
  titulo: string | null;
};

/**
 * Reproductor embebido del canal público.
 * - modo "playlist": reproduce una lista de reproducción de YouTube (fase 1,
 *   mientras se arma la transmisión en vivo física).
 * - modo "live": reproduce un video/canal en vivo de YouTube (fase 2).
 * Sin youtubeId configurado, muestra un aviso de "streaming próximamente".
 */
export function StreamPlayer({ config }: { config: StreamConfig | null }) {
  const youtubeId = config?.youtubeId?.trim();

  if (!youtubeId) {
    return (
      <div className="aspect-video w-full flex items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-400">
        <p className="text-center px-6">
          El streaming está en preparación.
          <br />
          Vuelve pronto 🎸
        </p>
      </div>
    );
  }

  const src =
    config?.modo === "live"
      ? `https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1`
      : `https://www.youtube.com/embed/videoseries?list=${youtubeId}&autoplay=1&mute=1`;

  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg border border-neutral-800 bg-black">
      <iframe
        className="h-full w-full"
        src={src}
        title={config?.titulo ?? "Cuartel del Músico — En Vivo"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
