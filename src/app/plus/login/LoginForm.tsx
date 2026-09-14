"use client";

import { useActionState } from "react";
import { iniciarSesionSuscriptor, type PlusFormState } from "../actions";

const initialState: PlusFormState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(iniciarSesionSuscriptor, initialState);

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
      <div className="flex flex-col gap-1">
        <label className="text-sm text-neutral-300">Contraseña</label>
        <input
          name="password"
          type="password"
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
        {pending ? "Ingresando..." : "Iniciar sesión"}
      </button>
    </form>
  );
}
