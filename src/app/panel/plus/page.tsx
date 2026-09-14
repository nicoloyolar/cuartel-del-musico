import { prisma } from "@/lib/prisma";
import { mercadoPagoConfigurado } from "@/lib/mercadoPago";
import {
  guardarPlanPlusConfig,
  crearVideoPlus,
  eliminarVideoPlus,
  extenderSuscripcion,
  quitarAccesoSuscriptor,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function PlusAdminPage() {
  const [plan, videos, suscriptores] = await Promise.all([
    prisma.planPlusConfig.findUnique({ where: { id: 1 } }),
    prisma.videoPlus.findMany({ orderBy: { orden: "asc" } }),
    prisma.suscriptor.findMany({ orderBy: { createdAt: "desc" } }),
  ]);
  const ahora = new Date();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-neutral-100">
          Cuartel del Músico Plus
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Suscripción de contenido exclusivo (<code>/plus</code>). v1 sin cobro recurrente
          automático: cada pago aprobado extiende la fecha de vencimiento del suscriptor.
        </p>
        {!mercadoPagoConfigurado() && (
          <p className="mt-3 max-w-2xl rounded-md border border-amber-800/60 bg-amber-950/30 px-3 py-2 text-sm text-amber-300">
            MercadoPago no está configurado (falta <code>MERCADOPAGO_ACCESS_TOKEN</code> en el
            entorno) — el botón de pago en <code>/plus/cuenta</code> avisa que no está disponible
            todavía. Mientras tanto, se puede dar acceso a mano desde la lista de suscriptores más
            abajo.
          </p>
        )}
      </div>

      {/* --- Plan --- */}
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-sm font-semibold tracking-widest text-muted uppercase">
          Plan
        </h2>
        <form
          action={guardarPlanPlusConfig}
          className="grid grid-cols-1 gap-3 rounded-lg border border-ink-border bg-ink-card p-4 sm:grid-cols-[2fr_1fr_auto] sm:items-end"
        >
          <div className="flex flex-col gap-1">
            <label className="text-sm text-muted">Nombre del plan</label>
            <input
              name="nombre"
              defaultValue={plan?.nombre ?? "Cuartel del Músico Plus"}
              required
              className="rounded-md border border-ink-border bg-ink px-3 py-2 text-sm text-neutral-100"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-muted">Precio mensual (CLP)</label>
            <input
              name="precioMensual"
              type="number"
              min={1}
              defaultValue={plan?.precioMensual ?? 4990}
              required
              className="rounded-md border border-ink-border bg-ink px-3 py-2 text-sm text-neutral-100"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-accent px-3 py-2 text-sm font-semibold text-neutral-50 transition-colors hover:bg-accent-soft"
          >
            Guardar
          </button>
        </form>
      </section>

      {/* --- Catálogo de contenido exclusivo --- */}
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-sm font-semibold tracking-widest text-muted uppercase">
          Contenido exclusivo
        </h2>
        <form
          action={crearVideoPlus}
          className="grid grid-cols-1 gap-3 rounded-lg border border-ink-border bg-ink-card p-4 md:grid-cols-2"
        >
          <input
            name="titulo"
            placeholder="Título *"
            required
            className="rounded-md border border-ink-border bg-ink px-3 py-2 text-sm text-neutral-100 md:col-span-2"
          />
          <input
            name="youtubeId"
            placeholder="Link o ID de YouTube (unlisted) *"
            required
            className="rounded-md border border-ink-border bg-ink px-3 py-2 text-sm text-neutral-100 md:col-span-2"
          />
          <input
            name="descripcion"
            placeholder="Descripción (opcional)"
            className="rounded-md border border-ink-border bg-ink px-3 py-2 text-sm text-neutral-100 md:col-span-2"
          />
          <button
            type="submit"
            className="col-span-full rounded-md bg-accent px-3 py-2 text-sm font-semibold text-neutral-50 transition-colors hover:bg-accent-soft md:w-fit"
          >
            Agregar
          </button>
        </form>

        <ul className="divide-y divide-ink-border rounded-lg border border-ink-border">
          {videos.map((v) => (
            <li key={v.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="font-medium text-neutral-100">{v.titulo}</p>
                <p className="text-sm text-muted">
                  youtube.com/watch?v={v.youtubeId}
                  {v.descripcion ? ` · ${v.descripcion}` : ""}
                </p>
              </div>
              <form
                action={async () => {
                  "use server";
                  await eliminarVideoPlus(v.id);
                }}
              >
                <button type="submit" className="text-sm text-muted-2 hover:text-red-400">
                  Eliminar
                </button>
              </form>
            </li>
          ))}
          {videos.length === 0 && (
            <li className="px-4 py-6 text-center text-muted">
              No hay contenido cargado todavía — /plus/catalogo se ve vacío para cualquier
              suscriptor activo.
            </li>
          )}
        </ul>
      </section>

      {/* --- Suscriptores --- */}
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-sm font-semibold tracking-widest text-muted uppercase">
          Suscriptores ({suscriptores.length})
        </h2>
        <ul className="divide-y divide-ink-border rounded-lg border border-ink-border">
          {suscriptores.map((s) => {
            const activo = !!s.activaHasta && s.activaHasta > ahora;
            return (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="font-medium text-neutral-100">
                    {s.nombre ? `${s.nombre} — ` : ""}
                    {s.email}
                  </p>
                  <p className="text-sm text-muted">
                    {activo ? (
                      <span className="text-emerald-400">
                        Activo hasta{" "}
                        {new Intl.DateTimeFormat("es-CL", { dateStyle: "medium" }).format(
                          s.activaHasta!
                        )}
                      </span>
                    ) : s.activaHasta ? (
                      <span className="text-amber-400">
                        Vencido el{" "}
                        {new Intl.DateTimeFormat("es-CL", { dateStyle: "medium" }).format(
                          s.activaHasta
                        )}
                      </span>
                    ) : (
                      "Nunca pagó"
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <form action={extenderSuscripcion} className="flex items-center gap-2">
                    <input type="hidden" name="suscriptorId" value={s.id} />
                    <input
                      name="dias"
                      type="number"
                      min={1}
                      defaultValue={30}
                      className="w-20 rounded-md border border-ink-border bg-ink px-2 py-1.5 text-sm text-neutral-100"
                    />
                    <button
                      type="submit"
                      className="rounded-md border border-ink-border px-2.5 py-1.5 text-sm text-neutral-200 hover:bg-ink-border"
                      title="Extender desde hoy o desde el vencimiento actual, lo que sea más tarde"
                    >
                      + días
                    </button>
                  </form>
                  {activo && (
                    <form
                      action={async () => {
                        "use server";
                        await quitarAccesoSuscriptor(s.id);
                      }}
                    >
                      <button type="submit" className="text-sm text-muted-2 hover:text-red-400">
                        Quitar acceso
                      </button>
                    </form>
                  )}
                </div>
              </li>
            );
          })}
          {suscriptores.length === 0 && (
            <li className="px-4 py-6 text-center text-muted">
              Todavía no se registró nadie en /plus/registro.
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
