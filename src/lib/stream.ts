import { prisma } from "@/lib/prisma";
import { calcularPosicionActual } from "@/lib/canal";

export type EstadoStream =
  | { tipo: "vacio" }
  | { tipo: "live"; youtubeId: string; titulo: string | null }
  | {
      tipo: "canal";
      youtubeId: string;
      tituloItem: string;
      startSegundos: number;
      refreshEnMs: number;
      tituloConfig: string | null;
    };

/**
 * Resuelve qué debe mostrar el reproductor público ahora mismo, según el
 * modo configurado en `StreamConfig`:
 * - "live": una señal en vivo real de YouTube (Fase 2).
 * - "playlist": el canal simulado armado con `CanalItem` (ver `src/lib/canal.ts`).
 */
export async function resolverEstadoStream(): Promise<EstadoStream> {
  const config = await prisma.streamConfig.findUnique({ where: { id: 1 } });
  if (!config) return { tipo: "vacio" };

  if (config.modo === "live") {
    if (!config.youtubeId) return { tipo: "vacio" };
    return { tipo: "live", youtubeId: config.youtubeId, titulo: config.titulo };
  }

  const items = await prisma.canalItem.findMany({ orderBy: { orden: "asc" } });
  const posicion = calcularPosicionActual(items, new Date());
  if (!posicion) return { tipo: "vacio" };

  const restanteSegundos = posicion.item.duracionSegundos - posicion.offsetSegundos;
  return {
    tipo: "canal",
    youtubeId: posicion.item.youtubeId,
    tituloItem: posicion.item.titulo,
    startSegundos: posicion.offsetSegundos,
    // mínimo 1s para evitar refrescos en loop si algo quedó en 0
    refreshEnMs: Math.max(1000, restanteSegundos * 1000),
    tituloConfig: config.titulo,
  };
}
