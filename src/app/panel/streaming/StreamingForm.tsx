"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { guardarStreamConfig, type StreamActionState } from "./actions";

type Props = {
  config: {
    modo: string;
    youtubeId: string | null;
    titulo: string | null;
  } | null;
};

const initialState: StreamActionState = {};

export function StreamingForm({ config }: Props) {
  const [state, formAction, pending] = useActionState(guardarStreamConfig, initialState);
  const [modo, setModo] = useState(config?.modo ?? "playlist");

  return (
    <form
      action={formAction}
      className="flex max-w-md flex-col gap-4 rounded-lg border border-ink-border bg-ink-card p-4"
    >
      <div className="flex flex-col gap-1">
        <label className="text-sm text-neutral-300">Modo</label>
        <select
          name="modo"
          value={modo}
          onChange={(e) => setModo(e.target.value)}
          className="rounded-md border border-ink-border bg-ink px-3 py-2 text-sm text-neutral-100"
        >
          <option value="playlist">Canal (contenido grabado)</option>
          <option value="live">En vivo (YouTube)</option>
        </select>
      </div>

      {modo === "playlist" ? (
        <p className="rounded-md border border-ink-border bg-ink px-3 py-2 text-sm text-muted">
          El contenido y el orden del canal se administran desde{" "}
          <Link href="/panel/canal" className="underline underline-offset-4 hover:text-neutral-200">
            /panel/canal
          </Link>
          . Todos los visitantes ven el mismo punto de la programación en cada momento, calculado
          automáticamente — no hace falta elegir un video acá.
        </p>
      ) : (
        <div className="flex flex-col gap-1">
          <label className="text-sm text-neutral-300">Link o ID del video/transmisión</label>
          <input
            name="youtubeId"
            defaultValue={config?.modo === "live" ? (config?.youtubeId ?? "") : ""}
            placeholder="https://youtube.com/watch?v=xxxxx o dQw4w9WgXcQ"
            className="rounded-md border border-ink-border bg-ink px-3 py-2 text-sm text-neutral-100"
          />
          <p className="text-xs text-muted-2">Acepta el link completo de YouTube o el ID pelado.</p>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-sm text-neutral-300">Título (opcional)</label>
        <input
          name="titulo"
          defaultValue={config?.titulo ?? ""}
          className="rounded-md border border-ink-border bg-ink px-3 py-2 text-sm text-neutral-100"
        />
      </div>

      {state.error && (
        <p className="rounded-md border border-red-900 bg-red-950/50 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      )}
      {state.success && !state.error && (
        <p className="rounded-md border border-emerald-900 bg-emerald-950/50 px-3 py-2 text-sm text-emerald-300">
          Guardado ✓ — el cambio ya se ve en el sitio público.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-accent px-3 py-2 text-sm font-semibold text-neutral-50 transition-colors hover:bg-accent-soft disabled:opacity-50"
      >
        {pending ? "Guardando..." : "Guardar"}
      </button>
    </form>
  );
}
