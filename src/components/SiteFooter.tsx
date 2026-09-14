/**
 * Footer chico con links a las redes oficiales — se agrega a mano en cada
 * página pública (home, /explorar, /agenda), no en layout.tsx, para que no
 * aparezca en /panel (mismo patrón que el header, que cada página arma por
 * su cuenta en vez de compartir un layout único).
 */
const REDES = [
  {
    nombre: "Facebook",
    href: "https://www.facebook.com/cuarteldelmusico/?locale=es_LA",
    icono: (
      <path d="M14 9h2.5V6h-2.5c-2.21 0-4 1.79-4 4v1.5H8V14h2v7h2.5v-7H15l.5-2.5H12.5V10c0-.55.45-1 1-1Z" />
    ),
  },
  {
    nombre: "Instagram",
    href: "https://www.instagram.com/cuarteldelmusico/?hl=es",
    icono: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="4" />
        <circle cx="12" cy="12" r="3.4" />
        <circle cx="16.2" cy="7.8" r="0.9" fill="currentColor" stroke="none" />
      </>
    ),
  },
  {
    nombre: "YouTube",
    href: "https://www.youtube.com/@cuarteldelmusico",
    icono: (
      <>
        <rect x="3" y="6.5" width="18" height="11" rx="3.5" />
        <path d="M10.5 9.8v4.4l4-2.2-4-2.2Z" fill="currentColor" stroke="none" />
      </>
    ),
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-6 flex items-center justify-between border-t border-ink-border py-6 text-muted-2">
      <p className="text-xs">© {new Date().getFullYear()} Cuartel del Músico — Concepción, Chile</p>
      <div className="flex items-center gap-4">
        {REDES.map((red) => (
          <a
            key={red.nombre}
            href={red.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={red.nombre}
            title={red.nombre}
            className="text-muted-2 transition-colors hover:text-accent-soft"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className="h-5 w-5"
              aria-hidden="true"
            >
              {red.icono}
            </svg>
          </a>
        ))}
      </div>
    </footer>
  );
}
