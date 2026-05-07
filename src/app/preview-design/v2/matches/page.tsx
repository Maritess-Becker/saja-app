// Design mockup v2 — Warm Minimalism target state
export default function PreviewMatchesV2() {
  return (
    <div style={{ minHeight: '100vh', background: '#E7DFD6', fontFamily: "'Outfit', system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ padding: '52px 24px 20px' }}>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 44, fontWeight: 400, color: '#2F4A3C',
          margin: 0, letterSpacing: '-0.5px', lineHeight: 1,
        }}>Matches</h1>
        <p style={{ color: '#9A8E84', fontSize: 13, margin: '6px 0 0', letterSpacing: '0.02em', fontWeight: 300 }}>
          1 gegenseitiges Interesse
        </p>
      </div>

      <main style={{ maxWidth: 420, margin: '0 auto', padding: '4px 20px 120px' }}>

        {/* One Connection hint — very quiet */}
        <p style={{ color: 'rgba(47,74,60,0.40)', fontSize: 12, margin: '0 0 24px', letterSpacing: '0.03em', fontWeight: 300 }}>
          ✦ &nbsp; Du kannst eine Begegnung gleichzeitig führen.
        </p>

        {/* Thomas — single match card */}
        <div style={{
          background: '#F2EBE2', borderRadius: 22,
          overflow: 'hidden',
          boxShadow: '0 2px 20px rgba(47,74,60,0.08)',
          border: '0.5px solid rgba(47,74,60,0.07)',
        }}>
          {/* Top — photo strip + name */}
          <div style={{
            height: 200, position: 'relative',
            background: 'linear-gradient(155deg, #3D5E4E 0%, #2F4A3C 60%, #1E3028 100%)',
            display: 'flex', alignItems: 'flex-end',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(20,34,26,0.75) 0%, transparent 50%)' }} />
            <div style={{ position: 'relative', zIndex: 1, padding: '0 20px 18px' }}>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 34, fontWeight: 400, color: '#F2EBE2',
                margin: '0 0 3px', letterSpacing: '-0.3px', lineHeight: 1,
              }}>Thomas, 36</h2>
              <p style={{ color: 'rgba(242,235,226,0.50)', fontSize: 12, margin: 0, letterSpacing: '0.03em' }}>Hamburg · ♉</p>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '18px 20px 20px' }}>
            <p style={{ color: '#6B6058', fontSize: 14, lineHeight: 1.65, margin: '0 0 18px', fontWeight: 300 }}>
              Ich nehme mir Zeit für echte Verbindungen. Kein Hetzen, kein Performen — einfach da sein.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: '#9A8E84', fontSize: 12, fontWeight: 300 }}>Match heute</span>

              <button style={{
                background: '#2F4A3C', color: '#F2EBE2', border: 'none',
                borderRadius: 14, padding: '10px 22px',
                fontSize: 13, fontWeight: 400, letterSpacing: '0.02em',
                cursor: 'pointer',
              }}>
                Begegnung anfragen
              </button>
            </div>
          </div>
        </div>

        {/* Locked — very subtle */}
        <div style={{
          marginTop: 16, padding: '18px 20px',
          background: 'rgba(47,74,60,0.04)',
          borderRadius: 18,
          border: '0.5px solid rgba(47,74,60,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <p style={{ color: '#9A8E84', fontSize: 13, margin: 0, fontWeight: 300 }}>2 weitere Matches</p>
            <p style={{ color: '#BFA76A', fontSize: 12, margin: '3px 0 0' }}>Mit Mitgliedschaft sichtbar</p>
          </div>
          <span style={{ color: 'rgba(47,74,60,0.25)', fontSize: 20 }}>○</span>
        </div>

      </main>

      <BottomNav active="matches" />
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
