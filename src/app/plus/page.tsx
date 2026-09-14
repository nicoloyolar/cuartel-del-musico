import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { obtenerSuscriptorActual } from "@/lib/plusAcceso";
import { SiteFooter } from "@/components/SiteFooter";

export const dynamic = "force-dynamic";

export default async function PlusLandingPage() {
  const [plan, suscriptor] = await Promise.all([
    prisma.planPlusConfig.findUnique({ where: { id: 1 } }),
    obtenerSuscriptorActual(),
  ]);

  const precio = plan
    ? new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(
        plan.precioMensual
      )
    : null;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-3 px-6 py-6 sm:px-10">
      <header className="flex items-center justify-between py-4">
        <Link
          href="/"
          className="font-display text-xs font-semibold tracking-widest text-muted uppercase hover:text-neutral-100"
        >
          ← Volver al streaming
        </Link>
      </header>

      <section className="flex flex-col items-center gap-4 py-12 text-center">
        <span className="font-display text-xs font-semibold tracking-[0.3em] text-amber uppercase">
          {plan?.nombre ?? "Cuartel del Músico Plus"}
        </span>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-neutral-100 sm:text-4xl">
          Contenido exclusivo de la sala
        </h1>
        <p className="max-w-xl text-sm text-muted">
          Acceso a grabaciones y material que no está en el canal público ni en el catálogo de{" "}
          <Link href="/explorar" className="underline underline-offset-4 hover:text-neutral-200">
            Explorar la escena
          </Link>
          .
        </p>
        {precio && (
          <p className="font-display text-2xl font-semibold text-neutral-100">
            {precio} <span className="text-sm font-normal text-muted">/ mes</span>
          </p>
        )}

        <div className="mt-4 flex gap-3">
          {suscriptor ? (
            <Link
              href="/plus/cuenta"
              className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-neutral-50 transition-colors hover:bg-accent-soft"
            >
              Ir a mi cuenta
            </Link>
          ) : (
            <>
              <Link
                href="/plus/registro"
                className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-neutral-50 transition-colors hover:bg-accent-soft"
              >
                Suscribirme
              </Link>
              <Link
                href="/plus/login"
                className="rounded-md border border-ink-border px-5 py-2.5 text-sm font-semibold text-neutral-100 hover:bg-ink-card"
              >
                Ya tengo cuenta
              </Link>
            </>
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
