/**
 * Índice de pruebas de concepto de contenido externo de YouTube.
 *
 * Objetivo (a pedido del usuario, ver conversación): validar dos ideas de
 * negocio antes de invertir en construirlas de verdad:
 *
 * 1. ¿Se puede traer a la plataforma un streaming/podcast que se hace por
 *    YouTube, fuera de la señal principal? → prueba "en vivo".
 * 2. ¿Se puede armar una versión "plus" con contenido exclusivo para
 *    suscriptores usando videos privados/ocultos de YouTube? → pruebas
 *    "privado" y "oculto".
 *
 * Cada una es su propia página (a pedido del usuario) para poder revisar
 * cada resultado por separado. Página temporal — no está linkeada desde
 * ningún nav, se accede por URL directa; conviene borrarla (o el usuario
 * puede pedir que se borre) una vez validado lo que hace falta.
 */
export default function PruebasStreamingPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-neutral-100">
          Pruebas de concepto — contenido externo de YouTube
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Tres páginas separadas, una por enlace, para validar qué es
          técnicamente posible antes de construir nada en serio sobre esto.
        </p>
      </div>

      <div className="rounded-lg border border-ink-border bg-ink-card p-5">
        <h2 className="font-display text-sm font-semibold tracking-wide text-neutral-200 uppercase">
          Qué estamos validando
        </h2>
        <ul className="mt-3 flex flex-col gap-2 text-sm text-muted">
          <li>
            <strong className="text-neutral-200">En vivo</strong>: si un
            streaming/podcast hecho por YouTube (fuera de la señal principal
            del canal) se puede embeber acá igual — validación para la idea
            de traer streaming externo a la plataforma.
          </li>
          <li>
            <strong className="text-neutral-200">Video oculto</strong> (no
            listado): se espera que cargue sin problema — pero ojo, esto{" "}
            <strong className="text-neutral-200">no es un mecanismo de
            acceso pago real</strong>: el ID queda expuesto en el HTML/red
            que le servimos al navegador, cualquiera puede copiarlo y verlo
            directo en YouTube sin pasar por ninguna suscripción.
          </li>
          <li>
            <strong className="text-neutral-200">Video privado</strong>: se
            espera que <strong className="text-neutral-200">falle</strong> —
            YouTube no permite embeber videos privados en sitios de
            terceros bajo ninguna circunstancia, ni con el visitante
            logueado. Esta prueba es para confirmarlo en los hechos, no para
            que funcione.
          </li>
        </ul>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <a
          href="/panel/pruebas-streaming/en-vivo"
          className="rounded-lg border border-ink-border bg-ink-card p-5 transition hover:border-accent"
        >
          <span className="font-display text-sm font-semibold tracking-wide text-accent-soft uppercase">
            1. En vivo
          </span>
          <p className="mt-2 text-sm text-muted">
            Streaming en vivo externo, fuera de la señal principal.
          </p>
        </a>
        <a
          href="/panel/pruebas-streaming/oculto"
          className="rounded-lg border border-ink-border bg-ink-card p-5 transition hover:border-accent"
        >
          <span className="font-display text-sm font-semibold tracking-wide text-amber uppercase">
            2. Video oculto
          </span>
          <p className="mt-2 text-sm text-muted">
            No listado — debería embeberse sin problema.
          </p>
        </a>
        <a
          href="/panel/pruebas-streaming/privado"
          className="rounded-lg border border-ink-border bg-ink-card p-5 transition hover:border-accent"
        >
          <span className="font-display text-sm font-semibold tracking-wide text-neutral-400 uppercase">
            3. Video privado
          </span>
          <p className="mt-2 text-sm text-muted">
            Se espera que falle — para confirmarlo.
          </p>
        </a>
      </div>
    </div>
  );
}
