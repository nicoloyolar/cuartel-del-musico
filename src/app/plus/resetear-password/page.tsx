import Link from "next/link";
import { ResetearPasswordForm } from "./ResetearPasswordForm";

export default async function ResetearPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-6 py-10 text-center">
        <h1 className="font-display text-xl font-semibold tracking-tight text-neutral-100">
          Link inválido
        </h1>
        <p className="text-sm text-muted">
          Este link no tiene el token de reseteo. Pedí uno nuevo.
        </p>
        <Link
          href="/plus/olvide-password"
          className="mx-auto rounded-md bg-accent px-4 py-2 text-sm font-semibold text-neutral-50 hover:bg-accent-soft"
        >
          Pedir link de reseteo
        </Link>
      </main>
    );
  }

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
          Elegir nueva contraseña
        </h1>
      </div>

      <ResetearPasswordForm token={token} />
    </main>
  );
}
