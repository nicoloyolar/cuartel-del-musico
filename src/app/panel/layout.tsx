import Link from "next/link";
import { auth, signOut } from "@/auth";

const NAV = [
  { href: "/panel", label: "Dashboard" },
  { href: "/panel/reservas", label: "Reservas" },
  { href: "/panel/bandas", label: "Bandas" },
  { href: "/panel/equipos", label: "Equipos" },
  { href: "/panel/cobros", label: "Cobros" },
  { href: "/panel/streaming", label: "Streaming" },
  { href: "/panel/canal", label: "Canal (Radio-TV)" },
  { href: "/panel/sesiones", label: "Sesiones (Explorar)" },
];

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // La página de login, y por ahora /panel/streaming y /panel/canal (ver
  // proxy.ts), no llevan la barra de navegación del staff — cada una se
  // encarga de su propio padding.
  if (!session) {
    return <div className="flex min-h-screen flex-1 flex-col">{children}</div>;
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col md:flex-row">
      <aside className="flex shrink-0 flex-col gap-1 border-b border-ink-border bg-ink-card p-4 md:w-56 md:border-b-0 md:border-r">
        <p className="mb-4 px-2 font-display text-xs font-semibold tracking-widest text-muted uppercase">
          Cuartel del Músico
        </p>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-2 py-1.5 text-sm text-neutral-300 hover:bg-ink-border hover:text-neutral-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/panel/login" });
          }}
        >
          <button
            type="submit"
            className="mt-4 w-full rounded-md px-2 py-1.5 text-left text-sm text-muted hover:bg-ink-border hover:text-neutral-100"
          >
            Cerrar sesión
          </button>
        </form>
      </aside>
      <main className="flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
