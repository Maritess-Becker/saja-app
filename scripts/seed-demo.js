// ============================================================
// HT Connect — Demo Seed Script (Lukas, Thomas, Michael)
// Run: node scripts/seed-demo.js
// ============================================================

const { createClient } = require('@supabase/supabase-js')
const https = require('https')
const http = require('http')

const SUPABASE_URL = 'https://pbtenchqgckictgzmnto.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBidGVuY2hxZ2NraWN0Z3ptbnRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjAxNDQ3OSwiZXhwIjoyMDkxNTkwNDc5fQ.RMi0IPgu8IZfIY4BTVntu4oSojpzXak3OhrVueOpKGw'
const MY_EMAIL = 'maritess.becker@gmx.de'
const DEMO_PASSWORD = 'DemoSaja2024!'
const BUCKET = 'profile-photos'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ── Helper: download a URL as a Buffer ──────────────────────────────────────
function downloadBuffer(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http
    client.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(downloadBuffer(res.headers.location))
      }
      const chunks = []
      res.on('data', (c) => chunks.push(c))
      res.on('end', () => resolve(Buffer.concat(chunks)))
      res.on('error', reject)
    }).on('error', reject)
  })
}

// ── Photo source URLs (randomuser.me placeholder images) ────────────────────
// Since no WhatsApp_Image_2026-04-20 files were found on disk,
// we use placeholder portraits. Replace with real paths if images arrive later.
const PHOTO_SOURCES = {
  lukas_1: 'https://randomuser.me/api/portraits/men/36.jpg',
  lukas_2: 'https://randomuser.me/api/portraits/men/37.jpg',
  lukas_3: 'https://randomuser.me/api/portraits/men/38.jpg',
  lukas_4: 'https://randomuser.me/api/portraits/men/39.jpg',
  thomas_1: 'https://randomuser.me/api/portraits/men/60.jpg',
  thomas_2: 'https://randomuser.me/api/portraits/men/61.jpg',
  thomas_3: 'https://randomuser.me/api/portraits/men/62.jpg',
  thomas_4: 'https://randomuser.me/api/portraits/men/63.jpg',
  michael_1: 'https://randomuser.me/api/portraits/men/20.jpg',
  michael_2: 'https://randomuser.me/api/portraits/men/21.jpg',
}

// ── Demo user definitions ────────────────────────────────────────────────────
const DEMO_USERS = [
  {
    email: 'demo.lukas@saja.app',
    name: 'Lukas',
    age: 42,
    location: 'München',
    occupation: 'Unternehmensberater',
    height_cm: 183,
    gender: 'Mann',
    bio: 'Ich lebe bewusst — das war nicht immer so. Nach Jahren im Autopilot habe ich angefangen zu fragen was ich wirklich will. Heute bin ich jemand der lieber weniger aber tiefer geht.',
    intention: 'Feste Partnerschaft',
    relationship_model: 'Monogam',
    bindungstyp: 'Sicher gebunden',
    love_language: 'Quality Time',
    introvert_extrovert: 65,
    spontan_strukturiert: 40,
    rational_emotional: 55,
    werte: ['Wachstum', 'Tiefe Gespräche', 'Verlässlichkeit', 'Abenteuer', 'Familie'],
    dealbreakers: ['Rauchen', 'Fernbeziehung'],
    interests: ['Wandern', 'Kochen', 'Meditation', 'Reisen', 'Musik'],
    my_world: ['🧘 Yoga & Meditation', '🌿 Achtsamkeit & Minimalismus', '🌱 Persönlichkeitsentwicklung'],
    sun_sign: '♉ Stier',
    chinese_zodiac: 'Hund',
    sexuality_visible: false,
    prompts: [
      { question: 'Was ich in einer Begegnung wirklich suche...', answer: 'Jemanden bei dem ich nicht erklären muss warum ich nachdenke bevor ich antworte.' },
      { question: 'Ich bringe in eine Beziehung mit...', answer: 'Verlässlichkeit. Und die Fähigkeit zuzuhören ohne sofort zu lösen.' },
      { question: 'Worüber ich stundenlang reden kann...', answer: 'Warum Menschen tun was sie tun.' },
    ],
    photoKeys: ['lukas_1', 'lukas_2', 'lukas_3', 'lukas_4'],
    photoCaptions: [null, 'Kochen ist meine Meditation', null, 'In den Bergen finde ich Stille'],
    matchStatus: 'open',
    connectionStatus: null,
    connectionInitiator: 'other', // not used since no connection
  },
  {
    email: 'demo.thomas2@saja.app',
    name: 'Thomas',
    age: 57,
    location: 'Hamburg',
    occupation: 'Architekt',
    height_cm: 179,
    gender: 'Mann',
    bio: 'Ich habe viel erlebt — eine lange Ehe, zwei Kinder die jetzt erwachsen sind, einen Neuanfang den ich mir nicht vorstellen konnte. Heute weiß ich: Tiefe ist keine Frage des Alters.',
    intention: 'Tiefe Verbindung',
    relationship_model: 'Monogam',
    bindungstyp: 'Vermeidend-distanziert',
    love_language: 'Hilfsbereitschaft',
    introvert_extrovert: 35,
    spontan_strukturiert: 70,
    rational_emotional: 30,
    werte: ['Verlässlichkeit', 'Stille', 'Natur', 'Kunst', 'Freiheit'],
    dealbreakers: ['Keine Kinder gewünscht', 'Großer Altersunterschied'],
    interests: ['Wandern', 'Lesen', 'Fotografie', 'Natur', 'Kunst'],
    my_world: ['🌿 Achtsamkeit & Minimalismus', '🧠 Psychologie & Trauma-Arbeit', '🌙 Schamanismus & Naturverbundenheit'],
    sun_sign: '♒ Wassermann',
    chinese_zodiac: 'Drache',
    sexuality_visible: false,
    prompts: [
      { question: 'Mein perfekter Sonntag sieht so aus…', answer: 'Frühstück ohne Eile. Ein langer Spaziergang. Abends ein gutes Buch und jemanden der einfach da ist.' },
      { question: 'Was ich gerade über mich lerne...', answer: 'Dass Stille kein Mangel ist — sondern Reichtum.' },
      { question: 'Ich bringe in eine Beziehung mit...', answer: 'Verlässlichkeit und die Fähigkeit wirklich zuzuhören.' },
    ],
    photoKeys: ['thomas_1', 'thomas_2', 'thomas_3', 'thomas_4'],
    photoCaptions: [null, 'In der Natur bin ich zuhause', 'Kochen als Akt der Fürsorge', null],
    matchStatus: 'requested', // match exists, thomas requested connection
    connectionStatus: 'requested',
    connectionInitiator: 'other', // thomas → maritess
  },
  {
    email: 'demo.michael@saja.app',
    name: 'Michael',
    age: 38,
    location: 'Berlin',
    occupation: 'Psychologe',
    height_cm: 181,
    gender: 'Mann',
    bio: 'Ich begleite Menschen täglich dabei sich selbst besser zu verstehen. Privat suche ich dasselbe — jemanden mit dem ich wachsen kann ohne mich zu verlieren.',
    intention: 'Feste Partnerschaft',
    relationship_model: 'Noch offen',
    bindungstyp: 'Sicher gebunden',
    love_language: 'Worte der Wertschätzung',
    introvert_extrovert: 50,
    spontan_strukturiert: 45,
    rational_emotional: 60,
    werte: ['Wachstum', 'Achtsamkeit', 'Tiefe Gespräche', 'Humor', 'Körperlichkeit'],
    dealbreakers: ['Rauchen', 'Starke Religiosität'],
    interests: ['Lesen', 'Sport', 'Kochen', 'Reisen', 'Meditation'],
    my_world: ['🧠 Psychologie & Trauma-Arbeit', '👁️ Inneres Kind & IFS', '🌱 Persönlichkeitsentwicklung', '🧘 Yoga & Meditation'],
    sun_sign: '♏ Skorpion',
    chinese_zodiac: 'Tiger',
    sexuality_visible: false,
    prompts: [
      { question: 'Was Menschen an mir oft überrascht...', answer: 'Dass ich als Psychologe manchmal der schlechteste Zuhörer in meinem eigenen Leben bin.' },
      { question: 'So fühlt sich echte Nähe für mich an...', answer: 'Wenn ich nichts erklären muss und trotzdem verstanden werde.' },
      { question: 'Worüber ich stundenlang reden kann...', answer: 'Warum wir Menschen lieben wen wir lieben.' },
    ],
    // Michael reuses lukas_3 and lukas_4 as specified
    photoKeys: ['lukas_3', 'lukas_4'],
    photoCaptions: [null, null],
    matchStatus: 'requested', // match exists, michael requested connection
    connectionStatus: 'requested',
    connectionInitiator: 'other', // michael → maritess
  },
]

// ── Upload images to storage ─────────────────────────────────────────────────
async function uploadPhotos() {
  console.log('\n📸 Uploading photos to storage bucket:', BUCKET)
  const publicUrls = {}

  // Deduplicate keys across all users
  const allKeys = [...new Set(DEMO_USERS.flatMap(u => u.photoKeys))]

  for (const key of allKeys) {
    const src = PHOTO_SOURCES[key]
    const storagePath = `demo/${key}.jpg`

    // Check if already exists
    const { data: existing } = await supabase.storage
      .from(BUCKET)
      .list('demo', { search: `${key}.jpg` })

    if (existing && existing.find(f => f.name === `${key}.jpg`)) {
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)
      publicUrls[key] = urlData.publicUrl
      console.log(`  ↩ ${key}: already uploaded`)
      continue
    }

    try {
      console.log(`  ↓ Downloading ${key} from ${src}...`)
      const buffer = await downloadBuffer(src)

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, buffer, {
          contentType: 'image/jpeg',
          upsert: true,
        })

      if (error) {
        console.warn(`  ⚠️  Upload failed for ${key}: ${error.message} — using source URL as fallback`)
        publicUrls[key] = src
      } else {
        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)
        publicUrls[key] = urlData.publicUrl
        console.log(`  ✓ Uploaded ${key} → ${publicUrls[key]}`)
      }
    } catch (err) {
      console.warn(`  ⚠️  Could not download ${key}: ${err.message} — using source URL as fallback`)
      publicUrls[key] = src
    }
  }

  return publicUrls
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function run() {
  console.log('════════════════════════════════════════════')
  console.log('  HT Connect — Demo Seed (Lukas/Thomas/Michael)')
  console.log('════════════════════════════════════════════\n')

  // ── STEP 0: Find maritess ────────────────────────────────────────────────
  console.log('STEP 0 — Finding maritess.becker@gmx.de...')
  const { data: { users: allUsers }, error: listErr } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  if (listErr) throw new Error('listUsers: ' + listErr.message)

  const me = allUsers.find(u => u.email === MY_EMAIL)
  if (!me) throw new Error(`User ${MY_EMAIL} not found! Please sign up / log in first.`)
  const myId = me.id
  console.log(`✓ Found: ${me.email} (${myId})`)

  // ── STEP 0b: Set premium for maritess ────────────────────────────────────
  console.log('\nSTEP 0b — Setting premium subscription for maritess...')
  // Upsert into users table (the subscription_tier lives there per migration 001)
  const { error: premErr } = await supabase
    .from('users')
    .upsert({ id: myId, email: MY_EMAIL, subscription_tier: 'premium' }, { onConflict: 'id' })
  if (premErr) {
    console.warn(`  ⚠️  Could not set premium on users table: ${premErr.message}`)
  } else {
    console.log('✓ subscription_tier = premium set on users table')
  }

  // ── STEP 0c: Delete old demo profiles (not maritess) ────────────────────
  console.log('\nSTEP 0c — Cleaning up old demo users (not maritess)...')
  const demoEmails = DEMO_USERS.map(u => u.email)
  const demoExisting = allUsers.filter(u => demoEmails.includes(u.email))

  for (const du of demoExisting) {
    // Delete likes
    await supabase.from('likes').delete().or(`from_user_id.eq.${du.id},to_user_id.eq.${du.id}`)
    // matches cascade to connections; delete matches
    const { data: matchRows } = await supabase.from('matches')
      .select('id')
      .or(`user1_id.eq.${du.id},user2_id.eq.${du.id}`)
    for (const m of matchRows ?? []) {
      await supabase.from('connections').delete().eq('match_id', m.id)
    }
    await supabase.from('matches').delete().or(`user1_id.eq.${du.id},user2_id.eq.${du.id}`)
    await supabase.from('profiles').delete().eq('user_id', du.id)
    await supabase.auth.admin.deleteUser(du.id)
    console.log(`  ✓ Deleted old demo user: ${du.email}`)
  }

  // ── STEP 1: Upload photos ────────────────────────────────────────────────
  const publicUrls = await uploadPhotos()

  // ── STEP 2: Create auth users ────────────────────────────────────────────
  console.log('\nSTEP 2 — Creating auth users...')
  const createdUsers = []

  for (const demo of DEMO_USERS) {
    // Re-check after cleanup
    const { data: { users: freshUsers } } = await supabase.auth.admin.listUsers({ perPage: 1000 })
    const existing = freshUsers.find(u => u.email === demo.email)

    let userId
    if (existing) {
      userId = existing.id
      console.log(`  ↩ ${demo.name} already exists (${userId})`)
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email: demo.email,
        password: DEMO_PASSWORD,
        email_confirm: true,
      })
      if (error) throw new Error(`createUser ${demo.name}: ${error.message}`)
      userId = data.user.id
      console.log(`  ✓ Created auth user: ${demo.name} (${userId})`)
    }
    createdUsers.push({ ...demo, userId })
  }

  // ── STEP 3: Create profiles ──────────────────────────────────────────────
  console.log('\nSTEP 3 — Upserting profiles...')

  for (const u of createdUsers) {
    // Build photos JSONB array
    const photos = u.photoKeys.map((key, idx) => ({
      url: publicUrls[key] || PHOTO_SOURCES[key],
      path: `demo/${key}.jpg`,
      caption: u.photoCaptions[idx] || null,
    }))

    const profileData = {
      user_id: u.userId,
      name: u.name,
      age: u.age,
      location: u.location,
      occupation: u.occupation,
      height_cm: u.height_cm,
      gender: u.gender,
      bio: u.bio,
      intention: u.intention,
      relationship_model: u.relationship_model,
      bindungstyp: u.bindungstyp,
      love_language: u.love_language,
      introvert_extrovert: u.introvert_extrovert,
      spontan_strukturiert: u.spontan_strukturiert,
      rational_emotional: u.rational_emotional,
      werte: u.werte,
      dealbreakers: u.dealbreakers,
      interests: u.interests,
      my_world: u.my_world,
      sun_sign: u.sun_sign,
      chinese_zodiac: u.chinese_zodiac,
      sexuality_visible: u.sexuality_visible,
      prompts: u.prompts,
      photos: photos,
      is_complete: true,
      is_demo: true,
    }

    const { error } = await supabase.from('profiles')
      .upsert(profileData, { onConflict: 'user_id' })

    if (error) {
      // Fallback: try without is_demo if column somehow missing
      if (error.message.includes('is_demo')) {
        const { is_demo, ...dataWithout } = profileData
        const { error: e2 } = await supabase.from('profiles').upsert(dataWithout, { onConflict: 'user_id' })
        if (e2) throw new Error(`profile ${u.name}: ${e2.message}`)
      } else {
        throw new Error(`profile ${u.name}: ${error.message}`)
      }
    }
    console.log(`  ✓ Profile upserted: ${u.name}`)
  }

  // ── STEP 4: Create likes (both directions = mutual = match eligible) ──────
  console.log('\nSTEP 4 — Creating mutual likes...')

  for (const u of createdUsers) {
    // Demo user likes maritess
    const { error: e1 } = await supabase.from('likes').upsert(
      { from_user_id: u.userId, to_user_id: myId },
      { onConflict: 'from_user_id,to_user_id' }
    )
    if (e1) console.warn(`  ⚠️  like ${u.name}→maritess: ${e1.message}`)

    // Maritess likes back
    const { error: e2 } = await supabase.from('likes').upsert(
      { from_user_id: myId, to_user_id: u.userId },
      { onConflict: 'from_user_id,to_user_id' }
    )
    if (e2) console.warn(`  ⚠️  like maritess→${u.name}: ${e2.message}`)

    console.log(`  ✓ Mutual likes: maritess ↔ ${u.name}`)
  }

  // ── STEP 5: Create matches ───────────────────────────────────────────────
  console.log('\nSTEP 5 — Creating matches...')

  for (const u of createdUsers) {
    // Check if match already exists
    const { data: existing } = await supabase
      .from('matches')
      .select('id')
      .or(`and(user1_id.eq.${myId},user2_id.eq.${u.userId}),and(user1_id.eq.${u.userId},user2_id.eq.${myId})`)
      .maybeSingle()

    let matchId
    if (existing) {
      matchId = existing.id
      await supabase.from('matches').update({ status: u.matchStatus }).eq('id', matchId)
      console.log(`  ↩ Match ${u.name}: already exists (updated status → ${u.matchStatus})`)
    } else {
      const { data, error } = await supabase.from('matches').insert({
        user1_id: myId,
        user2_id: u.userId,
        status: u.matchStatus,
      }).select('id').single()
      if (error) throw new Error(`match ${u.name}: ${error.message}`)
      matchId = data.id
      console.log(`  ✓ Match created: ${u.name} (status: ${u.matchStatus})`)
    }
    u.matchId = matchId
  }

  // ── STEP 6: Create connection requests ──────────────────────────────────
  console.log('\nSTEP 6 — Creating connection requests...')

  for (const u of createdUsers) {
    if (!u.connectionStatus) continue

    // Remove any existing connection for this match
    await supabase.from('connections').delete().eq('match_id', u.matchId)

    // requestedBy is the demo user (they request maritess)
    const requestedBy = u.userId

    const { error } = await supabase.from('connections').insert({
      match_id: u.matchId,
      requested_by: requestedBy,
      status: u.connectionStatus,
      expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    })
    if (error) throw new Error(`connection ${u.name}: ${error.message}`)
    console.log(`  ✓ Connection request: ${u.name} → maritess (status: ${u.connectionStatus})`)
  }

  // ── Summary ─────────────────────────────────────────────────────────────
  console.log(`
════════════════════════════════════════════
  SEED COMPLETE
════════════════════════════════════════════

  maritess.becker@gmx.de
    → subscription_tier: premium

  Demo Users Created:
  1. Lukas   (demo.lukas@saja.app)
     → Match status: open (no connection request)
     → Age 42, München, Unternehmensberater, 183cm
     → 4 photos: lukas_1..4

  2. Thomas  (demo.thomas2@saja.app)
     → Match status: requested + connection 'requested' (Thomas → maritess)
     → Age 57, Hamburg, Architekt, 179cm
     → 4 photos: thomas_1..4

  3. Michael (demo.michael@saja.app)
     → Match status: requested + connection 'requested' (Michael → maritess)
     → Age 38, Berlin, Psychologe, 181cm
     → 2 photos: lukas_3, lukas_4

  Password for all demo users: ${DEMO_PASSWORD}
════════════════════════════════════════════
`)
}

run().catch(err => {
  console.error('\n❌ Error:', err.message)
  process.exit(1)
})
