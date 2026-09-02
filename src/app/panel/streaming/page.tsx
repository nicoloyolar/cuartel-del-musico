import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { resolverEstadoStream } from "@/lib/stream";
import { StreamPlayer } from "@/components/StreamPlayer";
import { StreamingSubNav } from "@/components/panel/StreamingSubNav";
import { StreamingForm } from "./StreamingForm";

export const dynamic = "force-dynamic";

export default async function StreamingConfigPage() {
  const [config, estado, session] = await Promise.all([
    prisma.streamConfig.findUnique({ where: { id: 1 } }),
    resolverEstadoStream(),
    auth(),
  ]);

  const contenido = (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Configuración del streaming</h1>
      <p className="max-w-2xl text-sm text-neutral-400">
        Mientras se arma la transmisión en vivo desde la sala, deja el modo en{" "}
        <strong>Canal</strong>: reproduce en orden el contenido cargado en /panel/canal,
        sincronizado para que todos los visitantes vean el mismo punto. Cuando esté lista la señal
        en vivo, cambia a <strong>En vivo</strong> y pega el link o ID del video/transmisión activa
        de YouTube.
      </p>

      <StreamingForm config={config} />

      <div className="max-w-2xl">
        <h2 className="mb-2 text-sm font-semibold text-neutral-400">
          Vista previa (lo que ve el público ahora mismo)
        </h2>
        <StreamPlayer estado={estado} />
      </div>
    </>
  );

  // Sin sesión no hay barra lateral (ver panel/layout.tsx), así que esta
  // página se hace cargo de su propio padding y de una mini-nav.
  if (!session) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-8">
        <StreamingSubNav />
        {contenido}
      </div>
    );
  }

  return <div className="flex flex-col gap-8">{contenido}</div>;
}
