import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const TIER_MAP: Record<string, 'membership' | 'premium'> = {
  membership: 'membership',
  premium: 'premium',
}

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripeKey || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe nicht konfiguriert' }, { status: 503 })
  }

  const stripe = new Stripe(stripeKey, { apiVersion: '2024-06-20' })
  const sig = req.headers.get('stripe-signature') ?? ''
  const body = await req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch {
    return NextResponse.json({ error: 'Webhook-Signatur ungültig' }, { status: 400 })
  }

  // Service role client — bypasses RLS
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  switch (event.type) {
    // ─── Subscription activated ──────────────────────────────────────────────
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId
      const tier = session.metadata?.tier

      if (session.mode === 'subscription' && userId && tier && TIER_MAP[tier]) {
        await supabase
          .from('users')
          .update({ subscription_tier: TIER_MAP[tier] })
          .eq('id', userId)
      }

      if (session.mode === 'payment' && userId && session.metadata?.productId) {
        await supabase
          .from('purchases')
          .insert({ user_id: userId, product_id: session.metadata.productId })
      }
      break
    }

    // ─── Subscription cancelled / ended ──────────────────────────────────────
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const userId = sub.metadata?.userId
      if (userId) {
        await supabase
          .from('users')
          .update({ subscription_tier: 'free' })
          .eq('id', userId)
      }
      break
    }

    // ─── Subscription updated (upgrade/downgrade) ─────────────────────────────
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const userId = sub.metadata?.userId
      const tier = sub.metadata?.tier
      if (userId && tier && TIER_MAP[tier]) {
        await supabase
          .from('users')
          .update({ subscription_tier: TIER_MAP[tier] })
          .eq('id', userId)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
