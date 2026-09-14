import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { seccionActiva } from "@/lib/horarios";
import { StreamingSubNav } from "@/components/panel/StreamingSubNav";
import { crearBloqueHorario, eliminarBloqueHorario } from "./actions";

export const dynamic = "force-dynamic";

// Lun..Dom en el orden que se muestra, con su valor JS Date#getDay (0=Dom).
const DIAS = [
  { valor: 1, etiqueta: "Lun" },
  { valor: 2, etiqueta: "Mar" },
  { valor: 3, etiqueta: "Mié" },
  { valor: 4, etiqueta: "Jue" },
  { valor: 5, etiqueta: "Vie" },
  { valor: 6, etiqueta: "Sáb" },
  { valor: 0, etiqueta: "Dom" },
];

const SECCIONES = [
  { valor: "RADIO_TV", etiqueta: "Radio-TV" },
  { valor: "PODCAST", etiqueta: "Podcast" },
];

export default async function HorariosPage() {
  const [bloques, session] = await Promise.all([
    prisma.bloqueHorario.findMany({ orderBy: { createdAt: "asc" } }),
    auth(),
  ]);

  const seccionAhora = seccionActiva(bloques, new Date());

  const contenido = (
    <>
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-neutral-100">
          Horarios del canal
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Define qué sección (Radio-TV o Podcast, ver{" "}
          <Link href="/panel/canal" className="underline underline-offset-4 hover:text-neutral-200">
            /panel/canal
          </Link>
          ) está al aire según el día y la hora. Fuera de todo bloque configurado, o si no hay
          ninguno, el canal muestra <strong>Radio-TV</strong>. Si dos bloques se superponen, gana
          el más antiguo (el primero que se creó).
        </p>
        <p className="mt-2 text-sm text-muted">
          Sección al aire ahora mismo:{" "}
          <strong className="text-neutral-100">
            {SECCIONES.find((s) => s.valor === seccionAhora)?.etiqueta}
          </strong>
        </p>
      </div>

      {session ? (
        <form
          action={crearBloqueHorario}
          className="flex flex-col gap-3 rounded-lg border border-ink-border bg-ink-card p-4"
        >
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm text-muted">Sección:</label>
            <select
              name="seccion"
              required
              className="rounded-md border border-ink-border bg-ink px-3 py-2 text-sm text-neutral-100"
            >
              {SECCIONES.map((s) => (
                <option key={s.valor} value={s.valor}>
                  {s.etiqueta}
                </option>
              ))}
            </select>

            <label className="text-sm text-muted">De:</label>
            <input
              type="time"
              name="horaInicio"
              required
              className="rounded-md border border-ink-border bg-ink px-3 py-2 text-sm text-neutral-100"
            />
            <label className="text-sm text-muted">a:</label>
            <input
              type="time"
              name="horaFin"
              required
              className="rounded-md border border-ink-border bg-ink px-3 py-2 text-sm text-neutral-100"
            />
            <span className="text-xs text-muted-2">
              (si &quot;a&quot; es antes que &quot;de&quot;, cruza medianoche)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-muted">Días:</span>
            {DIAS.map((d) => (
              <label key={d.valor} className="flex items-center gap-1.5 text-sm text-neutral-200">
                <input type="checkbox" name="dias" value={d.valor} className="accent-red-600" />
                {d.etiqueta}
              </label>
            ))}
          </div>

          <button
            type="submit"
            className="rounded-md bg-accent px-3 py-2 text-sm font-semibold text-neutral-50 transition-colors hover:bg-accent-soft md:w-fit"
          >
            Agregar bloque
          </button>
        </form>
      ) : (
        <p className="rounded-lg border border-ink-border bg-ink-card p-4 text-sm text-muted">
          Estás viendo los horarios sin iniciar sesión — se puede revisar pero no editar.{" "}
          <Link
            href="/panel/login?callbackUrl=/panel/horarios"
            className="underline underline-offset-4 hover:text-neutral-200"
          >
            Iniciar sesión para editar →
          </Link>
        </p>
      )}

      <ul className="divide-y divide-ink-border rounded-lg border border-ink-border">
        {bloques.map((bloque) => (
          <li key={bloque.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="font-medium text-neutral-100">
                {SECCIONES.find((s) => s.valor === bloque.seccion)?.etiqueta}
              </p>
              <p className="text-sm text-muted">
                {formatDias(bloque.dias)} · {formatHora(bloque.horaInicioMin)}–
                {formatHora(bloque.horaFinMin)}
              </p>
            </div>
            {session && (
              <form
                action={async () => {
                  "use server";
                  await eliminarBloqueHorario(bloque.id);
                }}
              >
                <button type="submit" className="text-sm text-muted-2 hover:text-red-400">
                  Eliminar
                </button>
              </form>
            )}
          </li>
        ))}
        {bloques.length === 0 && (
          <li className="px-4 py-6 text-center text-muted">
            Sin bloques configurados — el canal muestra siempre Radio-TV.
          </li>
        )}
      </ul>
    </>
  );

  // Sin sesión no hay barra lateral (ver panel/layout.tsx), así que esta
  // página se hace cargo de su propio padding y de una mini-nav.
  if (!session) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-8">
        <StreamingSubNav />
        {contenido}
      </div>
    );
  }

  return <div className="flex flex-col gap-8">{contenido}</div>;
}

function formatHora(minutos: number) {
  const h = Math.floor(minutos / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutos % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function formatDias(csv: string) {
  const etiquetasPorValor = new Map(DIAS.map((d) => [d.valor, d.etiqueta]));
  return csv
    .split(",")
    .map((d) => etiquetasPorValor.get(Number(d.trim())) ?? d)
    .join(", ");
}
