/**
 * Simula un canal de TV/radio en vivo a partir de contenido grabado —
 * la misma técnica que usan Pluto TV o los canales de streaming lineal:
 * en vez de que cada visitante arranque su propia reproducción desde el
 * principio (y todos vean algo distinto según cuándo entraron), se calcula
 * por reloj de servidor en qué item de la lista y en qué segundo exacto
 * "debería estar sonando ahora" — así todos los visitantes ven el mismo
 * punto del canal, como una transmisión real.
 *
 * Pura lógica, sin acceso a datos — ver `src/lib/stream.ts` para la
 * resolución completa contra la base de datos.
 */

export type CanalItemInput = {
  duracionSegundos: number;
};

export type PosicionCanal<T> = {
  item: T;
  offsetSegundos: number;
};

/**
 * Dada una lista ordenada de items (cada uno con su duración) y un momento
 * dado, devuelve qué item corresponde y en qué segundo de ese item se
 * debería estar reproduciendo. Usa como referencia el epoch Unix, así que
 * el resultado es el mismo para cualquiera que lo calcule en el mismo
 * instante — no depende de cuándo arrancó el servidor ni de un estado
 * guardado en la base de datos.
 *
 * Devuelve null si la lista está vacía o la duración total es 0.
 */
export function calcularPosicionActual<T extends CanalItemInput>(
  items: T[],
  ahora: Date = new Date()
): PosicionCanal<T> | null {
  const duracionTotal = items.reduce((acc, it) => acc + Math.max(0, it.duracionSegundos), 0);
  if (items.length === 0 || duracionTotal <= 0) return null;

  const segundosDesdeEpoch = Math.floor(ahora.getTime() / 1000);
  let restante = segundosDesdeEpoch % duracionTotal;

  for (const item of items) {
    const duracion = Math.max(0, item.duracionSegundos);
    if (restante < duracion) {
      return { item, offsetSegundos: restante };
    }
    restante -= duracion;
  }

  // No debería llegar acá salvo por redondeos; devolvemos el primero.
  return { item: items[0], offsetSegundos: 0 };
}
