import Link from "next/link";

/**
 * /panel/streaming y /panel/canal quedan accesibles sin login mientras el
 * panel interno de gestión no está desarrollado ni diseñado (ver proxy.ts),
 * así que no llevan la barra lateral del staff. Esta mini-nav es lo único
 * que les da para moverse entre ambas y volver al sitio público.
 */
export function StreamingSubNav() {
  return (
    <nav className="flex items-center gap-4 border-b border-ink-border pb-4 text-sm">
      <Link href="/panel/streaming" className="text-muted hover:text-neutral-100">
        Streaming
      </Link>
      <Link href="/panel/canal" className="text-muted hover:text-neutral-100">
        Canal (Radio-TV)
      </Link>
      <Link href="/" className="ml-auto text-muted-2 hover:text-neutral-100">
        ← Volver al sitio
      </Link>
    </nav>
  );
}
