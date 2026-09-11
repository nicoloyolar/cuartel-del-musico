/**
 * Índice de pruebas de concepto de contenido externo de YouTube.
 *
 * Objetivo (a pedido del usuario, ver conversación): validar ideas de
 * negocio antes de invertir en construirlas de verdad:
 *
 * 1. ¿Se puede traer a la plataforma un streaming/podcast que se hace por
 *    YouTube, fuera de la señal principal? → prueba "en vivo".
 * 2. ¿Se puede armar una versión "plus" con contenido exclusivo para
 *    suscriptores usando videos ocultos de YouTube? → prueba "oculto".
 *
 * (Hubo una tercera prueba, "video privado", para confirmar que YouTube no
 * permite embeber videos privados en sitios de terceros — confirmado que
 * falla como se esperaba, y como no sirve para nada real se sacó de acá a
 * pedido del usuario.)
 *
 * Cada una es su propia página (a pedido del usuario) para poder revisar
 * cada resultado por separado. Página temporal — no está linkeada desde
 * ningún nav, se accede por URL directa; conviene borrarla (o el usuario
 * puede pedir que se borre) una vez validado lo que hace falta.
 */
export default function PruebasStreamingPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-neutral-100">
        Pruebas de streaming
      </h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <a
          href="/panel/pruebas-streaming/en-vivo"
          className="rounded-lg border border-ink-border bg-ink-card p-5 transition hover:border-accent"
        >
          <span className="font-display text-sm font-semibold tracking-wide text-accent-soft uppercase">
            En vivo
          </span>
        </a>
        <a
          href="/panel/pruebas-streaming/oculto"
          className="rounded-lg border border-ink-border bg-ink-card p-5 transition hover:border-accent"
        >
          <span className="font-display text-sm font-semibold tracking-wide text-amber uppercase">
            Video oculto
          </span>
        </a>
      </div>
    </div>
  );
}
