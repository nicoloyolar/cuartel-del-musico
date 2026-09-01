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
      <h1 className="text-2xl font-bold tracking-tight">Bandas / Clientes</h1>

      <form
        action={crearBanda}
        className="grid grid-cols-1 gap-3 rounded-lg border border-neutral-800 bg-neutral-900 p-4 md:grid-cols-3"
      >
        <Input name="nombre" placeholder="Nombre de la banda *" required />
        <Input name="contacto" placeholder="Persona de contacto" />
        <Input name="telefono" placeholder="Teléfono" />
        <Input name="email" placeholder="Email" type="email" />
        <Input name="instagram" placeholder="Instagram" />
        <Input name="notas" placeholder="Notas" />
        <button
          type="submit"
          className="col-span-full rounded-md bg-white px-3 py-2 text-sm font-medium text-neutral-950 hover:bg-neutral-200 md:w-fit"
        >
          Agregar banda
        </button>
      </form>

      <ul className="divide-y divide-neutral-800 rounded-lg border border-neutral-800">
        {bandas.map((b) => (
          <li key={b.id} className="flex items-center justify-between gap-4 px-4 py-3">
            <div>
              <p className="font-medium">{b.nombre}</p>
              <p className="text-sm text-neutral-400">
                {[b.contacto, b.telefono, b.email, b.instagram]
                  .filter(Boolean)
                  .join(" · ") || "Sin datos de contacto"}
              </p>
              <p className="text-xs text-neutral-500">
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
          <li className="px-4 py-6 text-center text-neutral-400">
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
      className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-neutral-500"
    />
  );
}
