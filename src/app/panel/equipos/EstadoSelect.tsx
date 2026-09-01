"use client";

import type { EstadoEquipo } from "@prisma/client";
import { cambiarEstadoEquipo } from "./actions";

const ESTADOS: EstadoEquipo[] = ["DISPONIBLE", "PRESTADO", "MANTENCION"];

const COLOR: Record<EstadoEquipo, string> = {
  DISPONIBLE: "text-emerald-300",
  PRESTADO: "text-amber-300",
  MANTENCION: "text-red-300",
};

export function EstadoSelect({ id, estado }: { id: string; estado: EstadoEquipo }) {
  return (
    <select
      defaultValue={estado}
      className={`rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1 text-xs ${COLOR[estado]}`}
      onChange={(e) => cambiarEstadoEquipo(id, e.target.value as EstadoEquipo)}
    >
      {ESTADOS.map((e) => (
        <option key={e} value={e}>
          {e}
        </option>
      ))}
    </select>
  );
}
