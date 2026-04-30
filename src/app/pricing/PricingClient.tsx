'use client'

import { useState } from 'react'
import { Check, ExternalLink, ShieldCheck, Sparkles, Lock } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

type BillingCycle = 'monthly' | 'yearly'

const TIERS = [
  {
    id: 'free',
    name: 'Kostenlos',
    label: 'Einstieg',
    monthlyPrice: 0,
    yearlyPrice: 0,
    color: 'border-[rgba(30,20,10,0.08)]/80',
    highlight: false,
    cta: 'Kostenlos starten',
    ctaHref: '/register',
    features: [
      { text: 'Profil erstellen', included: true },
      { text: 'Quiz: Was hält mich davon ab, einen Partner zu finden?', included: true },
      { text: 'Einblick in die App', included: true },
      { text: 'Swipen & Matches', included: false },
      { text: 'Begegnung & Chat', included: false },
      { text: 'Tests & Guides', included: false },
    ],
  },
  {
    id: 'membership',
    name: 'Mitgliedschaft',
    label: 'Dating',
    monthlyPrice: 29,
    yearlyPrice: 290,
    color: 'border-primary',
    highlight: false,
    cta: 'Mitglied werden',
    ctaStyle: 'btn-secondary',
    features: [
      { text: 'Alles aus Kostenlos', included: true },
      { text: 'Swipen & Profile entdecken', included: true },
      { text: 'Matches & Begegnung', included: true },
      { text: 'One Connection Rule', included: true },
      { text: 'Bindungstyp-Test', included: true },
      { text: 'Love Language Quiz', included: true },
      { text: 'Beziehungsmodell-Check', included: true },
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    label: 'Empfohlen',
    monthlyPrice: 69,
    yearlyPrice: 690,
    color: 'border-primary',
    highlight: true,
    cta: 'Premium starten',
    ctaStyle: 'btn-primary',
    features: [
      { text: 'Alles aus Mitgliedschaft', included: true },
      { text: 'Frage des Tages im Chat', included: true },
      { text: '36 Fragen der Nähe', included: true },
      { text: 'Tiefen-Fragen für die Begegnung', included: true },
      { text: 'Meditations-Audio zur Vorbereitung', included: true },
      { text: 'Guide: Bewusstes erstes Treffen', included: true },
      { text: 'Wöchentliche Impulse & Rituale', included: true },
      { text: 'Kompatibilitäts-Score im Match', included: true },
      { text: 'Reflexion nach der Begegnung', included: true },
      { text: 'Community-Gruppen', included: true },
      { text: 'Mini-Coaching Inhalte', included: true },
    ],
  },
]

const SAJA_GUIDES = [
  { id: 'werte-zukunft', title: 'Saja Guide: Werte & Zukunft abgleichen', price: 49, desc: 'Wie passen eure Lebensziele und Werte zusammen? Ein tiefer Selbst- und Paarcheck.' },
  { id: 'beduerfnisse-grenzen', title: 'Saja Guide: Bedürfnisse & Grenzen', price: 49, desc: 'Lerne, deine Bedürfnisse klar zu benennen und Grenzen liebevoll zu setzen.' },
  { id: 'konflikt-wachstum', title: 'Saja Guide: Konflikt als Wachstum', price: 49, desc: 'Wie ihr als Paar aus Konflikten gestärkt hervorgeht — konkrete Tools und Reflexionen.' },
]


export function PricingClient({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [billing, setBilling] = useState<BillingCycle>('yearly')

  async function handleSubscribe(tierId: string) {
    if (tierId === 'free') {
      window.location.href = isLoggedIn ? '/discover' : '/register'
      return
    }
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tierId, billing }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.error || 'Fehler beim Checkout')
      }
    } catch {
      toast.error('Stripe noch nicht konfiguriert. Bitte wende dich an den Support.')
    }
  }

  async function handleGuidePurchase(guideId: string, title: string) {
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guideId, mode: 'payment' }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.error || 'Fehler beim Checkout')
      }
    } catch {
      toast.error('Kaufoption wird gerade eingerichtet.')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
        <Link href="/" className="text-[#A09888] text-sm hover:text-[#1A1410] mb-8 inline-block">← Zurück</Link>
        <h1 className="font-heading text-5xl md:text-6xl font-light text-[#1A1410] mb-4">
          Transparente Preise.
          <br /><em>Kein Kleingedrucktes.</em>
        </h1>
        <p className="text-[#6B6058] text-lg max-w-xl mx-auto mb-10">
          Starte kostenlos. Upgrade jederzeit. Kündige jederzeit.
        </p>

        {/* Billing toggle */}
        <div className="inline-flex items-center bg-[#EDE8E0] rounded-2xl p-1 gap-1">
          <button
            onClick={() => setBilling('monthly')}
            className={cn(
              'px-5 py-2.5 rounded-xl text-sm font-medium transition-all',
              billing === 'monthly' ? 'bg-white shadow text-[#1A1410]' : 'text-[#6B6058] hover:text-[#1A1410]'
            )}
          >
            Monatlich
          </button>
          <button
            onClick={() => setBilling('yearly')}
            className={cn(
              'px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2',
              billing === 'yearly' ? 'bg-white shadow text-[#1A1410]' : 'text-[#6B6058] hover:text-[#1A1410]'
            )}
          >
            Jährlich
            <span className="bg-accent/20 text-accent text-xs px-2 py-0.5 rounded-full font-medium">
              2 Monate gratis
            </span>
          </button>
        </div>
      </div>

      {/* Tier cards */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-3 gap-6 items-start">
          {TIERS.map((tier) => {
            const price = billing === 'yearly' ? tier.yearlyPrice : tier.monthlyPrice
            const normalYearly = tier.monthlyPrice * 12

            return (
              <div
                key={tier.id}
                className={cn(
                  'card border-2 flex flex-col',
                  tier.color,
                  tier.highlight && 'shadow-2xl md:scale-105 relative'
                )}
              >
                {tier.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-white text-xs font-medium px-4 py-1.5 rounded-full flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" /> Empfohlen
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <p className="text-xs text-[#A09888] uppercase tracking-widest mb-1">{tier.label}</p>
                  <h2 className="font-heading text-3xl text-[#1A1410]">{tier.name}</h2>

                  {tier.monthlyPrice === 0 ? (
                    <p className="mt-3 font-heading text-4xl text-[#1A1410]">0 €</p>
                  ) : (
                    <div className="mt-3">
                      <span className="font-heading text-4xl text-[#1A1410]">
                        {billing === 'yearly'
                          ? `${Math.round(price / 12)} €`
                          : `${price} €`}
                      </span>
                      <span className="text-[#A09888] text-sm ml-1">/ Monat</span>
                      {billing === 'yearly' && price > 0 && (
                        <div className="mt-1">
                          <span className="text-xs text-accent font-medium">
                            {price} € / Jahr · spare {normalYearly - price} €
                          </span>
                        </div>
                      )}
                      {billing === 'monthly' && (
                        <p className="text-xs text-[#A09888] mt-0.5">
                          Jährlich: {tier.yearlyPrice} € (2 Monate gratis)
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {tier.features.map((f) => (
                    <li
                      key={f.text}
                      className={cn(
                        'flex items-start gap-2.5 text-sm',
                        f.included ? 'text-[#1A1410]' : 'text-[#1A1410]/25'
                      )}
                    >
                      {f.included ? (
                        <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                      ) : (
                        <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      )}
                      {f.text}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(tier.id)}
                  className={cn(
                    'w-full text-center py-3.5 rounded-2xl text-sm font-medium transition-all',
                    tier.highlight
                      ? 'bg-primary text-white hover:bg-[#221080]'
                      : tier.monthlyPrice === 0
                      ? 'border-2 border-[rgba(30,20,10,0.08)] text-[#6B6058] hover:border-primary hover:text-[#221080]'
                      : 'border-2 border-primary text-[#221080] hover:bg-primary hover:text-white'
                  )}
                >
                  {tier.cta}
                </button>
              </div>
            )
          })}
        </div>

        {/* Guarantee */}
        <div className="flex items-center justify-center gap-3 mt-10 text-[#6B6058]">
          <ShieldCheck className="w-5 h-5 text-accent" />
          <p className="text-sm">
            <strong className="text-[#1A1410]">14 Tage Geld-zurück-Garantie</strong> auf alle Abonnements. Keine Fragen gestellt.
          </p>
        </div>
      </div>

      {/* One-time purchases */}
      <div className="bg-[#EDE8E0] py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs text-[#A09888] uppercase tracking-widest mb-2">Einmalig kaufbar</p>
            <h2 className="font-heading text-4xl font-light text-[#1A1410] mb-3">Für immer verfügbar</h2>
            <p className="text-[#6B6058] max-w-xl mx-auto">
              Kein Abo. Einmal kaufen — für immer in deinem Konto verfügbar.
            </p>
          </div>

          {/* Saja Guides */}
          <h3 className="font-heading text-2xl text-[#1A1410] mb-5">Saja Guides</h3>
          <div className="grid md:grid-cols-3 gap-4 mb-14">
            {SAJA_GUIDES.map((guide) => (
              <div key={guide.id} className="card border border-[rgba(30,20,10,0.08)]/80">
                <div className="inline-block bg-[#FDF8F2] text-[#221080] text-xs px-2.5 py-1 rounded-full mb-3 font-medium">
                  Saja Guide
                </div>
                <h4 className="font-heading text-xl text-[#1A1410] mb-2">{guide.title}</h4>
                <p className="text-[#1A1410]/55 text-sm leading-relaxed mb-5">{guide.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="font-heading text-2xl text-[#1A1410]">{guide.price} €</span>
                  <button
                    onClick={() => handleGuidePurchase(guide.id, guide.title)}
                    className="btn-primary text-xs py-2 px-5"
                  >
                    Kaufen
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto px-6 py-20">
        <h2 className="font-heading text-4xl font-light text-[#1A1410] text-center mb-10">Häufige Fragen</h2>
        <div className="space-y-6">
          {[
            { q: 'Kann ich jederzeit kündigen?', a: 'Ja — du kannst dein Abo jederzeit kündigen. Der Zugang bleibt bis zum Ende des bezahlten Zeitraums aktiv.' },
            { q: 'Wie funktioniert die Geld-zurück-Garantie?', a: 'Innerhalb von 14 Tagen nach dem Kauf erhältst du auf Anfrage dein Geld vollständig zurück. Kein Kleingedrucktes.' },
            { q: 'Was bedeutet "One Connection Rule"?', a: 'Du kannst immer nur mit einer Person gleichzeitig in der Begegnung sein. Das schafft Fokus und echte Präsenz.' },
            { q: 'Sind die Saja Guides wirklich für immer?', a: 'Ja. Einmalig gekaufte Guides bleiben dauerhaft in deinem Konto — unabhängig vom Abo-Status.' },
            { q: 'Gibt es versteckte Kosten?', a: 'Nein. Der Preis auf dieser Seite ist alles, was du zahlst.' },
          ].map((item) => (
            <div key={item.q} className="border-b border-[rgba(30,20,10,0.08)] pb-6">
              <p className="font-medium text-[#1A1410] mb-2">{item.q}</p>
              <p className="text-[#6B6058] text-sm leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
