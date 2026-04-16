// scripts/seed-demos.js — Run with: node scripts/seed-demos.js
// Creates 10 realistic demo profiles and all relationships.

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// ─── Load .env.local ──────────────────────────────────────────────────────────
const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8')
const env = {}
for (const line of envContent.split('\n')) {
  const idx = line.indexOf('=')
  if (idx > 0 && !line.startsWith('#')) {
    env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim()
  }
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ─── Photo helper ─────────────────────────────────────────────────────────────
const p = (url) => ({ url, path: '' })

// ─── Profile definitions ──────────────────────────────────────────────────────
const DEMOS = [
  // ═══════════════════════════════════════
  // GRUPPE A — erscheinen im Discover
  // ═══════════════════════════════════════
  {
    key: 'sophia', group: 'A',
    email: 'sophia@demo.saja.app',
    name: 'Sophia', age: 38, location: 'München', occupation: 'Yogalehrerin & Coach',
    gender: 'Frau', seeking: ['Männer'], height_cm: 168,
    intention: 'Feste Partnerschaft', relationship_model: 'Monogam',
    bindungstyp: 'Sicher gebunden', love_language: 'Quality Time',
    sun_sign: '♓ Fische', ascendant: '♎ Waage', chinese_zodiac: 'Hase 🐇',
    werte: ['Achtsamkeit', 'Natur', 'Wachstum', 'Stille', 'Körperlichkeit'],
    photos: [
      p('https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop'),
      p('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop'),
      p('https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400&h=600&fit=crop'),
    ],
    prompts: [
      { question: 'Was ich in einer Begegnung wirklich suche', answer: 'Jemanden der wirklich zuhört. Nicht um zu antworten — sondern um zu verstehen.' },
      { question: 'Mein perfekter Sonntag — ehrlich', answer: 'Langes Frühstück, dann Wandern, abends gemeinsam kochen und einfach da sein.' },
      { question: 'Was mich täglich trägt', answer: 'Meine Morgenmeditation und ein guter Kaffee danach. In dieser Reihenfolge.' },
    ],
  },
  {
    key: 'marco', group: 'A',
    email: 'marco@demo.saja.app',
    name: 'Marco', age: 44, location: 'Hamburg', occupation: 'Architekt',
    gender: 'Mann', seeking: ['Frauen'], height_cm: 183,
    intention: 'Etwas Ernstes aufbauen', relationship_model: 'Monogam',
    bindungstyp: 'Sicher gebunden', love_language: 'Acts of Service',
    sun_sign: '♉ Stier', ascendant: '♑ Steinbock', chinese_zodiac: 'Hahn 🐓',
    werte: ['Kreativität', 'Tiefe Gespräche', 'Natur', 'Verlässlichkeit', 'Reisen'],
    photos: [
      p('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop'),
      p('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=600&fit=crop'),
      p('https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&h=600&fit=crop'),
    ],
    prompts: [
      { question: 'Wofür ich aufstehe wenn es schwer wird', answer: 'Für Menschen die ich liebe. Und für Dinge die wirklich zählen.' },
      { question: 'Das überrascht die meisten Menschen an mir', answer: 'Dass ich leidenschaftlich gerne koche. Stundenlang, ohne Rezept.' },
      { question: 'So fühlt sich echte Nähe für mich an', answer: 'Wenn ich nichts erklären muss. Einfach sein darf.' },
    ],
  },
  {
    key: 'elena', group: 'A',
    email: 'elena@demo.saja.app',
    name: 'Elena', age: 51, location: 'Berlin', occupation: 'Therapeutin',
    gender: 'Frau', seeking: ['Männer'], height_cm: 162,
    intention: 'Offen schauen', relationship_model: 'Monogam',
    bindungstyp: 'Sicher gebunden', love_language: 'Words of Affirmation',
    sun_sign: '♏ Skorpion', ascendant: '♋ Krebs', chinese_zodiac: 'Tiger 🐯',
    werte: ['Wachstum', 'Spiritualität', 'Tiefe Gespräche', 'Stille', 'Familie'],
    photos: [
      p('https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=600&fit=crop'),
      p('https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=400&h=600&fit=crop'),
      p('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=600&fit=crop'),
    ],
    prompts: [
      { question: 'Was ich gerade über mich lerne', answer: 'Dass Loslassen keine Niederlage ist. Sondern manchmal das Mutigste.' },
      { question: 'Eine Verbindung die mein Leben verändert hat', answer: 'Meine erste Therapie. Ich habe mich selbst kennengelernt — und erschrocken und geliebt.' },
      { question: 'Dafür brauche ich noch Mut', answer: 'Mich wirklich zeigen. Bevor ich weiß ob es sicher ist.' },
    ],
  },
  {
    key: 'lena', group: 'A',
    email: 'lena@demo.saja.app',
    name: 'Lena', age: 36, location: 'Wien', occupation: 'Fotografin',
    gender: 'Frau', seeking: ['Männer'], height_cm: 171,
    intention: 'Feste Partnerschaft', relationship_model: 'Monogam',
    bindungstyp: 'Ängstlich gebunden', love_language: 'Physical Touch',
    sun_sign: '♒ Wassermann', ascendant: '♌ Löwe', chinese_zodiac: 'Schlange 🐍',
    werte: ['Kunst', 'Abenteuer', 'Kreativität', 'Humor', 'Reisen'],
    photos: [
      p('https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop'),
      p('https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=600&fit=crop'),
      p('https://images.unsplash.com/photo-1499336315816-097655dcfbda?w=400&h=600&fit=crop'),
    ],
    prompts: [
      { question: 'Meine Art die Welt zu sehen in einem Satz', answer: 'Alles ist ein Bild — man muss nur den richtigen Moment abwarten.' },
      { question: 'Das bringt mich sofort zum Lachen', answer: 'Wenn Katzen gegen Glasscheiben laufen. Ich weiß, ich weiß.' },
      { question: 'Was ich gerne zusammen entdecken würde', answer: 'Neue Städte. Lokale Märkte. Restaurants ohne Tripadvisor.' },
    ],
  },
  {
    key: 'thomas', group: 'A',
    email: 'thomas@demo.saja.app',
    name: 'Thomas', age: 47, location: 'Zürich', occupation: 'Unternehmer',
    gender: 'Mann', seeking: ['Frauen'], height_cm: 178,
    intention: 'Feste Partnerschaft', relationship_model: 'Monogam',
    bindungstyp: 'Vermeidend gebunden', love_language: 'Quality Time',
    sun_sign: '♈ Widder', ascendant: '♐ Schütze', chinese_zodiac: 'Pferd 🐴',
    werte: ['Wachstum', 'Freiheit', 'Verlässlichkeit', 'Natur', 'Humor'],
    photos: [
      p('https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=600&fit=crop'),
      p('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=600&fit=crop'),
      p('https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=400&h=600&fit=crop'),
    ],
    prompts: [
      { question: 'Wo ich früher dachte ich bin so — und jetzt weiß ich anders', answer: 'Dass ich keine Nähe brauche. Ich brauche sie — ich hatte nur Angst davor.' },
      { question: 'Was ich nicht verhandle', answer: 'Ehrlichkeit. Auch wenn sie wehtut.' },
      { question: 'Mein liebstes Ritual', answer: 'Früh aufstehen bevor die Welt wach ist. Kaffee. Stille. Klarheit.' },
    ],
  },
  {
    key: 'julia', group: 'A',
    email: 'julia@demo.saja.app',
    name: 'Julia', age: 42, location: 'München', occupation: 'Ärztin',
    gender: 'Frau', seeking: ['Männer'], height_cm: 165,
    intention: 'Etwas Ernstes aufbauen', relationship_model: 'Offen',
    bindungstyp: 'Sicher gebunden', love_language: 'Words of Affirmation',
    sun_sign: '♋ Krebs', ascendant: '♓ Fische', chinese_zodiac: 'Schwein 🐷',
    werte: ['Familie', 'Achtsamkeit', 'Verlässlichkeit', 'Wachstum', 'Stille'],
    photos: [
      p('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop'),
      p('https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=600&fit=crop'),
      p('https://images.unsplash.com/photo-1490750967868-88df5691cc41?w=400&h=600&fit=crop'),
    ],
    prompts: [
      { question: 'Was brauche ich um wirklich anzukommen', answer: 'Konsistenz. Nicht Perfektion — einfach dass jemand wirklich bleibt.' },
      { question: 'Das möchte ich in 5 Jahren fühlen — nicht haben', answer: 'Getragen. Von jemandem der mich kennt und trotzdem bleibt.' },
      { question: 'Wie ich merke dass jemand wirklich da ist', answer: 'Er fragt nach. Nicht höflichkeitshalber. Sondern weil er wirklich wissen will.' },
    ],
  },

  // ═══════════════════════════════════════
  // GRUPPE B/C — bereits gematcht + Begegnung angefragt
  // ═══════════════════════════════════════
  {
    key: 'anna', group: 'BC',
    email: 'anna@demo.saja.app',
    name: 'Anna', age: 34, location: 'Frankfurt', occupation: 'Coach',
    gender: 'Frau', seeking: ['Männer'], height_cm: 167,
    intention: 'Feste Partnerschaft', relationship_model: 'Monogam',
    bindungstyp: 'Sicher gebunden', love_language: 'Quality Time',
    werte: ['Wachstum', 'Tiefe Gespräche', 'Achtsamkeit', 'Natur', 'Stille'],
    photos: [
      p('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop'),
      p('https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400&h=600&fit=crop'),
    ],
    prompts: [
      { question: 'Was ich in einer Begegnung wirklich suche', answer: 'Ehrlichkeit vor Perfektion. Einen Menschen der sich selbst kennt.' },
      { question: 'Mein liebstes Ritual', answer: 'Sonntagmorgen ohne Wecker. Tee, nicht Kaffee. Stille vor dem Tag.' },
    ],
    connectionMessage: 'Deine Antwort auf den Prompt hat mich wirklich berührt 🌿',
    begegnungRequest: 'Ich würde gerne eine Begegnung mit dir starten — bist du dabei? 🌿',
  },
  {
    key: 'kai', group: 'BC',
    email: 'kai@demo.saja.app',
    name: 'Kai', age: 41, location: 'Berlin', occupation: 'Musiker',
    gender: 'Mann', seeking: ['Frauen'], height_cm: 180,
    intention: 'Etwas Ernstes aufbauen', relationship_model: 'Monogam',
    bindungstyp: 'Sicher gebunden', love_language: 'Physical Touch',
    werte: ['Kreativität', 'Freiheit', 'Tiefe Gespräche', 'Humor', 'Körperlichkeit'],
    photos: [
      p('https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop'),
      p('https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=600&fit=crop'),
    ],
    prompts: [
      { question: 'Das überrascht die meisten Menschen an mir', answer: 'Dass ich in Stille genauso zuhause bin wie auf der Bühne.' },
      { question: 'So fühlt sich echte Nähe für mich an', answer: 'Wenn wir nichts tun müssen — einfach da sind.' },
    ],
    connectionMessage: 'Ich finde es mutig was du über dich geschrieben hast.',
    begegnungRequest: 'Lass uns wirklich ankommen. Ich frage an.',
  },
  {
    key: 'sara', group: 'BC',
    email: 'sara@demo.saja.app',
    name: 'Sara', age: 39, location: 'Köln', occupation: 'Designerin',
    gender: 'Frau', seeking: ['Männer'], height_cm: 169,
    intention: 'Feste Partnerschaft', relationship_model: 'Monogam',
    bindungstyp: 'Ängstlich gebunden', love_language: 'Words of Affirmation',
    werte: ['Kreativität', 'Kunst', 'Tiefe Gespräche', 'Wachstum', 'Abenteuer'],
    photos: [
      p('https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=600&fit=crop'),
      p('https://images.unsplash.com/photo-1542744095-291d1f67b221?w=400&h=600&fit=crop'),
    ],
    prompts: [
      { question: 'Meine Art die Welt zu sehen in einem Satz', answer: 'Form folgt Gefühl — im Design wie im Leben.' },
      { question: 'Dafür brauche ich noch Mut', answer: 'Zu sagen was ich wirklich brauche. Ohne Umweg.' },
    ],
    connectionMessage: null,
    begegnungRequest: 'Ich habe noch nie eine Begegnung angefragt. Aber bei dir fühlt es sich richtig an.',
  },
  {
    key: 'felix', group: 'BC',
    email: 'felix@demo.saja.app',
    name: 'Felix', age: 45, location: 'München', occupation: 'Lehrer',
    gender: 'Mann', seeking: ['Frauen'], height_cm: 176,
    intention: 'Feste Partnerschaft', relationship_model: 'Monogam',
    bindungstyp: 'Vermeidend gebunden', love_language: 'Acts of Service',
    werte: ['Familie', 'Verlässlichkeit', 'Natur', 'Humor', 'Wachstum'],
    photos: [
      p('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop'),
      p('https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&h=600&fit=crop'),
    ],
    prompts: [
      { question: 'Was ich nicht verhandle', answer: 'Dass wir füreinander da sind — auch wenn es unbequem wird.' },
      { question: 'Mein liebstes Ritual', answer: 'Nach dem Unterricht kurz draußen sitzen. Die Stille danach ist das Beste.' },
    ],
    connectionMessage: 'Hey — ich habe selten so ein ehrliches Profil gesehen.',
    begegnungRequest: 'Eine Person. Volle Aufmerksamkeit. Lass es uns versuchen.',
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getOrCreateUser(email) {
  const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  const existing = users.find(u => u.email === email)
  if (existing) {
    console.log(`  ✓ exists: ${email}`)
    return existing.id
  }
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: 'Saja2024!Demo',
    email_confirm: true,
  })
  if (error) throw new Error(`createUser failed for ${email}: ${error.message}`)
  console.log(`  + created: ${email}`)
  // Ensure public.users row exists (trigger should fire, but just in case)
  await supabase.from('users').upsert({ id: data.user.id, email }, { onConflict: 'id' })
  return data.user.id
}

async function findMainUserId(demoEmails) {
  const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  const real = users.find(u => !demoEmails.includes(u.email))
  if (!real) throw new Error('No real user found. Please sign up in the app first.')
  console.log(`\n👤 Main user: ${real.email} (${real.id})\n`)
  return real.id
}

function upsert(table, data, conflict) {
  return supabase.from(table).upsert(data, { onConflict: conflict, ignoreDuplicates: true })
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Saja — Demo Seed Script\n')

  const demoEmails = DEMOS.map(d => d.email)

  // 1. Find real user
  const meId = await findMainUserId(demoEmails)

  // 2. Create demo auth users + profiles
  console.log('👥 Creating demo users & profiles...')
  const ids = {}
  for (const demo of DEMOS) {
    process.stdout.write(`  ${demo.name}... `)
    const uid = await getOrCreateUser(demo.email)
    ids[demo.key] = uid

    const { error } = await supabase.from('profiles').upsert({
      user_id: uid,
      name: demo.name,
      age: demo.age,
      location: demo.location,
      occupation: demo.occupation,
      gender: demo.gender,
      seeking: demo.seeking,
      height_cm: demo.height_cm,
      intention: demo.intention,
      relationship_model: demo.relationship_model,
      bindungstyp: demo.bindungstyp,
      love_language: demo.love_language,
      sun_sign: demo.sun_sign ?? null,
      ascendant: demo.ascendant ?? null,
      chinese_zodiac: demo.chinese_zodiac ?? null,
      werte: demo.werte,
      photos: demo.photos,
      prompts: demo.prompts,
      dealbreakers: [],
      is_complete: true,
      profile_paused: false,
    }, { onConflict: 'user_id' })

    if (error) console.error(`\n  ⚠ profile upsert error for ${demo.name}:`, error.message)
    else process.stdout.write('✓\n')
  }

  // 3. Likes
  console.log('\n❤️  Creating likes...')

  // Group A: demo profile → me (they liked me, I haven't liked them)
  for (const demo of DEMOS.filter(d => d.group === 'A')) {
    const { error } = await upsert('likes',
      { from_user_id: ids[demo.key], to_user_id: meId },
      'from_user_id,to_user_id'
    )
    if (error) console.error(`  ⚠ like ${demo.name}→me:`, error.message)
    else console.log(`  ${demo.name} → me ✓`)
  }

  // Group B/C: mutual likes
  for (const demo of DEMOS.filter(d => d.group === 'BC')) {
    // them → me
    const { error: e1 } = await upsert('likes',
      { from_user_id: ids[demo.key], to_user_id: meId },
      'from_user_id,to_user_id'
    )
    if (e1) console.error(`  ⚠ like ${demo.name}→me:`, e1.message)

    // me → them
    const { error: e2 } = await upsert('likes',
      { from_user_id: meId, to_user_id: ids[demo.key] },
      'from_user_id,to_user_id'
    )
    if (e2) console.error(`  ⚠ like me→${demo.name}:`, e2.message)
    else console.log(`  ${demo.name} ↔ me ✓`)
  }

  // 4. Matches for Group B/C
  console.log('\n🤝 Creating matches...')
  const matchIds = {}
  for (const demo of DEMOS.filter(d => d.group === 'BC')) {
    // Check if match already exists
    const { data: existing } = await supabase.from('matches')
      .select('id')
      .or(`and(user1_id.eq.${meId},user2_id.eq.${ids[demo.key]}),and(user1_id.eq.${ids[demo.key]},user2_id.eq.${meId})`)
      .maybeSingle()

    if (existing) {
      matchIds[demo.key] = existing.id
      console.log(`  ${demo.name}: match exists ✓`)
    } else {
      const { data, error } = await supabase.from('matches').insert({
        user1_id: meId,
        user2_id: ids[demo.key],
        status: 'requested',
      }).select('id').single()

      if (error) { console.error(`  ⚠ match ${demo.name}:`, error.message); continue }
      matchIds[demo.key] = data.id
      console.log(`  ${demo.name}: created ✓`)
    }
  }

  // 5. Connection requests for Group B/C (requested by demo profile)
  console.log('\n🔗 Creating connection requests...')
  const connIds = {}
  for (const demo of DEMOS.filter(d => d.group === 'BC')) {
    if (!matchIds[demo.key]) continue

    // Check if connection already exists
    const { data: existing } = await supabase.from('connections')
      .select('id')
      .eq('match_id', matchIds[demo.key])
      .maybeSingle()

    if (existing) {
      connIds[demo.key] = existing.id
      console.log(`  ${demo.name}: connection exists ✓`)
    } else {
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      const { data, error } = await supabase.from('connections').insert({
        match_id: matchIds[demo.key],
        requested_by: ids[demo.key],
        status: 'requested',
        expires_at: expiresAt,
      }).select('id').single()

      if (error) { console.error(`  ⚠ connection ${demo.name}:`, error.message); continue }
      connIds[demo.key] = data.id
      console.log(`  ${demo.name}: created ✓`)
    }
  }

  // 6. Pre-seed messages in connections (shown after user accepts)
  console.log('\n💬 Seeding connection messages...')
  for (const demo of DEMOS.filter(d => d.group === 'BC' && d.connectionMessage)) {
    if (!connIds[demo.key]) continue

    // Check if message already exists
    const { data: existing } = await supabase.from('messages')
      .select('id')
      .eq('connection_id', connIds[demo.key])
      .limit(1)

    if (existing && existing.length > 0) {
      console.log(`  ${demo.name}: message exists ✓`)
      continue
    }

    const { error } = await supabase.from('messages').insert({
      connection_id: connIds[demo.key],
      sender_id: ids[demo.key],
      content: demo.connectionMessage,
    })

    if (error) console.error(`  ⚠ message ${demo.name}:`, error.message)
    else console.log(`  ${demo.name}: "${demo.connectionMessage.slice(0, 40)}..." ✓`)
  }

  console.log('\n✅ Demo seed complete!\n')
  console.log('📋 Summary:')
  console.log(`  Discover (Group A): ${DEMOS.filter(d => d.group === 'A').map(d => d.name).join(', ')}`)
  console.log(`  Matches + pending Begegnung (Group B/C): ${DEMOS.filter(d => d.group === 'BC').map(d => d.name).join(', ')}`)
  console.log('\n  → Open the app and check Discover, Matches, and Begegnung tabs.')
}

main().catch(err => {
  console.error('❌ Fatal error:', err.message)
  process.exit(1)
})
