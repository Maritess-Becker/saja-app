const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabase = createClient(
  'https://pbtenchqgckictgzmnto.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBidGVuY2hxZ2NraWN0Z3ptbnRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjAxNDQ3OSwiZXhwIjoyMDkxNTkwNDc5fQ.RMi0IPgu8IZfIY4BTVntu4oSojpzXak3OhrVueOpKGw',
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const BASE = 'C:/Users/Nadja/Pictures/Screenshots'

// Mapping: Zieldateiname → Quelldatei
const PHOTO_MAP = {
  // Thomas (Mann mit grauem Haar, Ende 50)
  'demo/thomas_1.jpg': path.join(BASE, 'WhatsApp Image 2026-04-20 at 22.35.44 (4).jpeg'),
  'demo/thomas_2.jpg': path.join(BASE, 'WhatsApp Image 2026-04-20 at 22.35.44 (5).jpeg'),
  'demo/thomas_3.jpg': path.join(BASE, 'WhatsApp Image 2026-04-20 at 22.35.45 (1).jpeg'),
  'demo/thomas_4.jpg': path.join(BASE, 'WhatsApp Image 2026-04-20 at 22.35.45.jpeg'),
  // Lukas (Mann mit braunen Haaren, Anfang 40)
  'demo/lukas_1.jpg':  path.join(BASE, 'WhatsApp Image 2026-04-20 at 22.35.45 (2).jpeg'),
  'demo/lukas_2.jpg':  path.join(BASE, 'WhatsApp Image 2026-04-20 at 22.35.45 (3).jpeg'),
  'demo/lukas_3.jpg':  path.join(BASE, 'WhatsApp Image 2026-04-20 at 22.35.46 (1).jpeg'),
  'demo/lukas_4.jpg':  path.join(BASE, 'WhatsApp Image 2026-04-20 at 22.35.46.jpeg'),
}

function publicUrl(storagePath) {
  return `https://pbtenchqgckictgzmnto.supabase.co/storage/v1/object/public/profile-photos/${storagePath}`
}

async function main() {
  console.log('📸 Lade echte Fotos hoch...\n')

  const urls = {}

  for (const [dest, src] of Object.entries(PHOTO_MAP)) {
    if (!fs.existsSync(src)) {
      console.log(`⚠️  Nicht gefunden: ${src}`)
      continue
    }
    const buffer = fs.readFileSync(src)
    const { error } = await supabase.storage
      .from('profile-photos')
      .upload(dest, buffer, { contentType: 'image/jpeg', upsert: true })
    if (error) {
      console.log(`❌ Fehler bei ${dest}: ${error.message}`)
    } else {
      urls[dest] = publicUrl(dest)
      console.log(`✓ ${dest}`)
    }
  }

  console.log('\n🔄 Aktualisiere Profil-Fotos in DB...\n')

  // Hole Demo-Profil-IDs
  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, name')
    .in('name', ['Lukas', 'Thomas', 'Michael'])

  if (!profiles?.length) {
    console.log('❌ Keine Demo-Profile gefunden. Bitte zuerst seed-demo.js ausführen.')
    return
  }

  for (const profile of profiles) {
    let photos = []

    if (profile.name === 'Lukas') {
      photos = [
        { url: publicUrl('demo/lukas_1.jpg'), path: 'demo/lukas_1.jpg', caption: null },
        { url: publicUrl('demo/lukas_2.jpg'), path: 'demo/lukas_2.jpg', caption: 'Kochen ist meine Meditation' },
        { url: publicUrl('demo/lukas_3.jpg'), path: 'demo/lukas_3.jpg', caption: null },
        { url: publicUrl('demo/lukas_4.jpg'), path: 'demo/lukas_4.jpg', caption: 'In den Bergen finde ich Stille' },
      ]
    } else if (profile.name === 'Thomas') {
      photos = [
        { url: publicUrl('demo/thomas_1.jpg'), path: 'demo/thomas_1.jpg', caption: null },
        { url: publicUrl('demo/thomas_2.jpg'), path: 'demo/thomas_2.jpg', caption: 'In der Natur bin ich zuhause' },
        { url: publicUrl('demo/thomas_3.jpg'), path: 'demo/thomas_3.jpg', caption: 'Kochen als Akt der Fürsorge' },
        { url: publicUrl('demo/thomas_4.jpg'), path: 'demo/thomas_4.jpg', caption: null },
      ]
    } else if (profile.name === 'Michael') {
      photos = [
        { url: publicUrl('demo/lukas_3.jpg'), path: 'demo/lukas_3.jpg', caption: null },
        { url: publicUrl('demo/lukas_4.jpg'), path: 'demo/lukas_4.jpg', caption: null },
      ]
    }

    const { error } = await supabase
      .from('profiles')
      .update({ photos })
      .eq('user_id', profile.user_id)

    if (error) {
      console.log(`❌ Foto-Update für ${profile.name}: ${error.message}`)
    } else {
      console.log(`✓ ${profile.name}: ${photos.length} Fotos aktualisiert`)
    }
  }

  console.log('\n✅ Fertig!')
}

main()
