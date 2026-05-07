'use client'
// Dev-only preview — delete before production
export default function PreviewOnboarding() {
  const steps = [
    { label: 'Basics', done: true },
    { label: 'Intention', done: true },
    { label: 'Werte', done: false },
    { label: 'Persönlichkeit', done: false },
    { label: 'Foto', done: false },
  ]
  const werte = ['Ehrlichkeit', 'Wachstum', 'Achtsamkeit', 'Humor', 'Verbindung', 'Freiheit', 'Familie', 'Kreativität', 'Abenteuer', 'Stille', 'Loyalität', 'Neugier']
  const selected = ['Ehrlichkeit', 'Wachstum', 'Verbindung']

  return (
    <div style={{ minHeight: '100vh', background: '#E7DFD6', fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column' }}>
      {/* Progress bar */}
      <div style={{ background: '#2F4A3C', padding: '16px 20px 0' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
            {steps.map((step, i) => (
              <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: step.done ? '#F2EBE2' : 'rgba(242,235,226,0.20)' }} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 14 }}>
            <span style={{ color: 'rgba(242,235,226,0.55)', fontSize: 13 }}>Schritt 3 von 5</span>
            <span style={{ color: '#F2EBE2', fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px' }}>Saja</span>
          </div>
        </div>
      </div>

      <main style={{ flex: 1, maxWidth: 480, margin: '0 auto', width: '100%', padding: '32px 20px 100px' }}>
        <h1 style={{ color: '#2F4A3C', fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px', margin: '0 0 8px' }}>Deine Werte</h1>
        <p style={{ color: '#6B6058', fontSize: 15, margin: '0 0 28px', lineHeight: 1.5 }}>Wähle bis zu 5 Werte, die dir wichtig sind.</p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 36 }}>
          {werte.map(w => {
            const isSelected = selected.includes(w)
            return (
              <button key={w} style={{
                background: isSelected ? '#2F4A3C' : '#F2EBE2',
                color: isSelected ? '#F2EBE2' : '#232323',
                border: `1.5px solid ${isSelected ? '#2F4A3C' : 'rgba(47,74,60,0.14)'}`,
                borderRadius: 24,
                padding: '9px 18px',
                fontSize: 14,
                fontWeight: isSelected ? 600 : 400,
                cursor: 'pointer',
              }}>
                {isSelected && '✓ '}{w}
              </button>
            )
          })}
        </div>

        {/* Phase / emotional capacity */}
        <div style={{ background: '#F2EBE2', borderRadius: 20, padding: 20, marginBottom: 20, border: '1px solid rgba(47,74,60,0.06)' }}>
          <p style={{ color: '#9A8E84', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px', fontWeight: 600 }}>Wie ist deine Kapazität gerade?</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[
              { label: 'Voll da', color: '#7A9E8A' },
              { label: 'Gerade okay', color: '#BFA76A' },
              { label: 'Aufbauend', color: '#3A5F8A' },
              { label: 'Brauche Raum', color: '#A8654C' },
            ].map((opt, i) => (
              <button key={opt.label} style={{
                background: i === 1 ? opt.color : 'transparent',
                color: i === 1 ? '#F2EBE2' : '#6B6058',
                border: `1.5px solid ${i === 1 ? opt.color : 'rgba(47,74,60,0.14)'}`,
                borderRadius: 20,
                padding: '8px 16px',
                fontSize: 13,
                cursor: 'pointer',
              }}>{opt.label}</button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button style={{
          width: '100%',
          background: '#2F4A3C',
          color: '#F2EBE2',
          border: 'none',
          borderRadius: 16,
          padding: '16px',
          fontSize: 16,
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 6px 20px rgba(47,74,60,0.25)',
        }}>
          Weiter →
        </button>
      </main>
    </div>
  )
}
