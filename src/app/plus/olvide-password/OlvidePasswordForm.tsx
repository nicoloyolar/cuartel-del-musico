"use client";

import { useActionState } from "react";
import { solicitarResetPassword, type ResetSolicitudState } from "../actions";

const initialState: ResetSolicitudState = {};

export function OlvidePasswordForm() {
  const [state, formAction, pending] = useActionState(solicitarResetPassword, initialState);

  if (state.mensaje) {
    return (
      <p className="rounded-md border border-emerald-900 bg-emerald-950/50 px-3 py-2 text-sm text-emerald-300">
        {state.mensaje}
      </p>
    );
  }

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-lg border border-ink-border bg-ink-card p-5"
    >
      <div className="flex flex-col gap-1">
        <label className="text-sm text-neutral-300">Email</label>
        <input
          name="email"
          type="email"
          required
          className="rounded-md border border-ink-border bg-ink px-3 py-2 text-sm text-neutral-100"
        />
      </div>

      {state.error && (
        <p className="rounded-md border border-red-900 bg-red-950/50 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-accent px-3 py-2 text-sm font-semibold text-neutral-50 transition-colors hover:bg-accent-soft disabled:opacity-50"
      >
        {pending ? "Enviando..." : "Mandar link de reseteo"}
      </button>
    </form>
  );
}
