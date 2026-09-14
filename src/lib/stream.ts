import { prisma } from "@/lib/prisma";
import { calcularPosicionActual } from "@/lib/canal";
import { seccionActiva, proximoCambioSeccionMin } from "@/lib/horarios";

export type EstadoStream =
  | { tipo: "vacio" }
  | { tipo: "live"; youtubeId: string; titulo: string | null }
  | {
      tipo: "canal";
      itemId: string;
      youtubeId: string;
      tituloItem: string;
      startSegundos: number;
      refreshEnMs: number;
      tituloConfig: string | null;
      seccion: string;
    };

/**
 * Resuelve qué debe mostrar el reproductor público ahora mismo, según el
 * modo configurado en `StreamConfig`:
 * - "live": una señal en vivo real de YouTube (Fase 2).
 * - "playlist": el canal simulado armado con `CanalItem` (ver `src/lib/canal.ts`),
 *   dentro de la sección (Radio-TV/Podcast) que toque según el horario
 *   configurado en /panel/horarios (ver `src/lib/horarios.ts`).
 */
export async function resolverEstadoStream(): Promise<EstadoStream> {
  const config = await prisma.streamConfig.findUnique({ where: { id: 1 } });
  if (!config) return { tipo: "vacio" };

  if (config.modo === "live") {
    if (!config.youtubeId) return { tipo: "vacio" };
    return { tipo: "live", youtubeId: config.youtubeId, titulo: config.titulo };
  }

  const ahora = new Date();
  const bloques = await prisma.bloqueHorario.findMany({ orderBy: { createdAt: "asc" } });
  const seccion = seccionActiva(bloques, ahora);

  // Los bloqueados (ver CanalItem.bloqueado) se excluyen del ciclo: son
  // items que el reproductor detectó que YouTube rechaza embeber (ej. un
  // reclamo de Content ID) y no deben volver a programarse hasta que un
  // admin los reactive desde /panel/canal. Cada sección corre su propio
  // ciclo — no comparten orden ni posición entre sí.
  const items = await prisma.canalItem.findMany({
    where: { bloqueado: false, seccion: seccion as "RADIO_TV" | "PODCAST" },
    orderBy: { orden: "asc" },
  });
  const posicion = calcularPosicionActual(items, ahora);
  if (!posicion) return { tipo: "vacio" };

  const restanteItemSegundos = posicion.item.duracionSegundos - posicion.offsetSegundos;
  // Si el horario cambia de sección antes de que termine este item, hay que
  // refrescar en ese momento (no cuando termine el item) para no seguir
  // mostrando la sección vieja de más.
  const minutosHastaCambioSeccion = proximoCambioSeccionMin(bloques, ahora);
  const restanteSegundos =
    minutosHastaCambioSeccion === null
      ? restanteItemSegundos
      : Math.min(restanteItemSegundos, minutosHastaCambioSeccion * 60);

  return {
    tipo: "canal",
    itemId: posicion.item.id,
    youtubeId: posicion.item.youtubeId,
    tituloItem: posicion.item.titulo,
    startSegundos: posicion.offsetSegundos,
    // mínimo 1s para evitar refrescos en loop si algo quedó en 0
    refreshEnMs: Math.max(1000, restanteSegundos * 1000),
    tituloConfig: config.titulo,
    seccion,
  };
}
