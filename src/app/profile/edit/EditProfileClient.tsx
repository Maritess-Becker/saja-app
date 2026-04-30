'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { ChevronLeft, Check, Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Profile } from '@/types'

type PhotoItem = { url: string; path: string; caption?: string }

// ── Konstanten ────────────────────────────────────────────────────────────────

const WERTE_OPTIONS = ['Achtsamkeit', 'Natur', 'Wachstum', 'Kreativität', 'Spiritualität', 'Familie', 'Abenteuer', 'Tiefe Gespräche', 'Körperlichkeit', 'Humor', 'Stille', 'Freiheit', 'Verlässlichkeit', 'Kunst', 'Reisen']
const DEALBREAKER_OPTIONS = ['Kinder gewünscht', 'Keine Kinder gewünscht', 'Rauchen', 'Fernbeziehung', 'Großer Altersunterschied', 'Haustiere', 'Starke Religiosität', 'Vegan/Vegetarisch']
const INTERESTS_OPTIONS = ['Yoga', 'Wandern', 'Kochen', 'Reisen', 'Musik', 'Lesen', 'Meditation', 'Kunst', 'Tanzen', 'Fotografie', 'Sport', 'Natur', 'Kino', 'Theater', 'Podcast', 'Spiritualität', 'Surfen', 'Klettern', 'Radfahren', 'Schwimmen']
const INTENTION_OPTIONS = ['Tiefe Verbindung', 'Feste Partnerschaft', 'Erstmal kennenlernen', 'Freundschaft+', 'Offen für alles']
const RELATIONSHIP_OPTIONS = ['Monogam', 'Ethisch non-monogam', 'Polyamorös', 'Noch offen']
const PROMPT_QUESTIONS = [
  'Mein perfekter Sonntag sieht so aus…',
  'Ich bringe in eine Beziehung mit…',
  'Das schätzen Menschen an mir am meisten…',
  'Worüber ich stundenlang reden kann…',
  'Mein größter Mut war…',
  'Was ich aus einer früheren Beziehung gelernt habe…',
  'Was mich wirklich zum Lachen bringt…',
  'Mein Lieblingsort auf der Welt ist…',
  'In 5 Jahren möchte ich…',
]
const MY_WORLD_CATEGORIES = [
  { label: 'Spiritualität & Bewusstsein', items: ['🧘 Yoga & Meditation', '🌿 Achtsamkeit & Minimalismus', '🔮 Astrologie & Esoterik', '✨ Human Design & Gene Keys', '🌙 Schamanismus & Naturverbundenheit', '☯️ Buddhismus & östliche Philosophie'] },
  { label: 'Körper & Sexualität', items: ['🔥 Tantra & bewusste Körperlichkeit', '💫 Bewusste Sexualität & sex-positiv', '🌸 Sexuelle Heilung & Embodiment', '⚡ BDSM & Kink (bewusst & konsensual)', '💃 Tanz & somatische Praktiken'] },
  { label: 'Beziehungen & Wachstum', items: ['💞 Polyamorie & ethische Non-Monogamie', '🤝 Beziehungsanarchie', '🧠 Psychologie & Trauma-Arbeit', '👁️ Inneres Kind & IFS', '🌱 Persönlichkeitsentwicklung'] },
  { label: 'Gemeinschaft & Werte', items: ['♀️ Female Empowerment & Weiblichkeit', '♂️ Male Empowerment & Männlichkeit', '🌍 Permakultur & Nachhaltigkeit', '🏡 Gemeinschaft & Intentional Living', '🎨 Kreativität & Kunst als Weg'] },
]
const SEXUALITY_CATEGORIES = [
  { label: 'Sensualität & Verbindung', items: ['Sinnliche Berührung & Körpernähe', 'Tantrische Intimität', 'Slow Sex & bewusste Sexualität', 'Emotionale Tiefe vor körperlicher Nähe', 'Sexuelle Heilung & Embodiment'] },
  { label: 'Erkundung & Offenheit', items: ['Sex-Positiv & offen für Neues', 'Polyamorös & mehrere Verbindungen', 'Rollenspiel & Fantasien', 'BDSM & Kink (bewusst & konsensual)', 'Fetische (privat besprechen)'] },
  { label: 'Orientierung & Identität', items: ['Queer', 'Bisexuell', 'Pansexuell', 'Asexuell / Demisexuell', 'Non-Binary / Genderfluid'] },
]

// ── Bindungstyp ───────────────────────────────────────────────────────────────
const BINDUNGS_QUESTIONS = [
  'Wenn mein Partner sich zurückzieht fühle ich mich sofort unsicher.',
  'Ich brauche auch in einer Beziehung viel Zeit für mich allein.',
  'Nähe fällt mir leicht — ich bin gerne emotional nah an meinem Partner.',
  'Ich mache mir oft Sorgen ob mein Partner wirklich bei mir bleiben will.',
  'In Konflikten ziehe ich mich lieber zurück als das Gespräch zu suchen.',
  'Ich fühle mich in engen Beziehungen wohl und geborgen.',
  'Ich brauche häufige Bestätigung von meinem Partner dass alles gut ist.',
  'Zu viel Nähe fühlt sich manchmal beengend an.',
  'Es fällt mir leicht meinem Partner zu vertrauen.',
  'Ich reagiere manchmal sehr emotional auf kleine Konflikte.',
]

function computeBindungstyp(answers: number[]): string {
  if (answers.length < 10) return 'Sicher gebunden'
  const anxious = [answers[0], answers[3], answers[6], answers[9]].reduce((a, b) => a + b, 0) / 4
  const avoidant = [answers[1], answers[4], answers[7]].reduce((a, b) => a + b, 0) / 3
  const secure = [answers[2], answers[5], answers[8]].reduce((a, b) => a + b, 0) / 3
  if (secure >= anxious && secure >= avoidant) return 'Sicher gebunden'
  if (anxious > avoidant) return 'Ängstlich-ambivalent'
  return 'Vermeidend-distanziert'
}

// ── Love Language ─────────────────────────────────────────────────────────────
const LOVE_QUESTIONS: Array<{ a: string; b: string; labelA: string; labelB: string }> = [
  { a: 'Jemandem sagen wie sehr du sie schätzt.', b: 'Jemandem eine Umarmung geben.', labelA: 'Worte', labelB: 'Berührung' },
  { a: 'Gemeinsam Zeit verbringen ohne Ablenkung.', b: 'Für jemanden etwas erledigen der gestresst ist.', labelA: 'Zeit', labelB: 'Hilfe' },
  { a: 'Eine kleine Aufmerksamkeit schenken.', b: 'Sagen wie wichtig jemand für dich ist.', labelA: 'Geschenke', labelB: 'Worte' },
  { a: 'Hand halten beim Spazierengehen.', b: 'Gemeinsam etwas Neues erleben.', labelA: 'Berührung', labelB: 'Zeit' },
  { a: 'Beim Kochen helfen wenn dein Partner müde ist.', b: 'Ein kleines Geschenk mitbringen.', labelA: 'Hilfe', labelB: 'Geschenke' },
  { a: 'Ein aufmunterndes Wort zur richtigen Zeit.', b: 'Einfach zusammen auf dem Sofa sein.', labelA: 'Worte', labelB: 'Zeit' },
  { a: 'Eine Massage geben nach einem langen Tag.', b: 'Etwas übernehmen das dein Partner hasst.', labelA: 'Berührung', labelB: 'Hilfe' },
  { a: 'Ein persönliches Geschenk das zeigt du hast zugehört.', b: 'Sagen was du an jemandem bewunderst.', labelA: 'Geschenke', labelB: 'Worte' },
  { a: 'Einen Abend ganz für euch zwei planen.', b: 'Spontan umarmen oder anfassen.', labelA: 'Zeit', labelB: 'Berührung' },
  { a: 'Kleine Alltagsaufgaben abnehmen.', b: 'Ein Erinnerungsstück schenken.', labelA: 'Hilfe', labelB: 'Geschenke' },
]

function computeLoveLanguage(answers: string[]): { primary: string; secondary: string } {
  const counts: Record<string, number> = { Worte: 0, Berührung: 0, Zeit: 0, Hilfe: 0, Geschenke: 0 }
  answers.forEach(a => { if (counts[a] !== undefined) counts[a]++ })
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  const MAP: Record<string, string> = {
    Worte: 'Worte der Wertschätzung',
    Berührung: 'Körperliche Berührung',
    Zeit: 'Quality Time',
    Hilfe: 'Hilfsbereitschaft',
    Geschenke: 'Geschenke',
  }
  return { primary: MAP[sorted[0][0]], secondary: MAP[sorted[1][0]] }
}

// ── Steps ─────────────────────────────────────────────────────────────────────
const COMMUNITIES = [
  'Bindungstypen',
  'Bewusste Sexualität',
  'Tantric Dating',
  'Beziehungsmodelle',
  'Selbstliebe & Heilung',
  'Spiritualität & Partnerschaft',
]

const STEPS = [
  { key: 'basics',      label: 'Basics',          emoji: '👤' },
  { key: 'photos',      label: 'Fotos',           emoji: '📷' },
  { key: 'bio',         label: 'Über mich',        emoji: '✍️' },
  { key: 'intention',   label: 'Intention',        emoji: '💫' },
  { key: 'werte',       label: 'Werte',            emoji: '🌿' },
  { key: 'dealbreaker', label: 'Dealbreaker',      emoji: '🚫' },
  { key: 'my_world',    label: 'Meine Welt',       emoji: '🌍' },
  { key: 'communities', label: 'Meine Communities', emoji: '🤝' },
  { key: 'sexuality',   label: 'Intimität',        emoji: '🔐' },
  { key: 'interests',   label: 'Interessen',       emoji: '✨' },
  { key: 'personality', label: 'Persönlichkeit',   emoji: '🧠' },
  { key: 'bindung',     label: 'Bindungstest',     emoji: '🔗' },
  { key: 'lovelang',    label: 'Love Language',    emoji: '💝' },
  { key: 'prompts',     label: 'Antworten',        emoji: '💬' },
]

interface Props { profile: Profile; userId: string }

// ── Slider-Komponente ─────────────────────────────────────────────────────────
function Slider({ label1, label2, value, onChange }: { label1: string; label2: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between font-body text-[13px]">
        <span className={cn('transition-colors', value <= 40 ? 'text-[#1A1410] font-medium' : 'text-[#6B6058]')}>{label1}</span>
        <span className={cn('transition-colors', value >= 60 ? 'text-[#1A1410] font-medium' : 'text-[#6B6058]')}>{label2}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ accentColor: '#221080' }}
        className="w-full h-2 rounded-full cursor-pointer"
      />
      <div className="flex justify-center">
        <span className="font-body text-[11px] text-[#6B6058]">
          {value < 40 ? label1 : value > 60 ? label2 : 'Ausgewogen'}
        </span>
      </div>
    </div>
  )
}

// ── Hauptkomponente ───────────────────────────────────────────────────────────
export function EditProfileClient({ profile, userId }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)

  // Basics
  const [occupation, setOccupation] = useState(profile.occupation ?? '')
  const [location, setLocation] = useState(profile.location ?? '')
  const [heightCm, setHeightCm] = useState(profile.height_cm?.toString() ?? '')
  const [hideAge, setHideAge] = useState(profile.hide_age ?? false)
  const [hideLocation, setHideLocation] = useState(profile.hide_location ?? false)

  // Bio / Intention
  const [bio, setBio] = useState(profile.bio ?? '')
  const [intention, setIntention] = useState(profile.intention ?? '')
  const [relationshipModel, setRelationshipModel] = useState(profile.relationship_model ?? '')

  // Werte / Dealbreaker
  const [werte, setWerte] = useState<string[]>(profile.werte ?? [])
  const [dealbreakers, setDealbreakers] = useState<string[]>(profile.dealbreakers ?? [])

  // Meine Welt / Intimität
  const [myWorld, setMyWorld] = useState<string[]>(profile.my_world ?? [])
  const [communities, setCommunities] = useState<string[]>(profile.communities ?? [])
  const [sexualityVisible, setSexualityVisible] = useState(profile.sexuality_visible ?? false)
  const [sexualityInterests, setSexualityInterests] = useState<string[]>(profile.sexuality_interests ?? [])

  // Interessen
  const [interests, setInterests] = useState<string[]>(profile.interests ?? [])

  // Persönlichkeit
  const [introExtro, setIntroExtro] = useState(profile.introvert_extrovert ?? 50)
  const [spontanStruk, setSpontanStruk] = useState(profile.spontan_strukturiert ?? 50)
  const [rationalEmot, setRationalEmot] = useState(profile.rational_emotional ?? 50)

  // Bindungstyp-Test
  const [bindungAnswers, setBindungAnswers] = useState<number[]>(Array(10).fill(0))
  const [bindungStep, setBindungStep] = useState(0) // 0=intro, 1-10=fragen, 11=ergebnis
  const [bindungResult, setBindungResult] = useState(profile.bindungstyp ?? '')

  // Love Language-Test
  const [loveAnswers, setLoveAnswers] = useState<string[]>([])
  const [loveStep, setLoveStep] = useState(0) // 0=intro, 1-10=fragen, 11=ergebnis
  const [lovePrimary, setLovePrimary] = useState(profile.love_language ?? '')
  const [loveSecondary, setLoveSecondary] = useState(profile.love_language_secondary ?? '')

  // Fotos
  const [photos, setPhotos] = useState<PhotoItem[]>(profile.photos ?? [])
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragIndexRef = useRef<number | null>(null)

  // Prompts
  const [prompts, setPrompts] = useState<Array<{ question: string; answer: string }>>(profile.prompts ?? [])

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploadingPhoto(true)
    for (const file of files) {
      if (photos.length >= 6) break
      const ext = file.name.split('.').pop()
      const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('profile-photos').upload(path, file)
      if (error) { toast.error('Foto konnte nicht hochgeladen werden.'); continue }
      const { data: urlData } = supabase.storage.from('profile-photos').getPublicUrl(path)
      setPhotos(prev => [...prev, { url: urlData.publicUrl, path }])
    }
    setUploadingPhoto(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function removePhoto(index: number) {
    const photo = photos[index]
    await supabase.storage.from('profile-photos').remove([photo.path])
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  function handleDragStart(index: number) { dragIndexRef.current = index }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault()
    const from = dragIndexRef.current
    if (from === null || from === index) return
    setPhotos(prev => {
      const next = [...prev]
      const item = next.splice(from, 1)[0]
      next.splice(index, 0, item)
      return next
    })
    dragIndexRef.current = index
  }

  function handleDrop() { dragIndexRef.current = null }

  function updateCaption(index: number, caption: string) {
    setPhotos(prev => prev.map((p, i) => i === index ? { ...p, caption } : p))
  }

  function toggle(list: string[], setList: (v: string[]) => void, item: string, max?: number) {
    if (list.includes(item)) setList(list.filter(x => x !== item))
    else if (!max || list.length < max) setList([...list, item])
  }

  function updatePromptAnswer(q: string, answer: string) {
    setPrompts(prev => {
      const ex = prev.find(p => p.question === q)
      if (ex) return prev.map(p => p.question === q ? { ...p, answer } : p)
      if (answer.trim()) return [...prev, { question: q, answer }]
      return prev
    })
  }

  function handleBindungAnswer(qIndex: number, val: number) {
    const updated = [...bindungAnswers]
    updated[qIndex] = val
    setBindungAnswers(updated)
    setTimeout(() => {
      if (bindungStep < 10) {
        setBindungStep(s => s + 1)
      } else {
        const result = computeBindungstyp(updated)
        setBindungResult(result)
        setBindungStep(11)
      }
    }, 300)
  }

  function handleLoveAnswer(label: string) {
    const updated = [...loveAnswers, label]
    setLoveAnswers(updated)
    setTimeout(() => {
      if (loveStep < 10) {
        setLoveStep(s => s + 1)
      } else {
        const { primary, secondary } = computeLoveLanguage(updated)
        setLovePrimary(primary)
        setLoveSecondary(secondary)
        setLoveStep(11)
      }
    }, 300)
  }

  async function handleSave() {
    setSaving(true)
    const { error } = await supabase.from('profiles').update({
      occupation: occupation || null,
      location: location || null,
      height_cm: heightCm ? parseInt(heightCm) : null,
      hide_age: hideAge,
      hide_location: hideLocation,
      bio: bio || null,
      intention: intention || null,
      relationship_model: relationshipModel || null,
      werte,
      dealbreakers,
      my_world: myWorld,
      communities,
      sexuality_visible: sexualityVisible,
      sexuality_interests: sexualityVisible ? sexualityInterests : [],
      interests,
      photos,
      introvert_extrovert: introExtro,
      spontan_strukturiert: spontanStruk,
      rational_emotional: rationalEmot,
      bindungstyp: bindungResult || profile.bindungstyp || null,
      love_language: lovePrimary || profile.love_language || null,
      love_language_secondary: loveSecondary || profile.love_language_secondary || null,
      prompts: prompts.filter(p => p.answer?.trim()),
    }).eq('user_id', userId)
    setSaving(false)
    if (error) { toast.error('Fehler: ' + error.message); return }
    toast.success('Gespeichert ✓')
    router.push('/profile')
    router.refresh()
  }

  const isLast = step === STEPS.length - 1
  const current = STEPS[step].key

  // Bindungstyp: aktueller Frageindex
  const bqIndex = bindungStep - 1

  return (
    <div className="min-h-screen bg-[#221080]">

      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#221080] border-b border-[rgba(34,16,128,0.08)] px-4 pt-4 pb-3">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => {
                if (current === 'bindung' && bindungStep > 0) { setBindungStep(s => Math.max(0, s - 1)); return }
                if (current === 'lovelang' && loveStep > 0) { setLoveStep(s => Math.max(0, s - 1)); setLoveAnswers(prev => prev.slice(0, -1)); return }
                if (step === 0) router.back()
                else { setStep(s => s - 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }
              }}
              className="w-9 h-9 rounded-full bg-[rgba(34,16,128,0.07)] flex items-center justify-center hover:bg-[#EDE8E0] transition-colors flex-shrink-0"
            >
              <ChevronLeft className="w-5 h-5 text-[#1A1410]" />
            </button>
            <div className="flex-1">
              <p className="font-body text-[11px] uppercase tracking-widest text-[#6B6058]">
                Schritt {step + 1} von {STEPS.length}
              </p>
              <p className="font-body text-[14px] font-medium text-[#1A1410]">
                {STEPS[step].emoji} {STEPS[step].label}
              </p>
            </div>
          </div>
          <div className="h-1 bg-[#EDE8E0] rounded-full overflow-hidden">
            <div className="h-full bg-[#221080] rounded-full transition-all duration-300" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-5 pt-7 pb-36">

        {/* ── BASICS ── */}
        {current === 'basics' && (
          <div className="space-y-5">
            <h2 className="font-heading text-[28px] font-light text-[#1A1410]">Deine Basics</h2>
            <div>
              <label className="font-body text-[11px] uppercase tracking-widest text-[#6B6058] block mb-2">Beruf / Tätigkeit</label>
              <input value={occupation} onChange={e => setOccupation(e.target.value)} placeholder="z.B. Designer, Coach, Lehrerin…"
                className="w-full bg-white border border-[rgba(34,16,128,0.12)] rounded-xl px-4 py-3 font-body text-[14px] text-[#1A1410] placeholder-[#6B6058] focus:outline-none focus:border-[#221080]/60" />
            </div>
            <div>
              <label className="font-body text-[11px] uppercase tracking-widest text-[#6B6058] block mb-2">Wohnort</label>
              <input value={location} onChange={e => setLocation(e.target.value)} placeholder="z.B. Berlin, München…"
                className="w-full bg-white border border-[rgba(34,16,128,0.12)] rounded-xl px-4 py-3 font-body text-[14px] text-[#1A1410] placeholder-[#6B6058] focus:outline-none focus:border-[#221080]/60" />
            </div>
            <div>
              <label className="font-body text-[11px] uppercase tracking-widest text-[#6B6058] block mb-2">Größe (cm)</label>
              <input type="number" value={heightCm} onChange={e => setHeightCm(e.target.value)} placeholder="z.B. 170" min={140} max={220}
                className="w-full bg-white border border-[rgba(34,16,128,0.12)] rounded-xl px-4 py-3 font-body text-[14px] text-[#1A1410] placeholder-[#6B6058] focus:outline-none focus:border-[#221080]/60" />
            </div>
            <div className="space-y-3">
              <label className="font-body text-[11px] uppercase tracking-widest text-[#6B6058] block">Privatsphäre</label>
              {[{ label: 'Alter verbergen', value: hideAge, set: setHideAge }, { label: 'Wohnort verbergen', value: hideLocation, set: setHideLocation }].map(({ label, value, set }) => (
                <div key={label} className="flex items-center justify-between bg-white border border-[rgba(34,16,128,0.12)] rounded-xl px-4 py-3">
                  <span className="font-body text-[14px] text-[#1A1410]">{label}</span>
                  <button onClick={() => set(!value)} className={cn('w-11 h-6 rounded-full transition-colors relative', value ? 'bg-[#221080]' : 'bg-[#EDE8E0]')}>
                    <div className={cn('absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform', value ? 'translate-x-[22px]' : 'translate-x-0.5')} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── FOTOS ── */}
        {current === 'photos' && (
          <div className="space-y-5">
            <h2 className="font-heading text-[28px] font-light text-[#1A1410]">Deine Fotos</h2>
            <p className="font-body text-[13px] text-[#6B6058]">Bis zu 6 Fotos. Halte ein Foto gedrückt um es zu verschieben. Tippe auf das Textfeld für eine Bildunterschrift.</p>

            {/* Foto-Grid */}
            <div className="grid grid-cols-2 gap-3">
              {photos.map((photo, i) => (
                <div
                  key={photo.path}
                  draggable
                  onDragStart={() => handleDragStart(i)}
                  onDragOver={e => handleDragOver(e, i)}
                  onDrop={handleDrop}
                  className="relative"
                >
                  {/* Foto */}
                  <div className="relative rounded-2xl overflow-hidden bg-[rgba(34,16,128,0.07)]" style={{ aspectRatio: '3/4' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.url} alt="" className="w-full h-full object-cover" />
                    {i === 0 && (
                      <div className="absolute top-2 left-2 bg-[#221080] text-white text-[10px] font-body px-2 py-0.5 rounded-full">
                        Hauptfoto
                      </div>
                    )}
                    <button
                      onClick={() => removePhoto(i)}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                    {/* Drag-Handle */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-0.5 opacity-60">
                      {[0,1,2].map(d => <div key={d} className="w-1 h-1 bg-white rounded-full" />)}
                    </div>
                  </div>
                  {/* Bildunterschrift — nicht beim Hauptfoto */}
                  {i > 0 && (
                    <input
                      value={photo.caption ?? ''}
                      onChange={e => updateCaption(i, e.target.value)}
                      placeholder="Bildunterschrift…"
                      maxLength={100}
                      className="mt-2 w-full bg-white border border-[rgba(34,16,128,0.12)] rounded-xl px-3 py-2 font-body text-[12px] text-[#1A1410] placeholder-[#6B6058] focus:outline-none focus:border-[#221080]/60"
                    />
                  )}
                </div>
              ))}

              {/* Upload-Button */}
              {photos.length < 6 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="rounded-2xl border-2 border-dashed border-[rgba(34,16,128,0.12)] bg-[#221080] flex flex-col items-center justify-center gap-2 hover:border-[#221080]/40 hover:bg-[#221080]/5 transition-all disabled:opacity-50"
                  style={{ aspectRatio: '3/4' }}
                >
                  {uploadingPhoto ? (
                    <div className="w-6 h-6 border-2 border-[#221080] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-7 h-7 text-[#6B6058]" />
                      <span className="font-body text-[12px] text-[#6B6058]">Foto hinzufügen</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
            />

            {photos.length === 0 && (
              <p className="font-body text-[13px] text-[#6B6058] text-center py-4">
                Mindestens 1 Foto für ein vollständiges Profil.
              </p>
            )}
          </div>
        )}

        {/* ── BIO ── */}
        {current === 'bio' && (
          <div className="space-y-4">
            <h2 className="font-heading text-[28px] font-light text-[#1A1410]">Über dich</h2>
            <p className="font-body text-[13px] text-[#6B6058]">Was sollen andere über dich wissen?</p>
            <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Erzähl etwas über dich, dein Leben, was dich bewegt…" rows={7} maxLength={500}
              className="w-full bg-white border border-[rgba(34,16,128,0.12)] rounded-xl px-4 py-3 font-body text-[14px] text-[#1A1410] placeholder-[#6B6058] resize-none focus:outline-none focus:border-[#221080]/60 leading-relaxed" />
            <p className="font-body text-[12px] text-[#6B6058] text-right">{bio.length}/500</p>
          </div>
        )}

        {/* ── INTENTION ── */}
        {current === 'intention' && (
          <div className="space-y-6">
            <h2 className="font-heading text-[28px] font-light text-[#1A1410]">Was suchst du?</h2>
            <div>
              <p className="font-body text-[11px] uppercase tracking-widest text-[#6B6058] mb-3">Intention</p>
              <div className="flex flex-wrap gap-2">
                {INTENTION_OPTIONS.map(opt => (
                  <button key={opt} onClick={() => setIntention(opt)}
                    className={cn('px-4 py-2.5 rounded-full border transition-all font-body text-[14px]', intention === opt ? 'bg-[#221080] border-[#221080] text-white' : 'bg-white border-[rgba(34,16,128,0.12)] text-[#1A1410] hover:border-[#221080]/40')}
                  >{opt}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="font-body text-[11px] uppercase tracking-widest text-[#6B6058] mb-3">Beziehungsmodell</p>
              <div className="flex flex-wrap gap-2">
                {RELATIONSHIP_OPTIONS.map(opt => (
                  <button key={opt} onClick={() => setRelationshipModel(opt)}
                    className={cn('px-4 py-2.5 rounded-full border transition-all font-body text-[14px]', relationshipModel === opt ? 'bg-[#221080] border-[#221080] text-white' : 'bg-white border-[rgba(34,16,128,0.12)] text-[#1A1410] hover:border-[#221080]/40')}
                  >{opt}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── WERTE ── */}
        {current === 'werte' && (
          <div className="space-y-4">
            <h2 className="font-heading text-[28px] font-light text-[#1A1410]">Was trägt dich?</h2>
            <p className="font-body text-[13px] text-[#6B6058]">Wähle bis zu 5 Werte.</p>
            <div className="flex flex-wrap gap-2">
              {WERTE_OPTIONS.map(opt => (
                <button key={opt} onClick={() => toggle(werte, setWerte, opt, 5)} disabled={!werte.includes(opt) && werte.length >= 5}
                  className={cn('px-4 py-2 rounded-full border transition-all font-body text-[14px]',
                    werte.includes(opt) ? 'bg-[#221080] border-[#221080] text-white' : 'bg-white border-[rgba(34,16,128,0.12)] text-[#1A1410] hover:border-[#221080]/40',
                    !werte.includes(opt) && werte.length >= 5 && 'opacity-30 cursor-not-allowed')}
                >{opt}</button>
              ))}
            </div>
            <p className="font-body text-[12px] text-[#6B6058]">{werte.length}/5</p>
          </div>
        )}

        {/* ── DEALBREAKER ── */}
        {current === 'dealbreaker' && (
          <div className="space-y-4">
            <h2 className="font-heading text-[28px] font-light text-[#1A1410]">Was geht wirklich nicht?</h2>
            <p className="font-body text-[13px] text-[#6B6058]">Bis zu 3 Dealbreaker.</p>
            <div className="flex flex-wrap gap-2">
              {DEALBREAKER_OPTIONS.map(opt => (
                <button key={opt} onClick={() => toggle(dealbreakers, setDealbreakers, opt, 3)} disabled={!dealbreakers.includes(opt) && dealbreakers.length >= 3}
                  className={cn('px-4 py-2 rounded-full border transition-all font-body text-[14px]',
                    dealbreakers.includes(opt) ? 'bg-[#221080] border-[#221080] text-white' : 'bg-white border-[rgba(34,16,128,0.12)] text-[#1A1410] hover:border-[#221080]/40',
                    !dealbreakers.includes(opt) && dealbreakers.length >= 3 && 'opacity-30 cursor-not-allowed')}
                >{opt}</button>
              ))}
            </div>
            <p className="font-body text-[12px] text-[#6B6058]">{dealbreakers.length}/3</p>
          </div>
        )}

        {/* ── MEINE WELT ── */}
        {current === 'my_world' && (
          <div className="space-y-5">
            <h2 className="font-heading text-[28px] font-light text-[#1A1410]">Wo fühlst du dich zuhause?</h2>
            <p className="font-body text-[13px] text-[#6B6058]">Wähle deine Szenen — oder lass es offen.</p>
            {MY_WORLD_CATEGORIES.map(cat => (
              <div key={cat.label}>
                <p className="font-body text-[11px] uppercase tracking-widest text-[#6B6058] mb-2">{cat.label}</p>
                <div className="flex flex-wrap gap-2">
                  {cat.items.map(item => (
                    <button key={item} onClick={() => toggle(myWorld, setMyWorld, item)}
                      className={cn('px-3 py-2 rounded-full border transition-all font-body text-[12px]',
                        myWorld.includes(item) ? 'bg-[#221080] border-[#221080] text-white' : 'bg-white border-[rgba(34,16,128,0.12)] text-[#1A1410] hover:border-[#221080]/40')}
                    >{item}</button>
                  ))}
                </div>
              </div>
            ))}
            {myWorld.length > 0 && <p className="font-body text-[12px] text-[#1A1410]">{myWorld.length} Szene{myWorld.length > 1 ? 'n' : ''} gewählt</p>}
          </div>
        )}

        {/* ── COMMUNITIES ── */}
        {current === 'communities' && (
          <div className="space-y-5">
            <h2 className="font-heading text-[28px] font-light text-[#1A1410]">Meine Communities</h2>
            <p className="font-body text-[13px] text-[#6B6058] leading-relaxed">
              Welchen Gruppen gehörst du an? Diese werden als Badge auf deinem Profil angezeigt und können als Filter im Entdecken verwendet werden.
            </p>
            <div className="space-y-3">
              {COMMUNITIES.map(c => (
                <button
                  key={c}
                  onClick={() => toggle(communities, setCommunities, c)}
                  className={cn(
                    'w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all font-body text-[14px] flex items-center justify-between',
                    communities.includes(c)
                      ? 'border-[#221080] bg-[#221080]/5 text-[#1A1410]'
                      : 'border-[rgba(34,16,128,0.12)] bg-white text-[#1A1410] hover:border-[#221080]/40'
                  )}
                >
                  <span>{c}</span>
                  {communities.includes(c) && <Check className="w-4 h-4 flex-shrink-0" />}
                </button>
              ))}
            </div>
            {communities.length > 0 && (
              <p className="font-body text-[12px] text-[#1A1410]">{communities.length} Community{communities.length > 1 ? 's' : ''} gewählt</p>
            )}
          </div>
        )}

        {/* ── INTIMITÄT ── */}
        {current === 'sexuality' && (
          <div className="space-y-5">
            <h2 className="font-heading text-[28px] font-light text-[#1A1410]">Was du zeigst siehst du auch.</h2>
            <p className="font-body text-[13px] text-[#6B6058] leading-relaxed">Freiwillig und nach dem Gegenseitigkeitsprinzip — du siehst die Interessen anderer nur wenn du deine eigenen teilst.</p>
            <div className="bg-white rounded-xl border border-[rgba(34,16,128,0.12)] p-4 flex items-center justify-between">
              <div>
                <p className="font-body text-[14px] text-[#1A1410] font-medium">Interessen teilen</p>
                <p className="font-body text-[12px] text-[#6B6058]">Sichtbar für andere die auch geteilt haben</p>
              </div>
              <button onClick={() => setSexualityVisible(v => !v)} className={cn('w-12 h-6 rounded-full transition-colors relative flex-shrink-0', sexualityVisible ? 'bg-[#221080]' : 'bg-[#EDE8E0]')}>
                <div className={cn('absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform', sexualityVisible ? 'translate-x-6' : 'translate-x-0.5')} />
              </button>
            </div>
            {sexualityVisible && (
              <div className="space-y-5">
                {SEXUALITY_CATEGORIES.map(cat => (
                  <div key={cat.label}>
                    <p className="font-body text-[11px] uppercase tracking-widest text-[#6B6058] mb-2">{cat.label}</p>
                    <div className="flex flex-wrap gap-2">
                      {cat.items.map(item => (
                        <button key={item} onClick={() => toggle(sexualityInterests, setSexualityInterests, item)}
                          className={cn('px-3 py-2 rounded-full border transition-all font-body text-[12px]',
                            sexualityInterests.includes(item) ? 'bg-[#221080] border-[#221080] text-white' : 'bg-white border-[rgba(34,16,128,0.12)] text-[#1A1410] hover:border-[#221080]/40')}
                        >{item}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── INTERESSEN ── */}
        {current === 'interests' && (
          <div className="space-y-4">
            <h2 className="font-heading text-[28px] font-light text-[#1A1410]">Deine Interessen</h2>
            <div className="flex flex-wrap gap-2">
              {INTERESTS_OPTIONS.map(opt => (
                <button key={opt} onClick={() => toggle(interests, setInterests, opt)}
                  className={cn('px-3 py-2 rounded-full border transition-all font-body text-[13px]',
                    interests.includes(opt) ? 'bg-[#221080] border-[#221080] text-white' : 'bg-white border-[rgba(34,16,128,0.12)] text-[#1A1410] hover:border-[#221080]/40')}
                >{opt}</button>
              ))}
            </div>
          </div>
        )}

        {/* ── PERSÖNLICHKEIT ── */}
        {current === 'personality' && (
          <div className="space-y-8">
            <h2 className="font-heading text-[28px] font-light text-[#1A1410]">Deine Persönlichkeit</h2>
            <p className="font-body text-[13px] text-[#6B6058]">Verschiebe die Regler.</p>
            <Slider label1="Introvertiert" label2="Extrovertiert" value={introExtro} onChange={setIntroExtro} />
            <Slider label1="Spontan" label2="Strukturiert" value={spontanStruk} onChange={setSpontanStruk} />
            <Slider label1="Rational" label2="Emotional" value={rationalEmot} onChange={setRationalEmot} />
          </div>
        )}

        {/* ── BINDUNGSTYP-TEST ── */}
        {current === 'bindung' && (
          <div>
            {/* Intro */}
            {bindungStep === 0 && (
              <div className="space-y-5">
                <h2 className="font-heading text-[28px] font-light text-[#1A1410]">Dein Bindungstyp</h2>
                <p className="font-body text-[14px] text-[#6B6058] leading-relaxed">
                  10 kurze Fragen — beantworte spontan auf einer Skala von 1 (stimme gar nicht zu) bis 5 (stimme völlig zu).
                </p>
                {bindungResult && (
                  <div className="bg-[rgba(34,16,128,0.07)] rounded-xl p-4 border border-[rgba(34,16,128,0.12)]">
                    <p className="font-body text-[12px] text-[#6B6058] mb-1">Dein aktuelles Ergebnis</p>
                    <p className="font-heading text-[18px] text-[#1A1410]">{bindungResult}</p>
                  </div>
                )}
                <button onClick={() => setBindungStep(1)}
                  className="w-full py-4 rounded-full bg-[#221080] text-white font-body text-[16px] font-medium hover:bg-[#120850] active:scale-[0.98] transition-all">
                  Test starten →
                </button>
                <button onClick={() => { setStep(s => s + 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  className="w-full text-center font-body text-sm text-[#6B6058]">Überspringen</button>
              </div>
            )}

            {/* Fragen 1–10 */}
            {bindungStep >= 1 && bindungStep <= 10 && (
              <div className="space-y-6">
                <p className="font-body text-[12px] uppercase tracking-widest text-[#6B6058]">Frage {bindungStep} von 10</p>
                <div className="h-1 bg-[#EDE8E0] rounded-full overflow-hidden mb-6">
                  <div className="h-full bg-[#221080] rounded-full transition-all" style={{ width: `${(bindungStep / 10) * 100}%` }} />
                </div>
                <p className="font-heading text-[22px] font-normal text-[#1A1410] leading-snug">
                  {BINDUNGS_QUESTIONS[bqIndex]}
                </p>
                <div className="flex justify-between gap-2 mt-6">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} onClick={() => handleBindungAnswer(bqIndex, n)}
                      className={cn('flex-1 py-4 rounded-xl border-2 font-body text-[16px] font-medium transition-all',
                        bindungAnswers[bqIndex] === n ? 'border-[#221080] bg-[#221080] text-white' : 'border-[rgba(34,16,128,0.12)] bg-white text-[#6B6058] hover:border-[#221080]/40')}
                    >{n}</button>
                  ))}
                </div>
                <div className="flex justify-between mt-1">
                  <span className="font-body text-[11px] text-[#6B6058]">Stimme gar nicht zu</span>
                  <span className="font-body text-[11px] text-[#6B6058]">Stimme völlig zu</span>
                </div>
              </div>
            )}

            {/* Ergebnis */}
            {bindungStep === 11 && (
              <div className="text-center space-y-6 pt-4">
                <div className="text-5xl">🔗</div>
                <p className="font-body text-[12px] uppercase tracking-widest text-[#1A1410]">Dein Bindungstyp</p>
                <h3 className="font-heading text-[32px] font-light text-[#1A1410]">{bindungResult}</h3>
                <button onClick={() => { setStep(s => s + 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  className="w-full py-4 rounded-full bg-[#221080] text-white font-body text-[16px] font-medium hover:bg-[#120850] active:scale-[0.98] transition-all">
                  Weiter →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── LOVE LANGUAGE-TEST ── */}
        {current === 'lovelang' && (
          <div>
            {/* Intro */}
            {loveStep === 0 && (
              <div className="space-y-5">
                <h2 className="font-heading text-[28px] font-light text-[#1A1410]">Deine Love Language</h2>
                <p className="font-body text-[14px] text-[#6B6058] leading-relaxed">
                  10 Fragen — wähle jeweils das was dir mehr entspricht.
                </p>
                {lovePrimary && (
                  <div className="bg-[rgba(34,16,128,0.07)] rounded-xl p-4 border border-[rgba(34,16,128,0.12)]">
                    <p className="font-body text-[12px] text-[#6B6058] mb-1">Dein aktuelles Ergebnis</p>
                    <p className="font-heading text-[18px] text-[#1A1410]">{lovePrimary}</p>
                  </div>
                )}
                <button onClick={() => setLoveStep(1)}
                  className="w-full py-4 rounded-full bg-[#221080] text-white font-body text-[16px] font-medium hover:bg-[#120850] active:scale-[0.98] transition-all">
                  Test starten →
                </button>
                <button onClick={() => { setStep(s => s + 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  className="w-full text-center font-body text-sm text-[#6B6058]">Überspringen</button>
              </div>
            )}

            {/* Fragen 1–10 */}
            {loveStep >= 1 && loveStep <= 10 && (
              <div className="space-y-6">
                <p className="font-body text-[12px] uppercase tracking-widest text-[#6B6058]">Frage {loveStep} von 10</p>
                <div className="h-1 bg-[#EDE8E0] rounded-full overflow-hidden mb-6">
                  <div className="h-full bg-[#221080] rounded-full transition-all" style={{ width: `${(loveStep / 10) * 100}%` }} />
                </div>
                <p className="font-body text-[12px] uppercase tracking-widest text-[#6B6058] mb-2">Was bedeutet dir mehr?</p>
                <div className="space-y-3">
                  {(['a', 'b'] as const).map(opt => {
                    const q = LOVE_QUESTIONS[loveStep - 1]
                    const text = opt === 'a' ? q.a : q.b
                    const label = opt === 'a' ? q.labelA : q.labelB
                    return (
                      <button key={opt} onClick={() => handleLoveAnswer(label)}
                        className="w-full text-left bg-white border-2 border-[rgba(34,16,128,0.12)] rounded-2xl px-5 py-5 hover:border-[#221080]/60 hover:bg-[#221080] active:scale-[0.98] transition-all">
                        <p className="font-body text-[15px] text-[#1A1410] leading-relaxed">{text}</p>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Ergebnis */}
            {loveStep === 11 && (
              <div className="text-center space-y-6 pt-4">
                <div className="text-5xl">💝</div>
                <p className="font-body text-[12px] uppercase tracking-widest text-[#1A1410]">Deine Love Language</p>
                <h3 className="font-heading text-[32px] font-light text-[#1A1410]">{lovePrimary}</h3>
                {loveSecondary && <p className="font-body text-[14px] text-[#6B6058]">Zweit-Sprache: {loveSecondary}</p>}
                <button onClick={() => { setStep(s => s + 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  className="w-full py-4 rounded-full bg-[#221080] text-white font-body text-[16px] font-medium hover:bg-[#120850] active:scale-[0.98] transition-all">
                  Weiter →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── PROMPTS ── */}
        {current === 'prompts' && (
          <div className="space-y-4">
            <h2 className="font-heading text-[28px] font-light text-[#1A1410]">Deine Antworten</h2>
            <p className="font-body text-[13px] text-[#6B6058]">Bis zu 3 Fragen beantworten.</p>
            {PROMPT_QUESTIONS.map(q => {
              const ex = prompts.find(p => p.question === q)
              const canAdd = !ex && prompts.filter(p => p.answer?.trim()).length < 3
              return (
                <div key={q} className="border border-[rgba(34,16,128,0.12)] rounded-xl overflow-hidden bg-white">
                  <div className="px-4 py-3 bg-[#221080] flex items-center justify-between gap-3">
                    <p className="font-body text-[13px] text-[#1A1410] flex-1">{q}</p>
                    {ex ? (
                      <button onClick={() => setPrompts(prev => prev.filter(p => p.question !== q))} className="text-[11px] text-red-400 flex-shrink-0">Entfernen</button>
                    ) : canAdd ? (
                      <button onClick={() => setPrompts(prev => [...prev, { question: q, answer: '' }])} className="text-[11px] text-[#1A1410] flex-shrink-0">+ Hinzufügen</button>
                    ) : null}
                  </div>
                  {ex && (
                    <textarea value={ex.answer} onChange={e => updatePromptAnswer(q, e.target.value)} placeholder="Deine Antwort…" rows={3} maxLength={300}
                      className="w-full px-4 py-3 font-heading text-[15px] italic text-[#120850] placeholder-[#6B6058] resize-none focus:outline-none" />
                  )}
                </div>
              )
            })}
          </div>
        )}

      </div>

      {/* Sticky Footer */}
      {/* Beim Bindungstest/Love Language während der Fragen keinen Weiter-Button zeigen */}
      {!((current === 'bindung' && bindungStep >= 1 && bindungStep <= 10) || (current === 'lovelang' && loveStep >= 1 && loveStep <= 10)) && (
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-[#221080]/95 backdrop-blur-sm border-t border-[rgba(34,16,128,0.08)] px-4 py-3 md:pl-64">
          <div className="max-w-lg mx-auto">
            {/* Beim Bindungstest-/Love Language-Intro oder Ergebnis keinen doppelten Button anzeigen */}
            {(current !== 'bindung' && current !== 'lovelang') && (
              isLast ? (
                <button onClick={handleSave} disabled={saving}
                  className="w-full py-3.5 rounded-full bg-[#221080] text-white font-body text-[15px] font-medium hover:bg-[#120850] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" />
                  {saving ? 'Speichern…' : 'Speichern & Fertig'}
                </button>
              ) : (
                <button onClick={() => { setStep(s => s + 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  className="w-full py-3.5 rounded-full bg-[#221080] text-white font-body text-[15px] font-medium hover:bg-[#120850] active:scale-[0.98] transition-all">
                  Weiter →
                </button>
              )
            )}
            {/* Letzter Schritt (Prompts) immer speichern */}
            {isLast && (current === 'bindung' || current === 'lovelang') && (
              <button onClick={handleSave} disabled={saving}
                className="w-full py-3.5 rounded-full bg-[#221080] text-white font-body text-[15px] font-medium hover:bg-[#120850] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                {saving ? 'Speichern…' : 'Speichern & Fertig'}
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
