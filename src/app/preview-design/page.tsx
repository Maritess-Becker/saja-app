/**
 * Dev-only preview route — bypasses all auth.
 * Shows all 5 screens with the new "Warm Minimalism" color system.
 * Delete this file before shipping to production.
 */
import Link from 'next/link'

export default function PreviewDesignIndex() {
  const screens = [
    { id: 'entdecken', label: 'Entdecken', emoji: '🔍' },
    { id: 'profil', label: 'Profil', emoji: '👤' },
    { id: 'onboarding', label: 'Onboarding', emoji: '✨' },
    { id: 'matches', label: 'Matches', emoji: '💚' },
    { id: 'navigation', label: 'Navigation', emoji: '🧭' },
  ]
  return (
    <div style={{ minHeight: '100vh', background: '#E7DFD6', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: '#2F4A3C', marginBottom: 8 }}>Design Preview — Warm Minimalism</h1>
      <p style={{ color: '#6B6058', marginBottom: 24, fontSize: 14 }}>Klick auf einen Screen um ihn zu sehen</p>
      {screens.map(s => (
        <Link key={s.id} href={`/preview-design/${s.id}`}
          style={{ display: 'block', background: '#2F4A3C', color: '#F2EBE2', borderRadius: 16, padding: '14px 32px', fontSize: 16, textDecoration: 'none', minWidth: 220, textAlign: 'center' }}>
          {s.emoji} {s.label}
        </Link>
      ))}
    </div>
  )
}
