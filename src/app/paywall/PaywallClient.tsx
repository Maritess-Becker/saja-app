'use client'

import { useState } from 'react'
import { Sparkles, Heart, Star, Check, X, ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface Props {
  trialExpired: boolean
  trialDaysLeft: number
  trialDaysUsed: number
  matchCount: number
  encounterCount: number
  journalCount: number
}

const PLANS = [
  {
    id: 'membership',
    name: 'Mitgliedschaft',
    price: '29',
    period: 'Monat',
    icon: <Heart className="w-5 h-5" />,
    color: '#221080',
    features: [
      'Unbegrenzt liken & matchen',
      'Alle Tests (Bindungstyp, Love Language, …)',
      'Geführte Gespräche — alle Ebenen',
      '3-Schichten-Profil vollständig sichtbar',
      'Journal mit täglichen Impulsen',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '69',
    period: 'Monat',
    icon: <Star className="w-5 h-5" />,
    color: '#120850',
    features: [
      'Alles aus Mitgliedschaft',
      'Audio-Meditationen & Guides',
      '36 Fragen & 50 Tiefen-Fragen',
      'Wöchentliche Impulse & Rituale',
      'Mini-Coaching: Bereit für Liebe (5 Module)',
      'Kompatibilitäts-Score',
      'Prioritäts-Support',
    ],
    badge: 'Beliebt',
  },
]

export function PaywallClient({
  trialExpired,
  trialDaysLeft,
  trialDaysUsed,
  matchCount,
  encounterCount,
  journalCount,
}: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<string>('membership')

  function handleSubscribe() {
    // Stripe integration placeholder
    alert('Stripe-Integration folgt. Plan: ' + selected)
  }

  function handleLater() {
    router.push('/discover')
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-indigo)' }}>
      {/* Close button */}
      {!trialExpired && (
        <div className="px-4 pt-5">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-[#FDF8F2]/10 flex items-center justify-center"
          >
            <ChevronLeft className="w-4 h-4 text-[#FDF8F2]" />
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full px-4 pb-12">
        {/* Header */}
        <div className={cn('text-center', trialExpired ? 'pt-16 pb-8' : 'pt-6 pb-8')}>
          <div className="w-14 h-14 rounded-full bg-[#FDF8F2]/10 flex items-center justify-center mx-auto mb-5">
            <Sparkles className="w-7 h-7 text-[#FDF8F2]" />
          </div>
          {trialExpired ? (
            <>
              <h1 className="font-heading text-[38px] font-light text-[#FDF8F2] leading-tight mb-3">
                Dein Vollzugang<br />ist abgelaufen.
              </h1>
              <p className="text-[#FDF8F2]/60 font-body text-sm leading-relaxed max-w-xs mx-auto">
                14 Tage bist du dabei. Zeit, deine Reise fortzusetzen.
              </p>
            </>
          ) : (
            <>
              <h1 className="font-heading text-[38px] font-light text-[#FDF8F2] leading-tight mb-3">
                {trialDaysLeft === 1 ? 'Noch 1 Tag' : `Noch ${trialDaysLeft} Tage`}<br />Vollzugang.
              </h1>
              <p className="text-[#FDF8F2]/60 font-body text-sm leading-relaxed max-w-xs mx-auto">
                Danach brauchst du eine Mitgliedschaft, um weiter zu liken.
              </p>
            </>
          )}
        </div>

        {/* Trial stats summary */}
        {trialDaysUsed > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { value: trialDaysUsed, label: 'Tage dabei' },
              { value: matchCount, label: matchCount === 1 ? 'Match' : 'Matches' },
              { value: encounterCount, label: encounterCount === 1 ? 'Begegnung' : 'Begegnungen' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-[#FDF8F2]/08 p-4 text-center border border-[#FDF8F2]/10">
                <p className="font-heading text-[32px] font-light text-[#FDF8F2] leading-none mb-1">{stat.value}</p>
                <p className="text-[10px] text-[#FDF8F2]/50 font-body">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Plan selector */}
        <div className="space-y-3 mb-6">
          {PLANS.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelected(plan.id)}
              className={cn(
                'w-full rounded-2xl p-5 text-left transition-all relative overflow-hidden',
                selected === plan.id
                  ? 'bg-[#FDF8F2] border-2 border-[#FDF8F2]'
                  : 'bg-[#FDF8F2]/08 border border-[#FDF8F2]/20'
              )}
            >
              {plan.badge && (
                <span className="absolute top-3 right-3 bg-[#221080] text-[#FDF8F2] text-[10px] font-body px-2.5 py-1 rounded-full">
                  {plan.badge}
                </span>
              )}
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: selected === plan.id ? plan.color : 'rgba(253,248,242,0.12)', color: '#FDF8F2' }}
                >
                  {plan.icon}
                </div>
                <div>
                  <p className={cn('font-heading text-[20px] leading-none', selected === plan.id ? 'text-[#120850]' : 'text-[#FDF8F2]')}>
                    {plan.name}
                  </p>
                  <p className={cn('font-body text-sm mt-0.5', selected === plan.id ? 'text-[#6B6058]' : 'text-[#FDF8F2]/50')}>
                    {plan.price} €&thinsp;/&thinsp;{plan.period}
                  </p>
                </div>
              </div>
              <div className="space-y-1.5">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <Check className={cn('w-3 h-3 flex-shrink-0', selected === plan.id ? 'text-[#221080]' : 'text-[#FDF8F2]/40')} />
                    <span className={cn('text-[12px] font-body', selected === plan.id ? 'text-[#1A1410]' : 'text-[#FDF8F2]/60')}>
                      {f}
                    </span>
                  </div>
                ))}
              </div>
            </button>
          ))}
        </div>

        {/* Subscribe CTA */}
        <button
          onClick={handleSubscribe}
          className="w-full py-4 rounded-full bg-[#FDF8F2] text-[#221080] font-body text-[15px] font-medium mb-3 transition-opacity hover:opacity-90 active:scale-[0.98]"
        >
          {selected === 'premium' ? 'Premium starten — 69 €/Monat' : 'Mitgliedschaft starten — 29 €/Monat'}
        </button>

        {/* Later option */}
        <button
          onClick={handleLater}
          className="w-full py-3 rounded-full border border-[#FDF8F2]/20 text-[#FDF8F2]/50 font-body text-sm flex items-center justify-center gap-2 transition-colors hover:border-[#FDF8F2]/40 hover:text-[#FDF8F2]/70"
        >
          <X className="w-3.5 h-3.5" />
          Später entscheiden
        </button>

        {trialExpired && (
          <p className="text-center text-[#FDF8F2]/30 text-[11px] font-body mt-4">
            Ohne Mitgliedschaft kannst du die App weiter lesen, aber nicht liken.
          </p>
        )}

        <p className="text-center text-[#FDF8F2]/20 text-[10px] font-body mt-6">
          Jederzeit kündbar · Keine automatische Verlängerung ohne Bestätigung
        </p>
      </div>
    </div>
  )
}
