"use client";

import { useActionState } from "react";
import { crearReserva, type ReservaActionState } from "./actions";

type Banda = { id: string; nombre: string };

const initialState: ReservaActionState = {};

export function ReservaForm({ bandas }: { bandas: Banda[] }) {
  const [state, formAction, pending] = useActionState(crearReserva, initialState);

  return (
    <form
      action={formAction}
      className="grid grid-cols-1 gap-3 rounded-lg border border-ink-border bg-ink-card p-4 md:grid-cols-3"
    >
      <select
        name="bandaId"
        required
        className="rounded-md border border-ink-border bg-ink px-3 py-2 text-sm text-neutral-100"
      >
        <option value="">Selecciona una banda *</option>
        {bandas.map((b) => (
          <option key={b.id} value={b.id}>
            {b.nombre}
          </option>
        ))}
      </select>
      <input
        type="datetime-local"
        name="inicio"
        required
        className="rounded-md border border-ink-border bg-ink px-3 py-2 text-sm text-neutral-100"
      />
      <input
        type="datetime-local"
        name="fin"
        required
        className="rounded-md border border-ink-border bg-ink px-3 py-2 text-sm text-neutral-100"
      />
      <input
        type="number"
        name="precio"
        placeholder="Precio (CLP)"
        className="rounded-md border border-ink-border bg-ink px-3 py-2 text-sm text-neutral-100"
      />
      <input
        type="text"
        name="notas"
        placeholder="Notas"
        className="rounded-md border border-ink-border bg-ink px-3 py-2 text-sm text-neutral-100 md:col-span-2"
      />
      <label className="flex items-center gap-2 text-sm text-neutral-300">
        <input type="checkbox" name="transmitirEnVivo" defaultChecked />
        Transmitir en vivo
      </label>

      {state.error && (
        <p className="col-span-full rounded-md border border-red-900 bg-red-950/50 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      )}
      {state.success && !state.error && (
        <p className="col-span-full rounded-md border border-emerald-900 bg-emerald-950/50 px-3 py-2 text-sm text-emerald-300">
          Reserva creada ✓
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="col-span-full rounded-md bg-accent px-3 py-2 text-sm font-semibold text-neutral-50 transition-colors hover:bg-accent-soft disabled:opacity-50 md:w-fit"
      >
        {pending ? "Creando..." : "Crear reserva"}
      </button>
    </form>
  );
}
