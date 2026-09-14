"use client";

import { useActionState } from "react";
import { resetearPassword, type ResetPasswordState } from "../actions";

const initialState: ResetPasswordState = {};

export function ResetearPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetearPassword, initialState);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-lg border border-ink-border bg-ink-card p-5"
    >
      <input type="hidden" name="token" value={token} />
      <div className="flex flex-col gap-1">
        <label className="text-sm text-neutral-300">Nueva contraseña</label>
        <input
          name="password"
          type="password"
          minLength={8}
          required
          className="rounded-md border border-ink-border bg-ink px-3 py-2 text-sm text-neutral-100"
        />
        <p className="text-xs text-muted-2">Mínimo 8 caracteres.</p>
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
        {pending ? "Guardando..." : "Cambiar contraseña"}
      </button>
    </form>
  );
}
