import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Catalogo } from "@/components/Catalogo";

export const dynamic = "force-dynamic";

export default async function ExplorarPage() {
  const sesiones = await prisma.sesion.findMany({ orderBy: { orden: "asc" } });

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-3 px-6 py-6 sm:px-10">
      <header className="flex items-center justify-between py-4">
        <div>
          <Link
            href="/"
            className="font-display text-xs font-semibold tracking-widest text-muted uppercase hover:text-neutral-100"
          >
            ← Volver al streaming
          </Link>
          <h1 className="mt-2 font-display text-lg font-semibold tracking-widest text-neutral-100 uppercase">
            Explorar la escena de Concepción
          </h1>
        </div>
      </header>

      <Catalogo sesiones={sesiones} />
    </main>
  );
}
