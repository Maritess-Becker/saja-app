'use client'

import { X, Check, Sparkles } from 'lucide-react'
import Link from 'next/link'

type Tier = 'membership' | 'premium'

interface Props {
  tier: Tier
  feature?: string
  onClose: () => void
}

const TIER_INFO = {
  membership: {
    name: 'Mitgliedschaft',
    price: '29€ / Monat',
    color: 'text-primary',
    badge: 'bg-light text-primary',
    features: [
      'Swipen & Profile entdecken',
      'Matches & Begegnung',
      'Bindungstyp-Test',
      'Love Language Quiz',
      'Beziehungsmodell-Check',
    ],
  },
  premium: {
    name: 'Premium',
    price: '69€ / Monat',
    color: 'text-dark',
    badge: 'bg-dark/10 text-dark',
    features: [
      'Frage des Tages im Chat',
      '36 Fragen der Nähe',
      'Kompatibilitäts-Score',
      'Community-Gruppen',
      'Mini-Coaching Inhalte',
    ],
  },
}

export function UpgradeModal({ tier, feature, onClose }: Props) {
  const info = TIER_INFO[tier]

  return (
    <div className="fixed inset-0 bg-black/60 z-[9999] flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-dark px-6 pt-6 pb-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <Sparkles className="w-6 h-6 text-primary mb-3" />
          <p className="text-white/60 text-xs uppercase tracking-widest mb-1">
            {feature ? `Für diesen Inhalt` : 'Upgrade erforderlich'}
          </p>
          <h2 className="font-heading text-2xl text-white">
            {feature ? `„${feature}"` : info.name}
          </h2>
          <p className="text-white/50 text-sm mt-1">
            {feature ? `ist enthalten in ${info.name}` : `ab ${info.price}`}
          </p>
        </div>

        {/* Features */}
        <div className="px-6 py-5">
          <p className="text-text/50 text-xs uppercase tracking-widest mb-3">Enthält u.a.</p>
          <ul className="space-y-2 mb-6">
            {info.features.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-text/70">
                <Check className="w-4 h-4 text-accent flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          <Link
            href="/pricing"
            onClick={onClose}
            className="btn-primary w-full text-center block py-3.5 text-sm"
          >
            Alle Pakete ansehen
          </Link>
          <button
            onClick={onClose}
            className="w-full text-center text-text/40 text-xs mt-3 hover:text-text/60 transition-colors"
          >
            Vielleicht später
          </button>
        </div>
      </div>
    </div>
  )
}
