// /lib/stripe.ts
import Stripe from "stripe";

// Asegúrate de tener STRIPE_SECRET_KEY en .env.local (modo dev) o variables de entorno (prod)
const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
  throw new Error("STRIPE_SECRET_KEY no está definido. Agrégalo en .env.local");
}

// Evita re-crear la instancia en desarrollo con HMR
declare global {
  // eslint-disable-next-line no-var
  var _stripe: Stripe | undefined;
}

export const stripe =
  global._stripe ??
  new Stripe(secretKey, {
    apiVersion: "2025-08-27.basil",
  });

if (process.env.NODE_ENV !== "production") {
  global._stripe = stripe;
}

export default stripe;
