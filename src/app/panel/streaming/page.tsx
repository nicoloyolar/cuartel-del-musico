import { prisma } from "@/lib/prisma";
import { StreamPlayer } from "@/components/StreamPlayer";
import { guardarStreamConfig } from "./actions";

export const dynamic = "force-dynamic";

export default async function StreamingConfigPage() {
  const config = await prisma.streamConfig.findUnique({ where: { id: 1 } });

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold tracking-tight">Configuración del streaming</h1>
      <p className="max-w-2xl text-sm text-neutral-400">
        Mientras se arma la transmisión en vivo desde la sala, deja el modo en{" "}
        <strong>Lista de reproducción</strong> y pega ahí el ID de una playlist de
        YouTube con sesiones grabadas. Cuando esté lista la señal en vivo, cambia a{" "}
        <strong>En vivo</strong> y pega el ID del video/transmisión activa de YouTube.
      </p>

      <form
        action={guardarStreamConfig}
        className="flex max-w-md flex-col gap-4 rounded-lg border border-neutral-800 bg-neutral-900 p-4"
      >
        <div className="flex flex-col gap-1">
          <label className="text-sm text-neutral-300">Modo</label>
          <select
            name="modo"
            defaultValue={config?.modo ?? "playlist"}
            className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
          >
            <option value="playlist">Lista de reproducción (YouTube)</option>
            <option value="live">En vivo (YouTube)</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-neutral-300">
            ID de YouTube (playlist o video)
          </label>
          <input
            name="youtubeId"
            defaultValue={config?.youtubeId ?? ""}
            placeholder="ej: PLxxxxxxxxxxxxxxxx o dQw4w9WgXcQ"
            className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-neutral-300">Título (opcional)</label>
          <input
            name="titulo"
            defaultValue={config?.titulo ?? ""}
            className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          className="rounded-md bg-white px-3 py-2 text-sm font-medium text-neutral-950 hover:bg-neutral-200"
        >
          Guardar
        </button>
      </form>

      <div className="max-w-2xl">
        <h2 className="mb-2 text-sm font-semibold text-neutral-400">
          Vista previa (lo que ve el público ahora mismo)
        </h2>
        <StreamPlayer config={config} />
      </div>
    </div>
  );
}
