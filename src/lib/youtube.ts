/**
 * Utilidades para trabajar con IDs de YouTube (videos y playlists), usadas
 * tanto por el panel de streaming (/panel/streaming) como por el catálogo
 * de sesiones (/panel/sesiones) para que ambos formularios acepten pegar
 * el link completo o el ID pelado, de forma consistente.
 */

/** IDs de playlist de YouTube empiezan con PL, LL, FL, UU, RD, OL, etc. */
const PLAYLIST_ID_RE = /^[a-zA-Z0-9_-]{10,34}$/;
const VIDEO_ID_RE = /^[a-zA-Z0-9_-]{11}$/;

/**
 * Extrae un ID de video de una URL de YouTube (watch?v=, youtu.be/, embed/,
 * shorts/) o lo devuelve tal cual si ya es un ID pelado de 11 caracteres.
 * Devuelve null si no logra reconocer nada válido.
 */
export function extraerVideoId(valor: string): string | null {
  const limpio = valor.trim();
  const match = limpio.match(
    /(?:v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/
  );
  if (match) return match[1];
  if (VIDEO_ID_RE.test(limpio)) return limpio;
  return null;
}

/**
 * Extrae un ID de playlist de una URL de YouTube (?list=...) o lo devuelve
 * tal cual si ya es un ID pelado. Devuelve null si no reconoce nada válido.
 */
export function extraerPlaylistId(valor: string): string | null {
  const limpio = valor.trim();
  const match = limpio.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  if (PLAYLIST_ID_RE.test(limpio)) return limpio;
  return null;
}

/**
 * Extrae un ID de YouTube (de video o de playlist) aceptando tanto un link
 * completo como un ID pelado. Usado donde no importa distinguir el tipo
 * (ej. catálogo de sesiones, que siempre son videos sueltos).
 */
export function extraerYoutubeId(valor: string): string | null {
  return extraerVideoId(valor) ?? extraerPlaylistId(valor);
}
