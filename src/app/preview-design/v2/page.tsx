export default function PreviewV2Index() {
  return (
    <div style={{ padding: 32, background: '#E7DFD6', minHeight: '100vh' }}>
      <h1 style={{ color: '#2F4A3C', fontSize: 28 }}>Design v2 Previews</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
        <a href="/preview-design/v2/entdecken" style={{ color: '#2F4A3C' }}>→ Entdecken (Lukas)</a>
        <a href="/preview-design/v2/matches" style={{ color: '#2F4A3C' }}>→ Matches (Thomas)</a>
        <a href="/preview-design/v2/begegnung" style={{ color: '#2F4A3C' }}>→ Begegnung (Michael)</a>
        <a href="/preview-design/v2/profil" style={{ color: '#2F4A3C' }}>→ Profil</a>
      </div>
    </div>
  )
}
