import { stripe } from "@/lib/stripe";

import {CheckoutProvider} from '@stripe/react-stripe-js/checkout';
import {loadStripe} from '@stripe/stripe-js';

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
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
    });

    return new Response(JSON.stringify({ id: session.id }), { status: 200 });
  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
