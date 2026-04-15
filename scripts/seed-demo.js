// ============================================================
// SAJA — Demo User Seed Script
// Run once: node scripts/seed-demo.js
// ============================================================

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://pbtenchqgckictgzmnto.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBidGVuY2hxZ2NraWN0Z3ptbnRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjAxNDQ3OSwiZXhwIjoyMDkxNTkwNDc5fQ.RMi0IPgu8IZfIY4BTVntu4oSojpzXak3OhrVueOpKGw'
const MY_EMAIL = 'maritess.becker@gmx.de'
const DEMO_PASSWORD = 'DemoSaja2024!'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const DEMO_USERS = [
  {
    email: 'demo.sophia@saja.app',
    name: 'Sophia', age: 38, location: 'München', gender: 'Frau',
    occupation: 'Yoga-Lehrerin', bindungstyp: 'Sicher', love_language: 'Quality Time',
    intention: 'Tiefe Verbindung',
    bio: 'Yoga-Lehrerin aus München. Bewegung, Stille und tiefe Gespräche sind meine Welt. Ich suche jemanden, der auch wirklich ankommen möchte.',
    profile_quote: 'Verbindung entsteht in der Stille zwischen den Worten.',
    interests: ['Yoga', 'Meditation', 'Natur', 'Kochen'],
    height_cm: 168,
    photos: [
      'https://randomuser.me/api/portraits/women/44.jpg',
      'https://randomuser.me/api/portraits/women/45.jpg',
      'https://randomuser.me/api/portraits/women/46.jpg',
    ],
    werte: ['Ehrlichkeit', 'Bewusstsein', 'Tiefe', 'Stille'],
    relationship_model: 'Monogamie',
    matchStatus: 'requested',
    connection: 'requested',  // Sophia hat Begegnung angefragt
  },
  {
    email: 'demo.marco@saja.app',
    name: 'Marco', age: 44, location: 'Palma de Mallorca', gender: 'Mann',
    occupation: 'Architekt', bindungstyp: 'Sicher', love_language: 'Acts of Service',
    intention: 'Echte Begegnung',
    bio: 'Architekt auf Mallorca. Ich glaube daran, dass Räume — wie Beziehungen — mit Absicht gestaltet sein wollen.',
    profile_quote: 'Form folgt Gefühl.',
    interests: ['Architektur', 'Segeln', 'Kochen', 'Reisen'],
    height_cm: 183,
    photos: [
      'https://randomuser.me/api/portraits/men/32.jpg',
      'https://randomuser.me/api/portraits/men/33.jpg',
      'https://randomuser.me/api/portraits/men/34.jpg',
    ],
    werte: ['Authentizität', 'Freiheit', 'Wachstum'],
    relationship_model: 'Offen',
    matchStatus: 'open',
    connection: null,
  },
  {
    email: 'demo.elena@saja.app',
    name: 'Elena', age: 51, location: 'Mallorca', gender: 'Frau',
    occupation: 'Freiberuflerin', bindungstyp: 'Anxious-Secure', love_language: 'Worte der Zuneigung',
    intention: 'Tiefe Verbindung',
    bio: 'Ich lebe seit Jahren auf Mallorca, arbeite freiberuflich und liebe Worte — ob geschrieben, gesprochen oder still gemeint.',
    profile_quote: 'Das Leben ist zu kurz für halbe Gefühle.',
    interests: ['Schreiben', 'Lesen', 'Natur', 'Sprachen'],
    height_cm: 165,
    photos: [
      'https://randomuser.me/api/portraits/women/65.jpg',
      'https://randomuser.me/api/portraits/women/66.jpg',
      'https://randomuser.me/api/portraits/women/67.jpg',
    ],
    werte: ['Ehrlichkeit', 'Tiefe', 'Verbindung', 'Authentizität'],
    relationship_model: 'Monogamie',
    matchStatus: 'active',
    connection: 'active',  // Elena ist in aktiver Begegnung
  },
  {
    email: 'demo.lena@saja.app',
    name: 'Lena', age: 36, location: 'Berlin', gender: 'Frau',
    occupation: 'Coach', bindungstyp: 'Sicher', love_language: 'Berührung',
    intention: 'Bewusste Partnerschaft',
    bio: 'Coach aus Berlin. Ich begleite Menschen durch Veränderungen und glaube an Wachstum durch echte Begegnung.',
    profile_quote: 'Wachstum geschieht im Kontakt.',
    interests: ['Coaching', 'Tanzen', 'Wandern', 'Psychologie'],
    height_cm: 171,
    photos: [
      'https://randomuser.me/api/portraits/women/22.jpg',
      'https://randomuser.me/api/portraits/women/23.jpg',
      'https://randomuser.me/api/portraits/women/24.jpg',
    ],
    werte: ['Wachstum', 'Bewusstsein', 'Freiheit', 'Authentizität'],
    relationship_model: 'Ich bin offen für verschiedenes',
    matchStatus: 'requested',
    connection: 'requested',  // Lena hat Begegnung angefragt
  },
  {
    email: 'demo.thomas@saja.app',
    name: 'Thomas', age: 47, location: 'Hamburg', gender: 'Mann',
    occupation: 'Unternehmer', bindungstyp: 'Vermeidend-Sicher', love_language: 'Quality Time',
    intention: 'Tiefe Verbindung',
    bio: 'Unternehmer aus Hamburg. Nach Jahren des Aufbaus möchte ich jetzt wirklich ankommen — bei mir selbst und bei jemandem anderen.',
    profile_quote: 'Qualität über Quantität — in allem.',
    interests: ['Unternehmertum', 'Sport', 'Reisen', 'Philosophie'],
    height_cm: 185,
    photos: [
      'https://randomuser.me/api/portraits/men/52.jpg',
      'https://randomuser.me/api/portraits/men/53.jpg',
      'https://randomuser.me/api/portraits/men/54.jpg',
    ],
    werte: ['Ehrlichkeit', 'Wachstum', 'Tiefe'],
    relationship_model: 'Monogamie',
    matchStatus: 'open',
    connection: null,
  },
  {
    email: 'demo.julia@saja.app',
    name: 'Julia', age: 42, location: 'Zürich', gender: 'Frau',
    occupation: 'Designerin', bindungstyp: 'Sicher', love_language: 'Kreativität & Ästhetik',
    intention: 'Echte Begegnung',
    bio: 'Designerin aus Zürich. Ich gestalte Dinge, die berühren — und suche eine Verbindung, die dasselbe tut.',
    profile_quote: 'Schönheit liegt in der Aufmerksamkeit.',
    interests: ['Design', 'Kunst', 'Reisen', 'Musik'],
    height_cm: 169,
    photos: [
      'https://randomuser.me/api/portraits/women/38.jpg',
      'https://randomuser.me/api/portraits/women/39.jpg',
      'https://randomuser.me/api/portraits/women/40.jpg',
    ],
    werte: ['Authentizität', 'Bewusstsein', 'Freiheit', 'Kreativität'],
    relationship_model: 'Offen',
    matchStatus: 'open',
    connection: null,
  },
  // ── Discover-only profiles (sie liken mich, ich noch nicht zurück) ──
  {
    email: 'demo.felix@saja.app',
    name: 'Felix', age: 35, location: 'Berlin', gender: 'Mann',
    occupation: 'Musiker & Sounddesigner', bindungstyp: 'Sicher', love_language: 'Quality Time',
    intention: 'Tiefe Verbindung',
    bio: 'Ich lebe in Tönen und Stille. Musik hat mich gelehrt, wirklich zuzuhören — das vermisse ich auch in Beziehungen.',
    profile_quote: 'Stille ist keine Leere, sondern ein Raum für das Wesentliche.',
    interests: ['Musik', 'Meditation', 'Natur', 'Philosophie'],
    height_cm: 180,
    photos: [
      'https://randomuser.me/api/portraits/men/41.jpg',
      'https://randomuser.me/api/portraits/men/42.jpg',
      'https://randomuser.me/api/portraits/men/43.jpg',
    ],
    werte: ['Tiefe', 'Präsenz', 'Ehrlichkeit', 'Freiheit'],
    relationship_model: 'Monogamie',
    matchStatus: null,   // kein Match — erscheint in Entdecken
    connection: null,
    discoverOnly: true,  // kein outgoing like von mir
  },
  {
    email: 'demo.nina@saja.app',
    name: 'Nina', age: 31, location: 'Köln', gender: 'Frau',
    occupation: 'Heilpraktikerin', bindungstyp: 'Sicher', love_language: 'Körperliche Berührung',
    intention: 'Bewusstes Dating',
    bio: 'Ich arbeite mit dem Körper, weil er nie lügt. Heilsame Berührung, Atemarbeit und echte Begegnungen sind mein Alltag.',
    profile_quote: 'Der Körper weiß, was der Kopf noch lernt.',
    interests: ['Atemarbeit', 'Tanz', 'Heilkräuter', 'Yoga'],
    height_cm: 166,
    photos: [
      'https://randomuser.me/api/portraits/women/55.jpg',
      'https://randomuser.me/api/portraits/women/56.jpg',
      'https://randomuser.me/api/portraits/women/57.jpg',
    ],
    werte: ['Verkörperung', 'Heilung', 'Präsenz', 'Authentizität'],
    relationship_model: 'Offen',
    matchStatus: null,
    connection: null,
    discoverOnly: true,
  },
]

async function run() {
  console.log('🌸 Saja Demo Seed — Start\n')

  // ─── Get my real user ID ─────────────────────────────────────────
  const { data: { users: allUsers }, error: listErr } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  if (listErr) throw new Error('listUsers: ' + listErr.message)

  const me = allUsers.find(u => u.email === MY_EMAIL)
  if (!me) throw new Error(`User ${MY_EMAIL} not found! Bitte zuerst einloggen.`)
  console.log(`✓ Mein Account gefunden: ${me.email} (${me.id})\n`)

  const myId = me.id
  const createdUsers = []

  // ─── Create or reuse demo auth users ─────────────────────────────
  for (const demo of DEMO_USERS) {
    // Check if already exists
    const existing = allUsers.find(u => u.email === demo.email)
    let userId

    if (existing) {
      console.log(`↩ ${demo.name} existiert bereits (${existing.id})`)
      userId = existing.id
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email: demo.email,
        password: DEMO_PASSWORD,
        email_confirm: true,
      })
      if (error) throw new Error(`createUser ${demo.name}: ${error.message}`)
      userId = data.user.id
      console.log(`✓ ${demo.name} erstellt (${userId})`)
    }

    createdUsers.push({ ...demo, userId })
  }

  console.log('')

  // ─── Profiles ────────────────────────────────────────────────────
  for (const u of createdUsers) {
    const profileData = {
      user_id: u.userId,
      name: u.name,
      age: u.age,
      location: u.location,
      gender: u.gender,
      occupation: u.occupation,
      bindungstyp: u.bindungstyp,
      love_language: u.love_language,
      intention: u.intention,
      bio: u.bio,
      profile_quote: u.profile_quote,
      interests: u.interests,
      height_cm: u.height_cm ?? null,
      photos: u.photos ?? [],
      werte: u.werte ?? [],
      relationship_model: u.relationship_model ?? null,
      is_complete: true,
    }

    // Try with is_demo first; if column missing, insert without it
    let { error } = await supabase.from('profiles').upsert(
      { ...profileData, is_demo: true },
      { onConflict: 'user_id' }
    )
    if (error && error.message.includes('is_demo')) {
      ;({ error } = await supabase.from('profiles').upsert(profileData, { onConflict: 'user_id' }))
    }
    // If height_cm column doesn't exist yet, insert without it
    if (error && error.message.includes('height_cm')) {
      const { height_cm, ...profileWithoutHeight } = profileData
      ;({ error } = await supabase.from('profiles').upsert(
        { ...profileWithoutHeight, is_demo: true },
        { onConflict: 'user_id' }
      ))
      if (error && error.message.includes('is_demo')) {
        ;({ error } = await supabase.from('profiles').upsert(profileWithoutHeight, { onConflict: 'user_id' }))
      }
      if (!error) console.log(`  ⚠️  height_cm wurde nicht gesetzt (Spalte fehlt noch — SQL-Migration ausführen)`)
    }
    if (error) throw new Error(`profile ${u.name}: ${error.message}`)
    console.log(`✓ Profil: ${u.name}`)
  }

  console.log('')

  // ─── Likes ────────────────────────────────────────────────────────
  for (const u of createdUsers) {
    // Demo user always likes me
    const { error: e1 } = await supabase.from('likes').upsert(
      { from_user_id: u.userId, to_user_id: myId },
      { onConflict: 'from_user_id,to_user_id' }
    )
    if (e1) throw new Error(`like ${u.name}→me: ${e1.message}`)

    if (u.discoverOnly) {
      // discoverOnly: kein outgoing like → erscheint in Entdecken
      console.log(`✓ Like: ${u.name} → du  (erscheint in Entdecken)`)
      continue
    }

    // I like them back → mutual → Match
    const { error: e2 } = await supabase.from('likes').upsert(
      { from_user_id: myId, to_user_id: u.userId },
      { onConflict: 'from_user_id,to_user_id' }
    )
    if (e2) throw new Error(`like me→${u.name}: ${e2.message}`)
    console.log(`✓ Likes: ${u.name} ↔ du`)
  }

  console.log('')

  // ─── Matches (nur für nicht-discoverOnly) ─────────────────────────
  for (const u of createdUsers) {
    if (u.discoverOnly) continue

    // Check if match already exists (either direction)
    const { data: existing } = await supabase
      .from('matches')
      .select('id')
      .or(`and(user1_id.eq.${myId},user2_id.eq.${u.userId}),and(user1_id.eq.${u.userId},user2_id.eq.${myId})`)
      .maybeSingle()

    if (existing) {
      await supabase.from('matches').update({ status: u.matchStatus }).eq('id', existing.id)
      u.matchId = existing.id
      console.log(`↩ Match ${u.name}: bereits vorhanden (status → ${u.matchStatus})`)
    } else {
      const { data, error } = await supabase.from('matches').insert({
        user1_id: myId,
        user2_id: u.userId,
        status: u.matchStatus,
      }).select('id').single()
      if (error) throw new Error(`match ${u.name}: ${error.message}`)
      u.matchId = data.id
      console.log(`✓ Match: ${u.name} (status: ${u.matchStatus})`)
    }
  }

  console.log('')

  // ─── Connections ─────────────────────────────────────────────────
  for (const u of createdUsers) {
    if (!u.connection || u.discoverOnly) continue

    // Remove old connection for this match first (idempotent)
    await supabase.from('connections').delete().eq('match_id', u.matchId)

    if (u.connection === 'requested') {
      const { error } = await supabase.from('connections').insert({
        match_id: u.matchId,
        requested_by: u.userId,
        status: 'requested',
        expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      })
      if (error) throw new Error(`connection ${u.name}: ${error.message}`)
      console.log(`✓ Begegnung-Anfrage: ${u.name} → du`)
    } else if (u.connection === 'active') {
      const { error } = await supabase.from('connections').insert({
        match_id: u.matchId,
        requested_by: u.userId,
        status: 'active',
        started_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      })
      if (error) throw new Error(`connection ${u.name}: ${error.message}`)
      console.log(`✓ Aktive Begegnung: ${u.name} ↔ du`)
    }
  }

  // ─── Summary ─────────────────────────────────────────────────────
  console.log(`
═══════════════════════════════════════════════════
  SAJA DEMO-ZUGANGSDATEN
═══════════════════════════════════════════════════

  Passwort für alle:  ${DEMO_PASSWORD}

  Matches:
  1. 🌸 Sophia    demo.sophia@saja.app      → Begegnung angefragt
  2. 🏛  Marco     demo.marco@saja.app       → Match (offen)
  3. 🌿 Elena     demo.elena@saja.app       → Aktive Begegnung
  4. 💫 Lena      demo.lena@saja.app        → Begegnung angefragt
  5. 🧭 Thomas    demo.thomas@saja.app      → Match (offen)
  6. 🎨 Julia     demo.julia@saja.app       → Match (offen)

  Entdecken:
  7. 🎵 Felix     demo.felix@saja.app       → erscheint in Entdecken
  8. 🌿 Nina      demo.nina@saja.app        → erscheint in Entdecken

═══════════════════════════════════════════════════
  Alle 6 Matches erscheinen in der Matches-Liste.
  Felix & Nina erscheinen in Entdecken (noch kein Match).
  Elena ist bereits in aktiver Begegnung mit dir.
  Sophia & Lena haben eine Begegnung angefragt.
═══════════════════════════════════════════════════
`)
}

run().catch(err => {
  console.error('❌ Fehler:', err.message)
  process.exit(1)
})
