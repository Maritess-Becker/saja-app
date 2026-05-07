// Design mockup v2 — Warm Minimalism target state
export default function PreviewEntdeckenV2() {
  return (
    <div style={{ minHeight: '100vh', background: '#E7DFD6', fontFamily: "'Outfit', system-ui, sans-serif" }}>

      {/* Top bar — ultra minimal */}
      <div style={{ padding: '18px 24px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 26, fontWeight: 500, color: '#2F4A3C', letterSpacing: '-0.3px' }}>Saja</span>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button style={{ background: 'none', border: 'none', color: '#9A8E84', fontSize: 13, cursor: 'pointer', letterSpacing: '0.04em' }}>Filter</button>
        </div>
      </div>

      <main style={{ maxWidth: 420, margin: '0 auto', padding: '8px 20px 120px' }}>

        {/* Profile card — editorial, clean */}
        <div style={{ borderRadius: 24, overflow: 'hidden', boxShadow: '0 4px 40px rgba(47,74,60,0.12)' }}>

          {/* Photo — full bleed, 4:5 ratio */}
          <div style={{
            position: 'relative',
            aspectRatio: '4/5',
            background: 'linear-gradient(170deg, #4A6855 0%, #2F4A3C 45%, #1E3028 100%)',
            overflow: 'hidden',
          }}>
            {/* Subtle bottom gradient only */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(20,34,26,0.82) 0%, rgba(20,34,26,0.18) 35%, transparent 55%)' }} />

            {/* Stilles Zeichen — top right, very quiet */}
            <button style={{
              position: 'absolute', top: 16, right: 16, zIndex: 2,
              background: 'rgba(242,235,226,0.12)', backdropFilter: 'blur(12px)',
              border: '0.5px solid rgba(242,235,226,0.18)',
              borderRadius: 20, padding: '5px 13px',
              color: 'rgba(242,235,226,0.75)', fontSize: 11,
              letterSpacing: '0.06em', cursor: 'pointer',
            }}>✦</button>

            {/* Name + info — bottom, generous padding */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1, padding: '0 24px 28px' }}>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 42, fontWeight: 400, color: '#F2EBE2',
                margin: '0 0 4px', letterSpacing: '-0.5px', lineHeight: 1.05,
              }}>Lukas, 34</h2>
              <p style={{ color: 'rgba(242,235,226,0.55)', fontSize: 13, margin: 0, letterSpacing: '0.02em' }}>Berlin · Architekt</p>
            </div>
          </div>

          {/* Card body — spacious, clean */}
          <div style={{ background: '#F2EBE2', padding: '22px 24px 24px' }}>

            {/* Intention — single line, no badge */}
            <p style={{ color: '#2F4A3C', fontSize: 14, fontWeight: 500, margin: '0 0 14px', letterSpacing: '0.01em' }}>
              Tiefe Verbindung · Nicht hasten
            </p>

            {/* Bio — generous, readable */}
            <p style={{ color: '#6B6058', fontSize: 14, lineHeight: 1.7, margin: '0 0 20px', fontWeight: 300 }}>
              Ich glaube, echte Nähe entsteht durch Verletzlichkeit. Direkt, neugierig und ich schätze Menschen, die wissen was sie wollen.
            </p>

            {/* Max 2 werte — quiet, no badges */}
            <div style={{ display: 'flex', gap: 8 }}>
              {['Ehrlichkeit', 'Natur'].map(w => (
                <span key={w} style={{
                  background: 'rgba(47,74,60,0.07)', color: '#6B6058',
                  borderRadius: 20, padding: '5px 14px', fontSize: 12, letterSpacing: '0.03em',
                }}>{w}</span>
              ))}
              <span style={{
                background: 'rgba(168,101,76,0.08)', color: '#A8654C',
                borderRadius: 20, padding: '5px 14px', fontSize: 12, letterSpacing: '0.03em',
              }}>♐</span>
            </div>
          </div>
        </div>

        {/* Action buttons — centered, clean */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginTop: 28 }}>
          <button style={{
            width: 54, height: 54, borderRadius: '50%',
            background: '#F2EBE2', border: '1px solid rgba(47,74,60,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 2px 12px rgba(47,74,60,0.08)',
            color: '#9A8E84', fontSize: 20,
          }}>✕</button>

          <button style={{
            width: 66, height: 66, borderRadius: '50%',
            background: '#2F4A3C', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 8px 28px rgba(47,74,60,0.28)',
            color: '#F2EBE2', fontSize: 22,
          }}>♡</button>

          <button style={{
            width: 54, height: 54, borderRadius: '50%',
            background: '#F2EBE2', border: '1px solid rgba(47,74,60,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 2px 12px rgba(47,74,60,0.08)',
            color: '#BFA76A', fontSize: 18,
          }}>✦</button>
        </div>

      </main>

      <BottomNav active="entdecken" />
    </div>
  )
}

function BottomNav({ active }: { active: string }) {
  const items = [
    { id: 'entdecken', label: 'Entdecken', href: '/preview-design/v2/entdecken' },
    { id: 'matches', label: 'Matches', href: '/preview-design/v2/matches' },
    { id: 'begegnung', label: '', href: '/preview-design/v2/begegnung' },
    { id: 'inhalte', label: 'Inhalte', href: '#' },
    { id: 'profil', label: 'Profil', href: '/preview-design/v2/profil' },
  ]
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      background: '#2F4A3C',
      borderTop: '0.5px solid rgba(242,235,226,0.07)',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      <div style={{ display: 'flex', maxWidth: 500, margin: '0 auto' }}>
        {items.map(item => (
          <a key={item.id} href={item.href} style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '12px 0 16px', gap: 4, textDecoration: 'none',
            color: active === item.id ? '#F2EBE2' : 'rgba(242,235,226,0.25)',
          }}>
            {item.id === 'begegnung'
              ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ transform: 'rotate(135deg)' }}>
                  <path d="M 4.8 19.2 A 10.2 10.2 0 1 1 19.2 19.2" stroke={active === item.id ? '#F2EBE2' : 'rgba(242,235,226,0.25)'} strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              : <div style={{ width: 18, height: 18, borderRadius: '50%', border: `1.5px solid ${active === item.id ? 'rgba(242,235,226,0.6)' : 'rgba(242,235,226,0.18)'}`, background: active === item.id ? 'rgba(242,235,226,0.12)' : 'transparent' }} />
            }
            {active === item.id && item.label
              ? <span style={{ fontSize: 8, letterSpacing: '0.08em', color: 'rgba(242,235,226,0.6)', textTransform: 'uppercase' }}>{item.label}</span>
              : <div style={{ height: 8 }} />
            }
          </a>
        ))}
      </div>
    </nav>
  )
}
