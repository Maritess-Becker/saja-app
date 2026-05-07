'use client'
// Dev-only preview — delete before production
// Shows desktop sidebar + mobile nav side by side
export default function PreviewNavigation() {
  const navItems = [
    { label: 'Entdecken', icon: '🔍', active: false },
    { label: 'Matches', icon: '♡', active: false },
    { label: 'Begegnung', icon: '◯', active: true },
    { label: 'Inhalte', icon: '📖', active: false },
    { label: 'Profil', icon: '👤', active: false },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#E7DFD6', fontFamily: 'system-ui, sans-serif', padding: 24 }}>
      <h2 style={{ color: '#2F4A3C', fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Navigation — Warm Minimalism</h2>

      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Desktop Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <p style={{ color: '#6B6058', fontSize: 12, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Desktop Sidebar</p>
          <div style={{ width: 224, background: '#1E3028', borderRadius: 20, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Logo */}
            <div style={{ marginBottom: 28, padding: '0 8px' }}>
              <p style={{ color: '#F2EBE2', fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: '-0.5px' }}>Saja</p>
              <p style={{ color: 'rgba(242,235,226,0.35)', fontSize: 11, margin: '2px 0 0' }}>Bewusstes Dating</p>
            </div>

            {navItems.map(item => (
              <div key={item.label} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                borderRadius: 12,
                background: item.active ? 'rgba(242,235,226,0.14)' : 'transparent',
                color: item.active ? '#F2EBE2' : 'rgba(242,235,226,0.38)',
                fontSize: 14,
                cursor: 'pointer',
              }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
              </div>
            ))}

            <div style={{ marginTop: 'auto', paddingTop: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', color: 'rgba(242,235,226,0.28)', fontSize: 13, cursor: 'pointer' }}>
                <span>↗</span> Abmelden
              </div>
            </div>
          </div>
        </div>

        {/* Mobile bottom bar */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <p style={{ color: '#6B6058', fontSize: 12, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Mobile Bottom Bar</p>
          <div style={{ width: 375, background: '#2F4A3C', borderRadius: 20, overflow: 'hidden', borderTop: '0.5px solid rgba(242,235,226,0.08)' }}>
            <div style={{ display: 'flex' }}>
              {navItems.map(item => (
                <div key={item.label} style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px 0 16px',
                  gap: 3,
                  color: item.active ? '#F2EBE2' : 'rgba(242,235,226,0.28)',
                }}>
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  {item.active && <span style={{ fontSize: 8, letterSpacing: '0.05em', color: '#F2EBE2' }}>{item.label}</span>}
                  {!item.active && <div style={{ height: 8 }} />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Color palette swatch */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ color: '#6B6058', fontSize: 12, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Farbpalette</p>
          {[
            { name: 'Primary', hex: '#2F4A3C', light: false },
            { name: 'Deep', hex: '#1E3028', light: false },
            { name: 'Medium', hex: '#3D5E4E', light: false },
            { name: 'Background', hex: '#E7DFD6', light: true },
            { name: 'Surface', hex: '#F2EBE2', light: true },
            { name: 'Terra', hex: '#A8654C', light: false },
            { name: 'Sage', hex: '#7A9E8A', light: true },
            { name: 'Gold', hex: '#BFA76A', light: true },
            { name: 'Text', hex: '#232323', light: false },
            { name: 'Muted', hex: '#6B6058', light: false },
          ].map(c => (
            <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: c.hex, border: '1px solid rgba(0,0,0,0.08)', flexShrink: 0 }} />
              <div>
                <p style={{ color: '#232323', fontSize: 13, fontWeight: 600, margin: 0 }}>{c.name}</p>
                <p style={{ color: '#9A8E84', fontSize: 11, margin: 0 }}>{c.hex}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Typography */}
      <div style={{ marginTop: 40 }}>
        <p style={{ color: '#6B6058', fontSize: 12, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Typografie</p>
        <div style={{ background: '#F2EBE2', borderRadius: 20, padding: 24, border: '1px solid rgba(47,74,60,0.06)' }}>
          <h1 style={{ color: '#2F4A3C', fontSize: 32, fontWeight: 700, margin: '0 0 4px', letterSpacing: '-0.8px' }}>Heading XL — #2F4A3C</h1>
          <h2 style={{ color: '#232323', fontSize: 22, fontWeight: 600, margin: '0 0 4px', letterSpacing: '-0.3px' }}>Heading LG — #232323</h2>
          <p style={{ color: '#232323', fontSize: 15, margin: '0 0 4px', lineHeight: 1.6 }}>Body text — #232323 — Ehrlichkeit ist der Anfang von Nähe.</p>
          <p style={{ color: '#6B6058', fontSize: 14, margin: '0 0 4px', lineHeight: 1.6 }}>Muted text — #6B6058 — Dein Tempo ist das richtige Tempo.</p>
          <p style={{ color: '#9A8E84', fontSize: 13, margin: 0 }}>Subtle — #9A8E84 — Was bewegt dich gerade wirklich?</p>
        </div>
      </div>
    </div>
  )
}
