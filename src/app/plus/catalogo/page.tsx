import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { obtenerSuscriptorActual, tieneAccesoActivo } from "@/lib/plusAcceso";
import { CatalogoPlus } from "@/components/CatalogoPlus";

export const dynamic = "force-dynamic";

export default async function CatalogoPlusPage() {
  const suscriptor = await obtenerSuscriptorActual();
  const activo = tieneAccesoActivo(suscriptor);

  if (!suscriptor || !activo) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center gap-4 px-6 py-16 text-center">
        <h1 className="font-display text-xl font-semibold tracking-tight text-neutral-100">
          Esto es solo para suscriptores Plus
        </h1>
        <p className="text-sm text-muted">
          {suscriptor
            ? "Tu suscripción no está activa."
            : "Iniciá sesión con tu cuenta Plus para ver este contenido."}
        </p>
        <Link
          href={suscriptor ? "/plus/cuenta" : "/plus/login"}
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-neutral-50 transition-colors hover:bg-accent-soft"
        >
          {suscriptor ? "Ir a mi cuenta" : "Iniciar sesión"}
        </Link>
      </main>
    );
  }

  const videos = await prisma.videoPlus.findMany({ orderBy: { orden: "asc" } });

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-3 px-6 py-6 sm:px-10">
      <header className="flex items-center justify-between py-4">
        <div>
          <Link
            href="/plus/cuenta"
            className="font-display text-xs font-semibold tracking-widest text-muted uppercase hover:text-neutral-100"
          >
            ← Mi cuenta
          </Link>
          <h1 className="mt-2 font-display text-lg font-semibold tracking-widest text-neutral-100 uppercase">
            Cuartel del Músico Plus
          </h1>
        </div>
      </header>

      <CatalogoPlus videos={videos} />
    </main>
  );
}
