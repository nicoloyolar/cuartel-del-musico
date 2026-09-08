import { prisma } from "@/lib/prisma";
import { crearBanda, eliminarBanda } from "./actions";

export const dynamic = "force-dynamic";

export default async function BandasPage() {
  const bandas = await prisma.banda.findMany({
    orderBy: { nombre: "asc" },
    include: { _count: { select: { reservas: true } } },
  });

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-neutral-100">
        Bandas / Clientes
      </h1>

      <form
        action={crearBanda}
        className="grid grid-cols-1 gap-3 rounded-lg border border-ink-border bg-ink-card p-4 md:grid-cols-3"
      >
        <Input name="nombre" placeholder="Nombre de la banda *" required />
        <Input name="contacto" placeholder="Persona de contacto" />
        <Input name="telefono" placeholder="Teléfono" />
        <Input name="email" placeholder="Email" type="email" />
        <Input name="instagram" placeholder="Instagram" />
        <Input name="notas" placeholder="Notas" />
        <button
          type="submit"
          className="col-span-full rounded-md bg-accent px-3 py-2 text-sm font-semibold text-neutral-50 transition-colors hover:bg-accent-soft md:w-fit"
        >
          Agregar banda
        </button>
      </form>

      <ul className="divide-y divide-ink-border rounded-lg border border-ink-border">
        {bandas.map((b) => (
          <li key={b.id} className="flex items-center justify-between gap-4 px-4 py-3">
            <div>
              <p className="font-medium text-neutral-100">{b.nombre}</p>
              <p className="text-sm text-muted">
                {[b.contacto, b.telefono, b.email, b.instagram]
                  .filter(Boolean)
                  .join(" · ") || "Sin datos de contacto"}
              </p>
              <p className="text-xs text-muted-2">
                {b._count.reservas} reserva(s) registrada(s)
              </p>
            </div>
            <form
              action={async () => {
                "use server";
                await eliminarBanda(b.id);
              }}
            >
              <button
                type="submit"
                className="text-sm text-red-400 hover:text-red-300"
              >
                Eliminar
              </button>
            </form>
          </li>
        ))}
        {bandas.length === 0 && (
          <li className="px-4 py-6 text-center text-muted">
            Aún no hay bandas registradas.
          </li>
        )}
      </ul>
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="rounded-md border border-ink-border bg-ink px-3 py-2 text-sm text-neutral-100 outline-none focus:border-ink-border-soft"
    />
  );
}
