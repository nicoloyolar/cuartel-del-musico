"use client";

import { marcarPagado } from "./actions";

export function PagadoToggle({ id, pagado }: { id: string; pagado: boolean }) {
  return (
    <button
      type="button"
      onClick={() => marcarPagado(id, !pagado)}
      className={`rounded px-2 py-1 text-xs ${
        pagado ? "bg-emerald-900 text-emerald-200" : "bg-amber-900 text-amber-200"
      }`}
    >
      {pagado ? "Pagado" : "Pendiente"}
    </button>
  );
}
