'use client'
// Design mockup v2 — Warm Minimalism target state
export default function PreviewProfilV2() {
  return (
    <div style={{ minHeight: '100vh', background: '#E7DFD6', fontFamily: "'Outfit', system-ui, sans-serif" }}>

      {/* Photo hero — full bleed */}
      <div style={{
        position: 'relative', height: 380,
        background: 'linear-gradient(160deg, #4A6855 0%, #2F4A3C 50%, #1E3028 100%)',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(20,34,26,0.80) 0%, transparent 55%)' }} />

        {/* Edit — top right */}
        <a href="#" style={{
          position: 'absolute', top: 52, right: 20, zIndex: 2,
          background: 'rgba(242,235,226,0.12)', backdropFilter: 'blur(12px)',
          border: '0.5px solid rgba(242,235,226,0.18)',
          borderRadius: 20, padding: '6px 14px',
          color: 'rgba(242,235,226,0.70)', fontSize: 12,
          textDecoration: 'none', letterSpacing: '0.04em',
        }}>Bearbeiten</a>

        {/* Name */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1, padding: '0 24px 28px' }}>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 48, fontWeight: 400, color: '#F2EBE2',
            margin: '0 0 5px', letterSpacing: '-0.5px', lineHeight: 1,
          }}>Ich, 31</h1>
          <p style={{ color: 'rgba(242,235,226,0.45)', fontSize: 13, margin: 0, letterSpacing: '0.02em' }}>Berlin · Tiefe Verbindung</p>
        </div>
      </div>

      <main style={{ maxWidth: 420, margin: '0 auto', padding: '28px 20px 120px' }}>

        {/* About */}
        <section style={{ marginBottom: 32 }}>
          <p style={{ color: '#9A8E84', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.10em', margin: '0 0 12px', fontWeight: 500 }}>Über mich</p>
          <p style={{ color: '#232323', fontSize: 15, lineHeight: 1.70, margin: 0, fontWeight: 300 }}>
            Ich glaube daran, dass echte Verbindungen Zeit brauchen. Neugierig, direkt, und ich mag Gespräche die irgendwohin führen.
          </p>
        </section>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(47,74,60,0.08)', marginBottom: 28 }} />

        {/* Werte — minimal */}
        <section style={{ marginBottom: 32 }}>
          <p style={{ color: '#9A8E84', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.10em', margin: '0 0 14px', fontWeight: 500 }}>Werte</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['Ehrlichkeit', 'Achtsamkeit', 'Verbindung', 'Wachstum'].map(w => (
              <span key={w} style={{
                color: '#6B6058', fontSize: 13, fontWeight: 300,
                background: 'rgba(47,74,60,0.06)', borderRadius: 20,
                padding: '6px 14px', letterSpacing: '0.02em',
              }}>{w}</span>
            ))}
          </div>
        </section>

        <div style={{ height: 1, background: 'rgba(47,74,60,0.08)', marginBottom: 28 }} />

        {/* Astrologie — 1 line */}
        <section style={{ marginBottom: 32 }}>
          <p style={{ color: '#9A8E84', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.10em', margin: '0 0 10px', fontWeight: 500 }}>Astrologie</p>
          <p style={{ color: '#6B6058', fontSize: 14, margin: 0, fontWeight: 300 }}>☉ Waage &nbsp;·&nbsp; ↑ Stier</p>
        </section>

        <div style={{ height: 1, background: 'rgba(47,74,60,0.08)', marginBottom: 28 }} />

        {/* Kapazität — no dots, just a line */}
        <section style={{ marginBottom: 32 }}>
          <p style={{ color: '#9A8E84', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.10em', margin: '0 0 10px', fontWeight: 500 }}>Gerade</p>
          <p style={{ color: '#2F4A3C', fontSize: 14, margin: 0, fontWeight: 400 }}>Offen für Tiefe & Nähe</p>
        </section>

        <div style={{ height: 1, background: 'rgba(47,74,60,0.08)', marginBottom: 28 }} />

        {/* Settings — super quiet */}
        <section>
          {['Konto & Sicherheit', 'Benachrichtigungen', 'Mitgliedschaft'].map((item, i) => (
            <div key={item} style={{
              padding: '14px 0',
              borderTop: i > 0 ? '0.5px solid rgba(47,74,60,0.07)' : 'none',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ color: '#6B6058', fontSize: 14, fontWeight: 300 }}>{item}</span>
              <span style={{ color: 'rgba(47,74,60,0.25)', fontSize: 16 }}>›</span>
            </div>
          ))}
          <div style={{ padding: '16px 0 0' }}>
            <button style={{ background: 'none', border: 'none', color: '#A8654C', fontSize: 13, cursor: 'pointer', fontWeight: 300, letterSpacing: '0.03em', fontFamily: "'Outfit', system-ui, sans-serif" }}>
              Abmelden
            </button>
          </div>
        </section>

      </main>

      <BottomNav active="profil" />
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
      background: '#2F4A3C', borderTop: '0.5px solid rgba(242,235,226,0.07)',
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
