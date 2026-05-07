'use client'
// Design mockup v2 — Warm Minimalism target state
export default function PreviewBegegnungV2() {
  return (
    <div style={{
      minHeight: '100vh', background: '#1E3028',
      fontFamily: "'Outfit', system-ui, sans-serif",
      display: 'flex', flexDirection: 'column',
    }}>

      {/* Top bar */}
      <div style={{ padding: '52px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 22, fontWeight: 400, color: 'rgba(242,235,226,0.45)', letterSpacing: '-0.3px' }}>Saja</span>
        <span style={{ color: 'rgba(242,235,226,0.25)', fontSize: 12, letterSpacing: '0.05em' }}>31 Std. noch</span>
      </div>

      {/* Main — centered, meditative */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 28px 100px' }}>

        {/* Soft symbol */}
        <p style={{ color: 'rgba(242,235,226,0.20)', fontSize: 48, margin: '0 0 32px', lineHeight: 1 }}>✦</p>

        {/* Michael — no card, just quiet text */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 48, fontWeight: 400, color: '#F2EBE2',
            margin: '0 0 6px', letterSpacing: '-0.5px', lineHeight: 1.05,
          }}>Michael</h2>
          <p style={{ color: 'rgba(242,235,226,0.35)', fontSize: 14, margin: 0, fontWeight: 300, letterSpacing: '0.03em' }}>
            München · 38 · Skorpion
          </p>
        </div>

        {/* Daily question — the heart of the screen */}
        <div style={{
          borderLeft: '1.5px solid rgba(242,235,226,0.12)',
          paddingLeft: 18, marginBottom: 40,
        }}>
          <p style={{ color: 'rgba(242,235,226,0.35)', fontSize: 11, margin: '0 0 10px', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 400 }}>Frage des Tages</p>
          <p style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            color: 'rgba(242,235,226,0.80)', fontSize: 22, fontWeight: 400,
            margin: 0, lineHeight: 1.45, letterSpacing: '-0.1px',
          }}>
            „Was war dein schönster Moment diese Woche?"
          </p>
        </div>

        {/* Message input — minimal */}
        <div style={{
          background: 'rgba(242,235,226,0.06)',
          border: '0.5px solid rgba(242,235,226,0.10)',
          borderRadius: 16, padding: '14px 16px',
          display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16,
        }}>
          <input
            placeholder="Schreib etwas…"
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: '#F2EBE2', fontSize: 14, fontWeight: 300,
              fontFamily: "'Outfit', system-ui, sans-serif",
            }}
            readOnly
          />
          <button style={{ background: 'none', border: 'none', color: 'rgba(242,235,226,0.30)', fontSize: 18, cursor: 'pointer' }}>↑</button>
        </div>

        {/* End connection — very quiet */}
        <button style={{
          background: 'none', border: 'none',
          color: 'rgba(242,235,226,0.20)', fontSize: 12,
          cursor: 'pointer', letterSpacing: '0.04em',
          textAlign: 'center', padding: '8px 0',
        }}>
          Begegnung beenden
        </button>

      </main>

      <BottomNav active="begegnung" />
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
      background: '#1A2E22', borderTop: '0.5px solid rgba(242,235,226,0.06)',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      <div style={{ display: 'flex', maxWidth: 500, margin: '0 auto' }}>
        {items.map(item => (
          <a key={item.id} href={item.href} style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '12px 0 16px', gap: 4, textDecoration: 'none',
            color: active === item.id ? '#F2EBE2' : 'rgba(242,235,226,0.22)',
          }}>
            {item.id === 'begegnung'
              ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ transform: 'rotate(135deg)' }}>
                  <path d="M 4.8 19.2 A 10.2 10.2 0 1 1 19.2 19.2" stroke={active === item.id ? '#F2EBE2' : 'rgba(242,235,226,0.22)'} strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              : <div style={{ width: 18, height: 18, borderRadius: '50%', border: `1.5px solid ${active === item.id ? 'rgba(242,235,226,0.55)' : 'rgba(242,235,226,0.15)'}`, background: active === item.id ? 'rgba(242,235,226,0.10)' : 'transparent' }} />
            }
            {active === item.id && item.label
              ? <span style={{ fontSize: 8, letterSpacing: '0.08em', color: 'rgba(242,235,226,0.55)', textTransform: 'uppercase' }}>{item.label}</span>
              : <div style={{ height: 8 }} />
            }
          </a>
        ))}
      </div>
    </nav>
  )
}
