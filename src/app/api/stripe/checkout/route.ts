import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

// Price IDs from Stripe Dashboard — add to .env.local
const PRICE_IDS: Record<string, Record<string, string>> = {
  membership: {
    monthly: process.env.STRIPE_PRICE_MEMBERSHIP_MONTHLY ?? '',
    yearly:  process.env.STRIPE_PRICE_MEMBERSHIP_YEARLY ?? '',
  },
  premium: {
    monthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY ?? '',
    yearly:  process.env.STRIPE_PRICE_PREMIUM_YEARLY ?? '',
  },
}

const GUIDE_PRICE_IDS: Record<string, string> = {
  'werte-zukunft':        process.env.STRIPE_PRICE_GUIDE_WERTE ?? '',
  'beduerfnisse-grenzen': process.env.STRIPE_PRICE_GUIDE_BEDUERFNISSE ?? '',
  'konflikt-wachstum':    process.env.STRIPE_PRICE_GUIDE_KONFLIKT ?? '',
}

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) {
    return NextResponse.json(
      { error: 'Stripe noch nicht konfiguriert. Bitte STRIPE_SECRET_KEY in .env.local setzen.' },
      { status: 503 }
    )
  }

  const stripe = new Stripe(stripeKey, { apiVersion: '2024-06-20' })
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Nicht eingeloggt' }, { status: 401 })
  }

  const body = await req.json()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  try {
    // ─── Subscription (Mitgliedschaft / Premium) ──────────────────────────────
    if (body.tierId && body.billing) {
      const priceId = PRICE_IDS[body.tierId]?.[body.billing]
      if (!priceId) {
        return NextResponse.json(
          { error: `Preis-ID für ${body.tierId}/${body.billing} fehlt in .env.local` },
          { status: 400 }
        )
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${appUrl}/discover?checkout=success&tier=${body.tierId}`,
        cancel_url:  `${appUrl}/pricing?checkout=cancelled`,
        customer_email: user.email,
        metadata: { userId: user.id, tier: body.tierId },
        subscription_data: {
          metadata: { userId: user.id, tier: body.tierId },
        },
        locale: 'de',
      })

      return NextResponse.json({ url: session.url })
    }

    // ─── One-time purchase (Saja Guide) ───────────────────────────────────────
    if (body.guideId) {
      const priceId = GUIDE_PRICE_IDS[body.guideId]
      if (!priceId) {
        return NextResponse.json(
          { error: `Preis-ID für Guide ${body.guideId} fehlt in .env.local` },
          { status: 400 }
        )
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${appUrl}/content?checkout=success&guide=${body.guideId}`,
        cancel_url:  `${appUrl}/pricing?checkout=cancelled`,
        customer_email: user.email,
        metadata: { userId: user.id, productId: body.guideId },
        locale: 'de',
      })

      return NextResponse.json({ url: session.url })
    }

    return NextResponse.json({ error: 'Ungültige Anfrage' }, { status: 400 })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unbekannter Fehler'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
