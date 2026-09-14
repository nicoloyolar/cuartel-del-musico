"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { marcarCanalItemBloqueado } from "@/app/panel/canal/actions";

// Tipado mínimo de la IFrame API de YouTube — no hay @types oficiales, y
// esto es lo único que se usa de ella.
type YTPlayer = { destroy: () => void };
type YTErrorEvent = { data: number };
declare global {
  interface Window {
    YT?: {
      Player: new (
        target: HTMLElement,
        opciones: {
          videoId: string;
          playerVars: Record<string, number>;
          events: { onError: (e: YTErrorEvent) => void };
        }
      ) => YTPlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let cargaApi: Promise<void> | null = null;

/** Carga el script de la IFrame API una sola vez, sin pisar otro listo previo. */
function cargarYoutubeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (cargaApi) return cargaApi;

  cargaApi = new Promise((resolve) => {
    const anterior = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      anterior?.();
      resolve();
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(script);
  });
  return cargaApi;
}

// Códigos de error de la IFrame API (developers.google.com/youtube/iframe_api_reference#onError):
// 100 = video eliminado o privado. 101/150 = el dueño (o un reclamo de
// Content ID, como el de LatinAutor-UMPG que originó esto) no permite
// embeberlo. 2 (parámetro inválido) no aplica acá — no se reintenta por eso.
const CODIGOS_NO_REPRODUCIBLE = new Set([100, 101, 150]);

/**
 * Reproductor del canal simulado vía la IFrame API de YouTube (en vez de un
 * <iframe src=...> plano) para poder detectar cuándo YouTube rechaza
 * reproducir el video del item actual y reaccionar: marcarlo `bloqueado`
 * (ver actions.ts) y refrescar la ruta para saltar al siguiente item ya,
 * en vez de dejar el error en pantalla por el resto de su duración.
 */
export function CanalPlayer({
  itemId,
  youtubeId,
  startSegundos,
  titulo,
}: {
  itemId: string;
  youtubeId: string;
  startSegundos: number;
  titulo: string;
}) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    let player: YTPlayer | undefined;
    let cancelado = false;

    cargarYoutubeApi().then(() => {
      if (cancelado || !contenedorRef.current || !window.YT) return;
      player = new window.YT.Player(contenedorRef.current, {
        videoId: youtubeId,
        playerVars: {
          autoplay: 1,
          mute: 1,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          cc_load_policy: 0,
          start: startSegundos,
        },
        events: {
          onError: (evento) => {
            if (!CODIGOS_NO_REPRODUCIBLE.has(evento.data)) return;
            marcarCanalItemBloqueado(itemId).finally(() => router.refresh());
          },
        },
      });
    });

    return () => {
      cancelado = true;
      player?.destroy();
    };
    // itemId/youtubeId/startSegundos cambian juntos en cada item del canal —
    // el componente se remonta entero por el `key` que le pone StreamPlayer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId, youtubeId, startSegundos]);

  return <div ref={contenedorRef} className="h-full w-full" title={titulo} />;
}
