import Link from "next/link";
import { RegistroForm } from "./RegistroForm";

export default function RegistroPlusPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-10">
      <div>
        <Link href="/plus" className="text-xs font-semibold tracking-widest text-muted uppercase hover:text-neutral-100">
          ← Cuartel del Músico Plus
        </Link>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-neutral-100">
          Crear cuenta
        </h1>
      </div>

      <RegistroForm />

      <p className="text-center text-sm text-muted">
        ¿Ya tenés cuenta?{" "}
        <Link href="/plus/login" className="underline underline-offset-4 hover:text-neutral-200">
          Iniciar sesión
        </Link>
      </p>
    </main>
  );
}
