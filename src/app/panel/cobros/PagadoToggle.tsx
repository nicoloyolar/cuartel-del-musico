"use client";

import { useState, useTransition } from "react";
import { marcarPagado } from "./actions";

export function PagadoToggle({ id, pagado }: { id: string; pagado: boolean }) {
  const [valor, setValor] = useState(pagado);
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const anterior = valor;
    setError(false);
    setValor(!anterior);
    startTransition(async () => {
      try {
        await marcarPagado(id, !anterior);
      } catch {
        setValor(anterior);
        setError(true);
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className={`rounded px-2 py-1 text-xs disabled:opacity-50 ${
          valor ? "bg-emerald-900 text-emerald-200" : "bg-amber-900 text-amber-200"
        }`}
      >
        {valor ? "Pagado" : "Pendiente"}
      </button>
      {error && <span className="text-xs text-red-400">No se pudo guardar</span>}
    </div>
  );
}
