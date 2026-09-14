import Link from "next/link";
import { OlvidePasswordForm } from "./OlvidePasswordForm";

export default function OlvidePasswordPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-10">
      <div>
        <Link
          href="/plus/login"
          className="text-xs font-semibold tracking-widest text-muted uppercase hover:text-neutral-100"
        >
          ← Volver a iniciar sesión
        </Link>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-neutral-100">
          Olvidé mi contraseña
        </h1>
        <p className="mt-1 text-sm text-muted">
          Ingresá el email de tu cuenta y te mandamos un link para elegir una nueva contraseña.
        </p>
      </div>

      <OlvidePasswordForm />
    </main>
  );
}
