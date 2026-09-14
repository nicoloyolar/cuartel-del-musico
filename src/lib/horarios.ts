/**
 * Decide qué sección del canal (Radio-TV o Podcast) debería estar al aire en
 * un momento dado, según los bloques horarios configurados en /panel/horarios.
 * Pura lógica, sin acceso a datos — ver `src/lib/stream.ts` para cómo se usa
 * junto con `calcularPosicionActual` (misma técnica de canal lineal, pero
 * aplicada solo a los items de la sección activa).
 */

export const SECCION_DEFECTO = "RADIO_TV";

export type BloqueHorarioInput = {
  seccion: string;
  /** CSV de días JS Date#getDay (0=domingo..6=sábado), ej "1,2,3,4,5". */
  dias: string;
  horaInicioMin: number;
  horaFinMin: number;
};

/**
 * Devuelve la sección activa ahora mismo. Si ningún bloque matchea (o no hay
 * bloques configurados), devuelve RADIO_TV — así el canal se comporta igual
 * que antes de existir esta feature mientras nadie configure horarios.
 * Si hay bloques superpuestos, gana el primero en el orden recibido
 * (convención: pasar los bloques ordenados por createdAt asc).
 */
export function seccionActiva(bloques: BloqueHorarioInput[], ahora: Date = new Date()): string {
  const dia = ahora.getDay();
  const minutos = ahora.getHours() * 60 + ahora.getMinutes();

  for (const bloque of bloques) {
    const dias = bloque.dias
      .split(",")
      .map((d) => Number(d.trim()))
      .filter((d) => !Number.isNaN(d));
    if (!dias.includes(dia)) continue;

    const cruzaMedianoche = bloque.horaFinMin <= bloque.horaInicioMin;
    const enVentana = cruzaMedianoche
      ? minutos >= bloque.horaInicioMin || minutos < bloque.horaFinMin
      : minutos >= bloque.horaInicioMin && minutos < bloque.horaFinMin;

    if (enVentana) return bloque.seccion;
  }

  return SECCION_DEFECTO;
}

/**
 * Minutos hasta el próximo cambio de sección, buscando minuto a minuto hacia
 * adelante hasta `maxMinutos` (default 24h). Sirve para que el reproductor
 * refresque a tiempo cuando el horario cambia de sección a mitad de un item
 * largo, en vez de esperar a que ese item termine solo. Devuelve null si no
 * hay cambio dentro de la ventana (ej. sin bloques configurados: siempre
 * RADIO_TV, nunca cambia).
 */
export function proximoCambioSeccionMin(
  bloques: BloqueHorarioInput[],
  ahora: Date = new Date(),
  maxMinutos = 24 * 60
): number | null {
  const actual = seccionActiva(bloques, ahora);
  for (let i = 1; i <= maxMinutos; i++) {
    const futuro = new Date(ahora.getTime() + i * 60_000);
    if (seccionActiva(bloques, futuro) !== actual) return i;
  }
  return null;
}
