"use client";

import { useState, useTransition } from "react";
import type { EstadoEquipo } from "@prisma/client";
import { cambiarEstadoEquipo } from "./actions";

const ESTADOS: EstadoEquipo[] = ["DISPONIBLE", "PRESTADO", "MANTENCION"];

const COLOR: Record<EstadoEquipo, string> = {
  DISPONIBLE: "text-emerald-300",
  PRESTADO: "text-amber-300",
  MANTENCION: "text-red-300",
};

export function EstadoSelect({ id, estado }: { id: string; estado: EstadoEquipo }) {
  const [valor, setValor] = useState(estado);
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();

  function onChange(nuevo: EstadoEquipo) {
    const anterior = valor;
    setError(false);
    setValor(nuevo);
    startTransition(async () => {
      try {
        await cambiarEstadoEquipo(id, nuevo);
      } catch {
        setValor(anterior);
        setError(true);
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={valor}
        disabled={pending}
        className={`rounded-md border border-ink-border bg-ink px-2 py-1 text-xs disabled:opacity-50 ${COLOR[valor]}`}
        onChange={(e) => onChange(e.target.value as EstadoEquipo)}
      >
        {ESTADOS.map((e) => (
          <option key={e} value={e}>
            {e}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-red-400">No se pudo guardar</span>}
    </div>
  );
}
