import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

/**
 * Todavía no hay credenciales reales (a confirmar con el cliente si ya
 * tiene cuenta de MercadoPago o hay que crear una — ver memoria de
 * proyecto). Mientras MERCADOPAGO_ACCESS_TOKEN no esté en el entorno, el
 * checkout se avisa como "no configurado" en vez de romper — ver
 * src/app/plus/actions.ts.
 */
export function mercadoPagoConfigurado(): boolean {
  return !!process.env.MERCADOPAGO_ACCESS_TOKEN;
}

function cliente(): MercadoPagoConfig {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) throw new Error("MERCADOPAGO_ACCESS_TOKEN no configurado");
  return new MercadoPagoConfig({ accessToken });
}

/**
 * Crea una preferencia de pago único (Checkout Pro) y devuelve la URL a la
 * que hay que redirigir al suscriptor para pagar. `pagoId` es el id de
 * nuestro PagoPlus — se manda como external_reference para poder
 * matchearlo de vuelta cuando llegue la notificación del webhook.
 */
export async function crearPreferenciaPago(opts: {
  pagoId: string;
  monto: number;
  descripcion: string;
  origin: string;
}): Promise<string | undefined> {
  const preference = new Preference(cliente());
  // auto_return exige back_urls https — en dev local (http) se omite, ahí
  // de todos modos no se puede probar un pago real de MercadoPago.
  const esHttps = opts.origin.startsWith("https://");

  const resultado = await preference.create({
    body: {
      items: [
        {
          id: opts.pagoId,
          title: opts.descripcion,
          quantity: 1,
          unit_price: opts.monto,
          currency_id: "CLP",
        },
      ],
      external_reference: opts.pagoId,
      back_urls: {
        success: `${opts.origin}/plus/cuenta?pago=ok`,
        failure: `${opts.origin}/plus/cuenta?pago=error`,
        pending: `${opts.origin}/plus/cuenta?pago=pendiente`,
      },
      ...(esHttps ? { auto_return: "approved" as const } : {}),
      notification_url: `${opts.origin}/api/mercadopago/webhook`,
    },
  });

  return resultado.init_point;
}

/** Consulta el estado de un pago por su id (llamado desde el webhook). */
export async function obtenerPagoMp(id: string) {
  const payment = new Payment(cliente());
  return payment.get({ id });
}
