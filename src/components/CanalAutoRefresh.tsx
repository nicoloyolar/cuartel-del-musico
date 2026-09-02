"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Cuando el canal simulado está mostrando un item, este componente invisible
 * agenda un refresh de la ruta justo cuando ese item debería terminar, para
 * que el reproductor pase al siguiente automáticamente — como si fuera un
 * canal en vivo de verdad, sin que el visitante tenga que recargar a mano.
 */
export function CanalAutoRefresh({ refreshEnMs }: { refreshEnMs: number }) {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.refresh(), refreshEnMs);
    return () => clearTimeout(timer);
  }, [refreshEnMs, router]);

  return null;
}
