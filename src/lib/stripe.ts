"use server";

import { redirect } from "next/navigation";
import Stripe from "stripe";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

export async function createCheckoutSession(credits: number) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) {
    throw new Error("Unauthorized!");
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: `${credits} CodeCortex Credits`,
          },
          unit_amount: Math.round((credits / 50) * 75 * 100),
        },
        quantity: 1,
      },
    ],
    customer_creation: "always",
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/create`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/billing`,
    client_reference_id: user.id,
    metadata: {
      credits,
    },
  });

  return redirect(session.url!);
}
