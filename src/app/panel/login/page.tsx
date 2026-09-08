import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const { callbackUrl, error } = await searchParams;

  async function login(formData: FormData) {
    "use server";
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const dest = (formData.get("callbackUrl") as string) || "/panel";

    try {
      await signIn("credentials", {
        email,
        password,
        redirectTo: dest,
      });
    } catch (err) {
      if (err instanceof AuthError) {
        redirect(`/panel/login?error=1&callbackUrl=${encodeURIComponent(dest)}`);
      }
      throw err;
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-10">
      <div>
        <h1 className="font-display text-xl font-semibold tracking-tight text-neutral-100">
          Panel — Cuartel del Músico
        </h1>
        <p className="text-sm text-muted">Acceso solo para staff</p>
      </div>

      <form action={login} className="flex flex-col gap-4">
        <input type="hidden" name="callbackUrl" value={callbackUrl ?? "/panel"} />

        {error && (
          <p className="rounded-md border border-red-900 bg-red-950/50 px-3 py-2 text-sm text-red-300">
            Correo o contraseña incorrectos.
          </p>
        )}

        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm text-neutral-300">
            Correo
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="rounded-md border border-ink-border bg-ink px-3 py-2 text-sm text-neutral-100 outline-none focus:border-ink-border-soft"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm text-neutral-300">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="rounded-md border border-ink-border bg-ink px-3 py-2 text-sm text-neutral-100 outline-none focus:border-ink-border-soft"
          />
        </div>

        <button
          type="submit"
          className="rounded-md bg-accent px-3 py-2 text-sm font-semibold text-neutral-50 transition-colors hover:bg-accent-soft"
        >
          Entrar
        </button>
      </form>
    </main>
  );
}
