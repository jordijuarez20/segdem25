import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const {
      amount,            // número en MXN (ej. 879)
      currency = "mxn",
      policyId,
      policyName,
      customerEmail,
      metadata = {},
    } = await req.json();

    if (!amount || amount <= 0) {
      return new Response(JSON.stringify({ error: "Invalid amount" }), { status: 400 });
    }

    // Determina la base URL del despliegue (Vercel) o usa NEXT_PUBLIC_BASE_URL como respaldo
    const getBaseUrl = () => {
      const configured = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "");
      if (configured) return configured;
      const proto = req.headers.get("x-forwarded-proto") || (req.headers.get("origin")?.startsWith("https") ? "https" : "http");
      const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
      if (host) return `${proto}://${host}`;
      const origin = req.headers.get("origin");
      if (origin) return origin.replace(/\/$/, "");
      return "http://localhost:3000";
    };

    const baseUrl = getBaseUrl();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      currency,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency,
            unit_amount: Math.round(Number(amount) * 100), // a centavos
            product_data: {
              name: `Seguro ${policyName}`,
              metadata: { policyId },
            },
          },
          quantity: 1,
        },
      ],
      customer_email: customerEmail || undefined,
      metadata: {
        policyId,
        policyName,
        ...metadata,
      },
  // Mostrar anuncio de éxito y luego redirigir desde /success a paso 1
  success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      // Si cancela, regresa al cancel en el mismo host
      cancel_url: `${baseUrl}/cancel`,
    });

    return new Response(JSON.stringify({ id: session.id }), { status: 200 });
  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
