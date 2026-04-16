'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { SajaLogo } from '@/components/ui/SajaLogo'
import toast from 'react-hot-toast'

const TOTAL_STEPS = 10

// ── Attachment types ────────────────────────────────────────────────
type PhotoItem = { url: string; path: string }

// ── Bindungstyp test data ───────────────────────────────────────────
const BINDUNGSTYP_QUESTIONS = [
  {
    question: 'Wenn ich jemandem nahestehe, fühle ich mich meist…',
    answers: [
      { text: 'Wohl und sicher', key: 'S' },
      { text: 'Ständig besorgt, es könnte sich ändern', key: 'A' },
      { text: 'Eher etwas eingeengt', key: 'V' },
      { text: 'Mal sehr wohl, mal sehr unwohl — unberechenbar', key: 'D' },
    ],
  },
  {
    question: 'Wenn jemand Wichtiges sich zurückzieht…',
    answers: [
      { text: 'Spreche ich es ruhig an', key: 'S' },
      { text: 'Mache mir sofort große Sorgen', key: 'A' },
      { text: 'Gebe ihm Raum und ziehe mich ebenfalls zurück', key: 'V' },
      { text: 'Reagiere ich mal so, mal ganz anders', key: 'D' },
    ],
  },
  {
    question: 'Vertrauen in engen Beziehungen…',
    answers: [
      { text: 'Fällt mir meistens leicht', key: 'S' },
      { text: 'Wünsche ich mir, aber es fällt mir wirklich schwer', key: 'A' },
      { text: 'Baue ich sehr langsam und bewusst auf', key: 'V' },
      { text: 'Ist für mich ein ständiges inneres Tauziehen', key: 'D' },
    ],
  },
  {
    question: 'Bei Konflikten in engen Beziehungen…',
    answers: [
      { text: 'Suche ich das offene Gespräch', key: 'S' },
      { text: 'Brauche ich viel Bestätigung danach', key: 'A' },
      { text: 'Ziehe ich mich erstmal ganz zurück', key: 'V' },
      { text: 'Reagiere ich sehr unvorhersehbar, auch für mich selbst', key: 'D' },
    ],
  },
  {
    question: 'Nähe und Intimität fühlen sich für mich an wie…',
    answers: [
      { text: 'Etwas Natürliches und Bereicherndes', key: 'S' },
      { text: 'Etwas das ich sehr suche, aber auch fürchte', key: 'A' },
      { text: 'Schön in Maßen — ich brauche viel eigenen Raum', key: 'V' },
      { text: 'Etwas das mich anzieht und gleichzeitig verunsichert', key: 'D' },
    ],
  },
]

const BINDUNGSTYP_MAP: Record<string, string> = {
  S: 'Sicher gebunden',
  A: 'Ängstlich gebunden',
  V: 'Vermeidend gebunden',
  D: 'Desorganisiert gebunden',
}

const BINDUNGSTYP_DESC: Record<string, string> = {
  S: 'Du gehst offen und vertrauensvoll in Beziehungen. Nähe fühlt sich für dich natürlich an und du kannst gut kommunizieren, was du brauchst.',
  A: 'Du sehnst dich nach tiefer Verbindung, bist aber oft besorgt, ob sie erwidert wird. Du bist sehr feinfühlig für Veränderungen in der Beziehung.',
  V: 'Du schätzt Unabhängigkeit und hältst gerne Abstand. Nähe kann sich manchmal einengend anfühlen, auch wenn du sie dir wünschst.',
  D: 'Du erlebst Nähe als gleichzeitig anziehend und beängstigend. Deine Reaktionen überraschen manchmal sogar dich selbst.',
}

// ── Love Language test data ─────────────────────────────────────────
const LOVELANG_QUESTIONS = [
  {
    question: 'Was berührt mich am meisten in einer Beziehung?',
    answers: [
      { text: 'Wenn jemand mir sagt, was er an mir schätzt', key: 'WA' },
      { text: 'Wenn wir Zeit zusammen verbringen, ganz ohne Ablenkung', key: 'QT' },
      { text: 'Wenn jemand für mich etwas erledigt, ohne dass ich bitten muss', key: 'AS' },
      { text: 'Eine Umarmung im richtigen Moment', key: 'PT' },
      { text: 'Eine kleine, durchdachte Überraschung', key: 'RG' },
    ],
  },
  {
    question: 'Ich fühle mich am meisten geliebt, wenn…',
    answers: [
      { text: 'Mein Partner mir schreibt, wie sehr er mich schätzt', key: 'WA' },
      { text: 'Wir etwas zusammen erleben — auch Alltägliches', key: 'QT' },
      { text: 'Jemand mir tatkräftig unter die Arme greift', key: 'AS' },
      { text: 'Wir körperliche Nähe teilen', key: 'PT' },
      { text: 'Ich ein Geschenk bekomme, das zeigt: Du dachtest an mich', key: 'RG' },
    ],
  },
  {
    question: 'Was vermisse ich in einer Beziehung am schnellsten?',
    answers: [
      { text: 'Ehrliche, wertschätzende Worte', key: 'WA' },
      { text: 'Ungeteilte gemeinsame Zeit', key: 'QT' },
      { text: 'Jemanden, der tatkräftig für mich da ist', key: 'AS' },
      { text: 'Körperliche Wärme und Nähe', key: 'PT' },
      { text: 'Kleine Zeichen der Aufmerksamkeit', key: 'RG' },
    ],
  },
  {
    question: 'Ein schöner Moment wäre für mich…',
    answers: [
      { text: 'Ein Brief oder eine Nachricht, die von Herzen kommt', key: 'WA' },
      { text: 'Ein Abend, ganz präsent und verbunden', key: 'QT' },
      { text: 'Wenn jemand merkt was ich brauche und es einfach macht', key: 'AS' },
      { text: 'Eng zusammen auf dem Sofa liegen', key: 'PT' },
      { text: 'Ein kleines Geschenk: „Ich hab an dich gedacht"', key: 'RG' },
    ],
  },
  {
    question: 'Wenn ich meine Zuneigung zeige, tue ich das durch…',
    answers: [
      { text: 'Worte — ich sage was ich fühle', key: 'WA' },
      { text: 'Gemeinsame Erlebnisse schaffen', key: 'QT' },
      { text: 'Für jemanden da sein und Dinge erledigen', key: 'AS' },
      { text: 'Körperliche Gesten wie Umarmungen', key: 'PT' },
      { text: 'Durchdachte kleine Geschenke', key: 'RG' },
    ],
  },
]

const LOVELANG_MAP: Record<string, string> = {
  WA: 'Words of Affirmation',
  QT: 'Quality Time',
  AS: 'Acts of Service',
  PT: 'Physical Touch',
  RG: 'Receiving Gifts',
}

// ── Werte options ───────────────────────────────────────────────────
const WERTE_OPTIONS = [
  'Achtsamkeit', 'Natur', 'Wachstum', 'Kreativität', 'Spiritualität',
  'Familie', 'Abenteuer', 'Tiefe Gespräche', 'Körperlichkeit', 'Humor',
  'Stille', 'Freiheit', 'Verlässlichkeit', 'Kunst', 'Reisen',
]

// ── Dealbreaker options ─────────────────────────────────────────────
const DEALBREAKER_OPTIONS = [
  'Kinder', 'Rauchen', 'Fernbeziehung', 'Großer Altersunterschied',
  'Haustiere', 'Religion', 'Alkohol', 'Keine Kinder gewünscht',
]

// ── Prompt catalog ──────────────────────────────────────────────────
const PROMPT_CATALOG = {
  'VERBINDUNG': [
    'Was ich brauche, um wirklich anzukommen',
    'Eine Verbindung, die mein Leben verändert hat',
    'So fühlt sich echte Nähe für mich an',
    'Was ich in einer Begegnung wirklich suche',
    'Ich öffne mich, wenn …',
    'Das Schönste an einer tiefen Verbindung ist für mich',
    'Wie ich merke, dass jemand wirklich da ist',
  ],
  'WERTE & LEBEN': [
    'Wofür ich aufstehe, wenn es schwer wird',
    'Das hat mein Leben von Grund auf verändert',
    'Meine Art, die Welt zu sehen, in einem Satz',
    'Was ich nicht verhandle',
    'Wie ich lebe, wenn ich ganz ich selbst bin',
    'Was mich täglich trägt',
    'Das möchte ich in 5 Jahren fühlen — nicht haben',
  ],
  'SELBSTREFLEXION': [
    'Was ich gerade über mich lerne',
    'Mein Bindungstyp — und was das über mich sagt',
    'Wo ich früher dachte ich bin so — und jetzt weiß ich anders',
    'Was ich in meiner letzten Beziehung über mich gelernt habe',
    'Meine größte Herausforderung in der Liebe war',
    'Dafür brauche ich noch Mut',
    'Was ich mir selbst gerade beweise',
  ],
  'LEICHT & OFFEN': [
    'Das bringt mich sofort zum Lachen',
    'Mein perfekter Sonntag — ehrlich',
    'Das überrascht die meisten Menschen an mir',
    'Drei Dinge, die mir jeden Tag Freude machen',
    'Worüber ich stundenlang reden könnte',
    'Mein liebstes Ritual',
    'Was ich gerne zusammen entdecken würde',
  ],
  'KÖRPER & PRÄSENZ': [
    'Wie ich in meinem Körper ankomme',
    'Was mir hilft, präsent zu sein, wenn es laut wird',
    'Berührt werde ich durch …',
    'So tanke ich wirklich auf',
  ],
}

// ── Helpers ─────────────────────────────────────────────────────────
function computeTopKey(answers: string[]): string {
  const counts: Record<string, number> = {}
  for (const a of answers) counts[a] = (counts[a] ?? 0) + 1
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? answers[0]
}

// ────────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // Step 1 – Basics
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [gender, setGender] = useState('')
  const [seeking, setSeeking] = useState<string[]>([])
  const [location, setLocation] = useState('')

  // Step 2 – Photos
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragIndexRef = useRef<number | null>(null)

  // Step 3 – Lebenssituation
  const [occupation, setOccupation] = useState('')
  const [heightCm, setHeightCm] = useState(170)
  const [hasChildren, setHasChildren] = useState('')
  const [smoking, setSmoking] = useState('')
  const [alcohol, setAlcohol] = useState('')

  // Step 4 – Was suchst du
  const [intention, setIntention] = useState('')
  const [relationshipModel, setRelationshipModel] = useState('')

  // Step 5 – Bindungstyp
  const [bindungsAntworten, setBindungsAntworten] = useState<string[]>([])
  const [bindungsSubQ, setBindungsSubQ] = useState(0)
  const [bindungsResult, setBindungsResult] = useState('')
  const [bindungsShowResult, setBindungsShowResult] = useState(false)

  // Step 6 – Love Language
  const [loveAntworten, setLoveAntworten] = useState<string[]>([])
  const [loveSubQ, setLoveSubQ] = useState(0)
  const [loveResult, setLoveResult] = useState('')
  const [loveShowResult, setLoveShowResult] = useState(false)

  // Step 7 – Werte
  const [werte, setWerte] = useState<string[]>([])

  // Step 8 – Dealbreaker
  const [dealbreakers, setDealbreakers] = useState<string[]>([])
  const [dealbreakerInput, setDealbreakerInput] = useState('')

  // Step 9 – Prompts
  const [promptPhase, setPromptPhase] = useState<'select' | 'answer'>('select')
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([])
  const [promptAnswers, setPromptAnswers] = useState<Record<string, string>>({})

  // Step 10 – Audio
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState('')
  const [audioPromptUrl, setAudioPromptUrl] = useState('')
  const [recordingSeconds, setRecordingSeconds] = useState(30)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<BlobPart[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Load existing profile ───────────────────────────────────────
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        if (data.name) setName(data.name)
        if (data.birth_date) setBirthDate(data.birth_date)
        if (data.gender) setGender(data.gender)
        if (data.seeking) setSeeking(data.seeking)
        if (data.location) setLocation(data.location)
        if (data.photos) {
          // Handle both old TEXT[] (strings) and new JSONB ({url,path} objects)
          const rawPhotos = data.photos as any[]
          setPhotos(rawPhotos.map((p: any) =>
            typeof p === 'string'
              ? { url: p, path: p.split('/profile-photos/')[1] ?? p }
              : p,
          ))
        }
        if (data.occupation) setOccupation(data.occupation)
        if (data.height_cm) setHeightCm(data.height_cm)
        if (data.has_children) setHasChildren(data.has_children)
        if (data.smoking) setSmoking(data.smoking)
        if (data.alcohol) setAlcohol(data.alcohol)
        if (data.intention) setIntention(data.intention)
        if (data.relationship_model) setRelationshipModel(data.relationship_model)
        if (data.bindungstyp) { setBindungsResult(data.bindungstyp); setBindungsShowResult(true) }
        if (data.love_language) { setLoveResult(data.love_language); setLoveShowResult(true) }
        if (data.werte) setWerte(data.werte)
        if (data.dealbreakers) setDealbreakers(data.dealbreakers)
        if (data.prompts) {
          const keys = data.prompts.map((p: any) => p.question)
          setSelectedPrompts(keys)
          const ans: Record<string, string> = {}
          data.prompts.forEach((p: any) => { ans[p.question] = p.answer })
          setPromptAnswers(ans)
        }
        if (data.audio_prompt_url) setAudioPromptUrl(data.audio_prompt_url)
      }
      setLoading(false)
    }
    load()
  }, [])

  // ── Auto-save (fire and forget) ─────────────────────────────────
  async function autoSave() {
    if (!userId) return
    const payload = buildPayload()
    await supabase.from('profiles').upsert({ user_id: userId, ...payload })
  }

  function buildPayload() {
    const age = birthDate
      ? new Date().getFullYear() - new Date(birthDate).getFullYear()
      : null

    return {
      name,
      birth_date: birthDate || null,
      age,
      location,
      gender,
      seeking,
      photos,
      occupation,
      height_cm: heightCm,
      has_children: hasChildren,
      smoking,
      alcohol,
      intention,
      relationship_model: relationshipModel,
      bindungstyp: bindungsResult,
      love_language: loveResult,
      werte,
      dealbreakers,
      prompts: selectedPrompts.map((q) => ({ question: q, answer: promptAnswers[q] ?? '' })),
      audio_prompt_url: audioPromptUrl,
    }
  }

  // ── Navigation ──────────────────────────────────────────────────
  function goNext() {
    autoSave()
    setStep((s) => Math.min(s + 1, TOTAL_STEPS))
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 1))
  }

  // ── Step 1 validation ───────────────────────────────────────────
  function canProceedStep1() {
    return name.trim().length > 0
  }

  // ── Step 2 – Photo upload ───────────────────────────────────────
  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length || !userId) return
    setUploadingPhoto(true)
    for (const file of files) {
      if (photos.length >= 6) break
      const ext = file.name.split('.').pop()
      const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('profile-photos').upload(path, file)
      if (error) { toast.error('Foto konnte nicht hochgeladen werden.'); continue }
      const { data: urlData } = supabase.storage.from('profile-photos').getPublicUrl(path)
      setPhotos((prev) => [...prev, { url: urlData.publicUrl, path }])
    }
    setUploadingPhoto(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function removePhoto(index: number) {
    const photo = photos[index]
    await supabase.storage.from('profile-photos').remove([photo.path])
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  function handleDragStart(index: number) {
    dragIndexRef.current = index
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault()
    const from = dragIndexRef.current
    if (from === null || from === index) return
    setPhotos((prev) => {
      const next = [...prev]
      const item = next.splice(from, 1)[0]
      next.splice(index, 0, item)
      return next
    })
    dragIndexRef.current = index
  }

  function handleDrop() {
    dragIndexRef.current = null
  }

  // ── Step 5 – Bindungstyp ────────────────────────────────────────
  function answerBindung(key: string) {
    const next = [...bindungsAntworten, key]
    setBindungsAntworten(next)
    if (bindungsSubQ < 4) {
      setBindungsSubQ((q) => q + 1)
    } else {
      const result = computeTopKey(next)
      setBindungsResult(BINDUNGSTYP_MAP[result])
      setBindungsShowResult(true)
    }
  }

  function retakeBindung() {
    setBindungsAntworten([])
    setBindungsSubQ(0)
    setBindungsResult('')
    setBindungsShowResult(false)
  }

  // ── Step 6 – Love Language ──────────────────────────────────────
  function answerLove(key: string) {
    const next = [...loveAntworten, key]
    setLoveAntworten(next)
    if (loveSubQ < 4) {
      setLoveSubQ((q) => q + 1)
    } else {
      const result = computeTopKey(next)
      setLoveResult(LOVELANG_MAP[result])
      setLoveShowResult(true)
    }
  }

  function retakeLove() {
    setLoveAntworten([])
    setLoveSubQ(0)
    setLoveResult('')
    setLoveShowResult(false)
  }

  // ── Step 8 – Dealbreaker custom input ──────────────────────────
  function handleDealbreakerKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && dealbreakerInput.trim()) {
      e.preventDefault()
      if (dealbreakers.length < 3) {
        setDealbreakers((prev) => [...prev, dealbreakerInput.trim()])
      }
      setDealbreakerInput('')
    }
  }

  // ── Step 10 – Audio recording ───────────────────────────────────
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioChunksRef.current = []
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data) }
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach((t) => t.stop())
      }
      recorder.start()
      setIsRecording(true)
      setRecordingSeconds(30)

      let secs = 30
      timerRef.current = setInterval(() => {
        secs -= 1
        setRecordingSeconds(secs)
        if (secs <= 0) stopRecording()
      }, 1000)
    } catch {
      toast.error('Mikrofon konnte nicht gestartet werden.')
    }
  }

  function stopRecording() {
    if (timerRef.current) clearInterval(timerRef.current)
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
  }

  async function uploadAudio(): Promise<string> {
    if (!audioBlob || !userId) return ''
    const path = `${userId}/${Date.now()}.webm`
    const { error } = await supabase.storage.from('audio-prompts').upload(path, audioBlob)
    if (error) { toast.error('Audio konnte nicht hochgeladen werden.'); return '' }
    const { data } = supabase.storage.from('audio-prompts').getPublicUrl(path)
    return data.publicUrl
  }

  // ── Final save ──────────────────────────────────────────────────
  async function handleFinish() {
    if (!userId) return
    setSaving(true)
    try {
      let finalAudioUrl = audioPromptUrl
      if (audioBlob && !audioPromptUrl) {
        finalAudioUrl = await uploadAudio()
        setAudioPromptUrl(finalAudioUrl)
      }
      const age = birthDate
        ? new Date().getFullYear() - new Date(birthDate).getFullYear()
        : null
      const { error } = await supabase.from('profiles').upsert({
        user_id: userId,
        name,
        birth_date: birthDate || null,
        age,
        location,
        gender,
        seeking,
        photos,
        occupation,
        height_cm: heightCm,
        has_children: hasChildren,
        smoking,
        alcohol,
        intention,
        relationship_model: relationshipModel,
        bindungstyp: bindungsResult,
        love_language: loveResult,
        werte,
        dealbreakers,
        prompts: selectedPrompts.map((q) => ({ question: q, answer: promptAnswers[q] ?? '' })),
        audio_prompt_url: finalAudioUrl,
        is_complete: true,
      })
      if (error) throw error
      toast.success('Profil gespeichert!')
      router.push('/discover')
    } catch {
      toast.error('Etwas ist schiefgelaufen.')
    } finally {
      setSaving(false)
    }
  }

  // ── Loading state ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#9E6B47] border-t-transparent animate-spin" />
      </div>
    )
  }

  // ── Shared UI helpers ───────────────────────────────────────────
  const Chip = ({
    label, active, onClick, disabled,
  }: { label: string; active: boolean; onClick: () => void; disabled?: boolean }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'px-3 py-1.5 rounded-full text-sm border cursor-pointer transition-colors',
        active
          ? 'bg-[#9E6B47] border-[#9E6B47] text-white'
          : 'border-[#E2DAD0] bg-[#EDE8E0] text-[#1A1410] hover:border-[#9E6B47]',
        disabled && !active && 'opacity-40 cursor-not-allowed',
      )}
    >
      {label}
    </button>
  )

  // ── Progress bar ────────────────────────────────────────────────
  const Header = () => (
    <div className="sticky top-0 z-10 bg-[#FAF8F4] border-b border-[#E2DAD0] px-4 py-3">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-3">
          <SajaLogo className="h-7 w-auto" />
          <span className="text-xs text-[#1A1410]/50 font-body">Schritt {step} von {TOTAL_STEPS}</span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors',
                i < step ? 'bg-[#9E6B47]' : 'bg-[#E2DAD0]',
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )

  const NavButtons = ({
    onNext, nextLabel = 'Weiter', nextDisabled = false, showSkip = false, onSkip,
  }: {
    onNext: () => void
    nextLabel?: string
    nextDisabled?: boolean
    showSkip?: boolean
    onSkip?: () => void
  }) => (
    <div className="flex items-center justify-between pt-6 pb-10">
      {step > 1 ? (
        <button
          type="button"
          onClick={goBack}
          className="px-5 py-2.5 rounded-full border border-[#9E6B47] text-[#9E6B47] text-sm font-body hover:bg-[#9E6B47]/5 transition-colors"
        >
          Zurück
        </button>
      ) : <div />}
      <div className="flex items-center gap-3">
        {showSkip && (
          <button
            type="button"
            onClick={onSkip ?? goNext}
            className="px-5 py-2.5 rounded-full border border-[#E2DAD0] text-[#1A1410]/50 text-sm font-body hover:border-[#9E6B47]/40 transition-colors"
          >
            Überspringen
          </button>
        )}
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          className={cn(
            'px-6 py-2.5 rounded-full text-sm font-body transition-colors',
            nextDisabled
              ? 'bg-[#E2DAD0] text-[#1A1410]/30 cursor-not-allowed'
              : 'bg-[#9E6B47] text-white hover:bg-[#7A4E30]',
          )}
        >
          {nextLabel}
        </button>
      </div>
    </div>
  )

  const StepShell = ({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) => (
    <div className="max-w-lg mx-auto px-4 pt-8">
      <h1 className="font-heading text-3xl text-[#1A1410] mb-1">{title}</h1>
      {subtitle && <p className="font-body text-sm text-[#1A1410]/60 mb-6">{subtitle}</p>}
      {!subtitle && <div className="mb-6" />}
      {children}
    </div>
  )

  // ════════════════════════════════════════════════════════════════
  // STEP RENDERS
  // ════════════════════════════════════════════════════════════════

  // ── Step 1 ──────────────────────────────────────────────────────
  const renderStep1 = () => (
    <StepShell title="Hallo, ich bin…" subtitle="Erzähl uns ein bisschen über dich.">
      <div className="space-y-5">
        <div>
          <label className="block font-body text-sm text-[#1A1410]/70 mb-1">Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Dein Vorname"
            className="w-full rounded-xl border border-[#F6F2EC] bg-white px-4 py-3 text-sm font-body text-[#1A1410] focus:outline-none focus:ring-2 focus:ring-[#9E6B47]/30"
          />
        </div>
        <div>
          <label className="block font-body text-sm text-[#1A1410]/70 mb-1">Geburtsdatum</label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full rounded-xl border border-[#F6F2EC] bg-white px-4 py-3 text-sm font-body text-[#1A1410] focus:outline-none focus:ring-2 focus:ring-[#9E6B47]/30"
          />
        </div>
        <div>
          <label className="block font-body text-sm text-[#1A1410]/70 mb-2">Geschlecht</label>
          <div className="flex flex-wrap gap-2">
            {['Mann', 'Frau', 'Nicht-binär', 'Weitere'].map((g) => (
              <Chip key={g} label={g} active={gender === g} onClick={() => setGender(gender === g ? '' : g)} />
            ))}
          </div>
        </div>
        <div>
          <label className="block font-body text-sm text-[#1A1410]/70 mb-2">Ich suche</label>
          <div className="flex flex-wrap gap-2">
            {['Männer', 'Frauen', 'Alle'].map((s) => (
              <Chip
                key={s}
                label={s}
                active={seeking.includes(s)}
                onClick={() =>
                  setSeeking((prev) =>
                    prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
                  )
                }
              />
            ))}
          </div>
        </div>
        <div>
          <label className="block font-body text-sm text-[#1A1410]/70 mb-1">Wohnort</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Stadt"
            className="w-full rounded-xl border border-[#F6F2EC] bg-white px-4 py-3 text-sm font-body text-[#1A1410] focus:outline-none focus:ring-2 focus:ring-[#9E6B47]/30"
          />
        </div>
      </div>
      <NavButtons onNext={goNext} nextDisabled={!canProceedStep1()} />
    </StepShell>
  )

  // ── Step 2 ──────────────────────────────────────────────────────
  const renderStep2 = () => (
    <StepShell title="Deine Fotos" subtitle="Lade mindestens 3 Fotos hoch. Das erste wird dein Hauptfoto.">
      <div>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {photos.map((photo, i) => (
            <div
              key={photo.path}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDrop={handleDrop}
              className="relative aspect-square rounded-xl overflow-hidden border border-[#E2DAD0] cursor-grab active:cursor-grabbing"
            >
              <img src={photo.url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
              {i === 0 && (
                <span className="absolute bottom-1 left-1 bg-[#9E6B47] text-white text-[10px] font-body px-1.5 py-0.5 rounded-full">
                  Hauptfoto
                </span>
              )}
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-black/70"
              >
                ×
              </button>
            </div>
          ))}
          {photos.length < 6 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="aspect-square rounded-xl border-2 border-dashed border-[#E2DAD0] flex flex-col items-center justify-center text-[#1A1410]/40 hover:border-[#9E6B47]/50 hover:text-[#9E6B47]/60 transition-colors"
            >
              {uploadingPhoto ? (
                <div className="w-5 h-5 rounded-full border-2 border-[#9E6B47] border-t-transparent animate-spin" />
              ) : (
                <>
                  <span className="text-2xl leading-none">+</span>
                  <span className="text-xs mt-1 font-body">Hinzufügen</span>
                </>
              )}
            </button>
          )}
          {Array.from({ length: Math.max(0, 3 - photos.length - (photos.length < 6 ? 1 : 0)) }).map((_, i) => (
            <div
              key={`placeholder-${i}`}
              className="aspect-square rounded-xl border-2 border-dashed border-[#E2DAD0] bg-[#F6F2EC]/50"
            />
          ))}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoUpload}
          className="hidden"
        />
        <p className="text-xs font-body text-[#1A1410]/40 text-center">
          {photos.length}/6 Fotos · Ziehen zum Sortieren
        </p>
      </div>
      <NavButtons onNext={goNext} nextDisabled={photos.length < 3} />
    </StepShell>
  )

  // ── Step 3 ──────────────────────────────────────────────────────
  const renderStep3 = () => (
    <StepShell title="Dein Leben" subtitle="Diese Angaben sind optional.">
      <div className="space-y-6">
        <div>
          <label className="block font-body text-sm text-[#1A1410]/70 mb-1">Beruf</label>
          <input
            type="text"
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            placeholder="Was machst du?"
            className="w-full rounded-xl border border-[#F6F2EC] bg-white px-4 py-3 text-sm font-body text-[#1A1410] focus:outline-none focus:ring-2 focus:ring-[#9E6B47]/30"
          />
        </div>
        <div>
          <label className="block font-body text-sm text-[#1A1410]/70 mb-2">
            Größe — <span className="text-[#9E6B47]">{heightCm} cm</span>
          </label>
          <input
            type="range"
            min={140}
            max={220}
            value={heightCm}
            onChange={(e) => setHeightCm(Number(e.target.value))}
            className="w-full accent-[#9E6B47]"
          />
          <div className="flex justify-between text-xs font-body text-[#1A1410]/40 mt-1">
            <span>140 cm</span>
            <span>220 cm</span>
          </div>
        </div>
        <div>
          <label className="block font-body text-sm text-[#1A1410]/70 mb-2">Kinder</label>
          <div className="flex flex-wrap gap-2">
            {['Habe Kinder', 'Möchte Kinder', 'Möchte keine Kinder', 'Noch unsicher'].map((c) => (
              <Chip key={c} label={c} active={hasChildren === c} onClick={() => setHasChildren(hasChildren === c ? '' : c)} />
            ))}
          </div>
        </div>
        <div>
          <label className="block font-body text-sm text-[#1A1410]/70 mb-2">Rauchen</label>
          <div className="flex flex-wrap gap-2">
            {['Nein', 'Gelegentlich', 'Ja'].map((s) => (
              <Chip key={s} label={s} active={smoking === s} onClick={() => setSmoking(smoking === s ? '' : s)} />
            ))}
          </div>
        </div>
        <div>
          <label className="block font-body text-sm text-[#1A1410]/70 mb-2">Alkohol</label>
          <div className="flex flex-wrap gap-2">
            {['Nie', 'Gelegentlich', 'Regelmäßig'].map((a) => (
              <Chip key={a} label={a} active={alcohol === a} onClick={() => setAlcohol(alcohol === a ? '' : a)} />
            ))}
          </div>
        </div>
      </div>
      <NavButtons onNext={goNext} showSkip onSkip={goNext} />
    </StepShell>
  )

  // ── Step 4 ──────────────────────────────────────────────────────
  const renderStep4 = () => (
    <StepShell title="Was suchst du?" subtitle="Sei ehrlich — das hilft dir die richtigen Menschen zu finden.">
      <div className="space-y-6">
        <div>
          <label className="block font-body text-sm text-[#1A1410]/70 mb-2">Intention</label>
          <div className="flex flex-wrap gap-2">
            {['Feste Partnerschaft', 'Etwas Ernstes aufbauen', 'Offen schauen'].map((i) => (
              <Chip key={i} label={i} active={intention === i} onClick={() => setIntention(intention === i ? '' : i)} />
            ))}
          </div>
        </div>
        <div>
          <label className="block font-body text-sm text-[#1A1410]/70 mb-2">Beziehungsmodell</label>
          <div className="flex flex-wrap gap-2">
            {['Monogam', 'Ethisch non-monogam', 'Offen'].map((m) => (
              <Chip key={m} label={m} active={relationshipModel === m} onClick={() => setRelationshipModel(relationshipModel === m ? '' : m)} />
            ))}
          </div>
        </div>
      </div>
      <NavButtons onNext={goNext} nextDisabled={!intention || !relationshipModel} />
    </StepShell>
  )

  // ── Step 5 ──────────────────────────────────────────────────────
  const renderStep5 = () => {
    if (bindungsShowResult) {
      const topKey = Object.entries(BINDUNGSTYP_MAP).find(([, v]) => v === bindungsResult)?.[0] ?? 'S'
      return (
        <StepShell title="Dein Bindungstyp">
          <div className="rounded-2xl bg-[#F6F2EC] border border-[#E2DAD0] p-6 text-center mb-6">
            <p className="font-body text-xs text-[#9E6B47] uppercase tracking-widest mb-2">Dein Ergebnis</p>
            <h2 className="font-heading text-3xl text-[#1A1410] mb-3">{bindungsResult}</h2>
            <p className="font-body text-sm text-[#1A1410]/70 leading-relaxed">{BINDUNGSTYP_DESC[topKey]}</p>
          </div>
          <div className="flex gap-3 pb-10">
            <button
              type="button"
              onClick={retakeBindung}
              className="flex-1 px-5 py-2.5 rounded-full border border-[#9E6B47] text-[#9E6B47] text-sm font-body hover:bg-[#9E6B47]/5 transition-colors"
            >
              Nochmal
            </button>
            <button
              type="button"
              onClick={goNext}
              className="flex-1 px-6 py-2.5 rounded-full bg-[#9E6B47] text-white text-sm font-body hover:bg-[#7A4E30] transition-colors"
            >
              Weiter
            </button>
          </div>
        </StepShell>
      )
    }

    const q = BINDUNGSTYP_QUESTIONS[bindungsSubQ]
    return (
      <StepShell
        title="Bindungstyp-Test"
        subtitle={`Frage ${bindungsSubQ + 1} von 5`}
      >
        <p className="font-heading text-xl text-[#1A1410] mb-6 leading-snug">{q.question}</p>
        <div className="space-y-3">
          {q.answers.map((ans) => (
            <button
              key={ans.key}
              type="button"
              onClick={() => answerBindung(ans.key)}
              className="w-full text-left px-5 py-4 rounded-xl border border-[#E2DAD0] bg-white font-body text-sm text-[#1A1410] hover:border-[#9E6B47] hover:bg-[#FAF8F4] transition-colors"
            >
              {ans.text}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between pt-6 pb-10">
          {step > 1 && (
            <button
              type="button"
              onClick={bindungsSubQ > 0 ? () => { setBindungsSubQ((q) => q - 1); setBindungsAntworten((a) => a.slice(0, -1)) } : goBack}
              className="px-5 py-2.5 rounded-full border border-[#9E6B47] text-[#9E6B47] text-sm font-body hover:bg-[#9E6B47]/5 transition-colors"
            >
              Zurück
            </button>
          )}
          <button
            type="button"
            onClick={goNext}
            className="px-5 py-2.5 rounded-full border border-[#E2DAD0] text-[#1A1410]/50 text-sm font-body hover:border-[#9E6B47]/40 transition-colors"
          >
            Überspringen
          </button>
        </div>
      </StepShell>
    )
  }

  // ── Step 6 ──────────────────────────────────────────────────────
  const renderStep6 = () => {
    if (loveShowResult) {
      return (
        <StepShell title="Deine Love Language">
          <div className="rounded-2xl bg-[#F6F2EC] border border-[#E2DAD0] p-6 text-center mb-6">
            <p className="font-body text-xs text-[#9E6B47] uppercase tracking-widest mb-2">Dein Ergebnis</p>
            <h2 className="font-heading text-3xl text-[#1A1410] mb-3">{loveResult}</h2>
            <p className="font-body text-sm text-[#1A1410]/70 leading-relaxed">
              Das ist die Art, wie du Liebe am stärksten empfängst — und oft auch gibst.
            </p>
          </div>
          <div className="flex gap-3 pb-10">
            <button
              type="button"
              onClick={retakeLove}
              className="flex-1 px-5 py-2.5 rounded-full border border-[#9E6B47] text-[#9E6B47] text-sm font-body hover:bg-[#9E6B47]/5 transition-colors"
            >
              Nochmal
            </button>
            <button
              type="button"
              onClick={goNext}
              className="flex-1 px-6 py-2.5 rounded-full bg-[#9E6B47] text-white text-sm font-body hover:bg-[#7A4E30] transition-colors"
            >
              Weiter
            </button>
          </div>
        </StepShell>
      )
    }

    const q = LOVELANG_QUESTIONS[loveSubQ]
    return (
      <StepShell
        title="Love Language Test"
        subtitle={`Frage ${loveSubQ + 1} von 5`}
      >
        <p className="font-heading text-xl text-[#1A1410] mb-6 leading-snug">{q.question}</p>
        <div className="space-y-3">
          {q.answers.map((ans) => (
            <button
              key={ans.key}
              type="button"
              onClick={() => answerLove(ans.key)}
              className="w-full text-left px-5 py-4 rounded-xl border border-[#E2DAD0] bg-white font-body text-sm text-[#1A1410] hover:border-[#9E6B47] hover:bg-[#FAF8F4] transition-colors"
            >
              {ans.text}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between pt-6 pb-10">
          {step > 1 && (
            <button
              type="button"
              onClick={loveSubQ > 0 ? () => { setLoveSubQ((q) => q - 1); setLoveAntworten((a) => a.slice(0, -1)) } : goBack}
              className="px-5 py-2.5 rounded-full border border-[#9E6B47] text-[#9E6B47] text-sm font-body hover:bg-[#9E6B47]/5 transition-colors"
            >
              Zurück
            </button>
          )}
          <button
            type="button"
            onClick={goNext}
            className="px-5 py-2.5 rounded-full border border-[#E2DAD0] text-[#1A1410]/50 text-sm font-body hover:border-[#9E6B47]/40 transition-colors"
          >
            Überspringen
          </button>
        </div>
      </StepShell>
    )
  }

  // ── Step 7 ──────────────────────────────────────────────────────
  const renderStep7 = () => (
    <StepShell title="Deine Werte" subtitle="Wähle bis zu 5 Werte, die dir am wichtigsten sind.">
      <div className="flex flex-wrap gap-2 mb-4">
        {WERTE_OPTIONS.map((w) => {
          const active = werte.includes(w)
          const maxReached = werte.length >= 5
          return (
            <Chip
              key={w}
              label={w}
              active={active}
              disabled={maxReached && !active}
              onClick={() =>
                setWerte((prev) =>
                  prev.includes(w) ? prev.filter((x) => x !== w) : maxReached ? prev : [...prev, w],
                )
              }
            />
          )
        })}
      </div>
      <p className="text-xs font-body text-[#1A1410]/40 mb-6">{werte.length}/5 ausgewählt</p>
      <NavButtons onNext={goNext} nextDisabled={werte.length === 0} showSkip onSkip={goNext} />
    </StepShell>
  )

  // ── Step 8 ──────────────────────────────────────────────────────
  const renderStep8 = () => (
    <StepShell title="Dealbreaker" subtitle="Was ist für dich ein absolutes No-Go? Optional, max. 3.">
      <div className="flex flex-wrap gap-2 mb-4">
        {DEALBREAKER_OPTIONS.map((d) => {
          const active = dealbreakers.includes(d)
          const maxReached = dealbreakers.length >= 3
          return (
            <Chip
              key={d}
              label={d}
              active={active}
              disabled={maxReached && !active}
              onClick={() =>
                setDealbreakers((prev) =>
                  prev.includes(d) ? prev.filter((x) => x !== d) : maxReached ? prev : [...prev, d],
                )
              }
            />
          )
        })}
      </div>
      {dealbreakers.filter((d) => !DEALBREAKER_OPTIONS.includes(d)).map((custom) => (
        <div key={custom} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm bg-[#9E6B47] border-[#9E6B47] text-white mr-2 mb-2">
          {custom}
          <button
            type="button"
            onClick={() => setDealbreakers((prev) => prev.filter((x) => x !== custom))}
            className="ml-1 text-white/70 hover:text-white"
          >
            ×
          </button>
        </div>
      ))}
      {dealbreakers.length < 3 && (
        <input
          type="text"
          value={dealbreakerInput}
          onChange={(e) => setDealbreakerInput(e.target.value)}
          onKeyDown={handleDealbreakerKeyDown}
          placeholder="Eigener Dealbreaker (Enter zum Hinzufügen)"
          className="w-full rounded-xl border border-[#F6F2EC] bg-white px-4 py-3 text-sm font-body text-[#1A1410] focus:outline-none focus:ring-2 focus:ring-[#9E6B47]/30 mt-2"
        />
      )}
      <p className="text-xs font-body text-[#1A1410]/40 mt-2 mb-2">{dealbreakers.length}/3 ausgewählt</p>
      <NavButtons onNext={goNext} showSkip onSkip={goNext} />
    </StepShell>
  )

  // ── Step 9 ──────────────────────────────────────────────────────
  const renderStep9 = () => {
    if (promptPhase === 'answer') {
      return (
        <StepShell title="Deine Antworten" subtitle="Schreib kurz und ehrlich — max. 150 Zeichen.">
          <div className="space-y-6">
            {selectedPrompts.map((q) => (
              <div key={q}>
                <label className="block font-body text-sm text-[#9E6B47] mb-1">{q}</label>
                <textarea
                  value={promptAnswers[q] ?? ''}
                  onChange={(e) => {
                    if (e.target.value.length > 150) return
                    setPromptAnswers((prev) => ({ ...prev, [q]: e.target.value }))
                  }}
                  rows={3}
                  placeholder="Deine Antwort…"
                  className="w-full rounded-xl border border-[#F6F2EC] bg-white px-4 py-3 text-sm font-body text-[#1A1410] resize-none focus:outline-none focus:ring-2 focus:ring-[#9E6B47]/30"
                />
                <p className="text-right text-xs font-body text-[#1A1410]/40 mt-0.5">
                  {(promptAnswers[q] ?? '').length}/150
                </p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-6 pb-10">
            <button
              type="button"
              onClick={() => setPromptPhase('select')}
              className="px-5 py-2.5 rounded-full border border-[#9E6B47] text-[#9E6B47] text-sm font-body hover:bg-[#9E6B47]/5 transition-colors"
            >
              Zurück
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={selectedPrompts.some((q) => !(promptAnswers[q] ?? '').trim())}
              className={cn(
                'px-6 py-2.5 rounded-full text-sm font-body transition-colors',
                selectedPrompts.some((q) => !(promptAnswers[q] ?? '').trim())
                  ? 'bg-[#E2DAD0] text-[#1A1410]/30 cursor-not-allowed'
                  : 'bg-[#9E6B47] text-white hover:bg-[#7A4E30]',
              )}
            >
              Weiter
            </button>
          </div>
        </StepShell>
      )
    }

    return (
      <StepShell title="Deine Prompts" subtitle="Wähle 2–3 Fragen, die zu dir passen.">
        <div className="space-y-6 mb-4">
          {Object.entries(PROMPT_CATALOG).map(([category, questions]) => (
            <div key={category}>
              <p className="font-body text-xs text-[#9E6B47] uppercase tracking-widest mb-2">{category}</p>
              <div className="space-y-2">
                {questions.map((q) => {
                  const active = selectedPrompts.includes(q)
                  const maxReached = selectedPrompts.length >= 3
                  return (
                    <button
                      key={q}
                      type="button"
                      disabled={maxReached && !active}
                      onClick={() =>
                        setSelectedPrompts((prev) =>
                          prev.includes(q) ? prev.filter((x) => x !== q) : maxReached ? prev : [...prev, q],
                        )
                      }
                      className={cn(
                        'w-full text-left px-4 py-3 rounded-xl border text-sm font-body transition-colors',
                        active
                          ? 'border-[#9E6B47] bg-[#9E6B47]/8 text-[#9E6B47]'
                          : 'border-[#E2DAD0] bg-white text-[#1A1410] hover:border-[#9E6B47]/40',
                        maxReached && !active && 'opacity-40 cursor-not-allowed',
                      )}
                    >
                      {q}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs font-body text-[#1A1410]/40 mb-4">{selectedPrompts.length}/3 ausgewählt</p>
        <div className="flex items-center justify-between pb-10">
          <button
            type="button"
            onClick={goBack}
            className="px-5 py-2.5 rounded-full border border-[#9E6B47] text-[#9E6B47] text-sm font-body hover:bg-[#9E6B47]/5 transition-colors"
          >
            Zurück
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={goNext}
              className="px-5 py-2.5 rounded-full border border-[#E2DAD0] text-[#1A1410]/50 text-sm font-body hover:border-[#9E6B47]/40 transition-colors"
            >
              Überspringen
            </button>
            <button
              type="button"
              disabled={selectedPrompts.length < 2}
              onClick={() => setPromptPhase('answer')}
              className={cn(
                'px-6 py-2.5 rounded-full text-sm font-body transition-colors',
                selectedPrompts.length < 2
                  ? 'bg-[#E2DAD0] text-[#1A1410]/30 cursor-not-allowed'
                  : 'bg-[#9E6B47] text-white hover:bg-[#7A4E30]',
              )}
            >
              Weiter
            </button>
          </div>
        </div>
      </StepShell>
    )
  }

  // ── Step 10 ─────────────────────────────────────────────────────
  const renderStep10 = () => (
    <StepShell
      title="Dein Audio-Prompt"
      subtitle="Optional: Lass andere deine Stimme hören."
    >
      <div className="rounded-2xl bg-[#F6F2EC] border border-[#E2DAD0] p-5 mb-6">
        <p className="font-heading text-lg text-[#1A1410] leading-snug">
          „Was möchtest du, dass jemand über dich weiß, bevor ihr euch begegnet?"
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 mb-8">
        {!audioUrl ? (
          <>
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              className={cn(
                'w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl shadow-md transition-colors',
                isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-[#9E6B47] hover:bg-[#7A4E30]',
              )}
            >
              {isRecording ? '■' : '●'}
            </button>
            {isRecording && (
              <p className="font-body text-sm text-red-500 font-medium">
                {recordingSeconds}s verbleibend
              </p>
            )}
            {!isRecording && (
              <p className="font-body text-sm text-[#1A1410]/50">
                Drücke zum Aufnehmen (max. 30 Sek.)
              </p>
            )}
          </>
        ) : (
          <div className="w-full space-y-3">
            <audio src={audioUrl} controls className="w-full rounded-xl" />
            <button
              type="button"
              onClick={() => { setAudioBlob(null); setAudioUrl(''); setAudioPromptUrl('') }}
              className="w-full px-4 py-2 rounded-full border border-[#E2DAD0] text-sm font-body text-[#1A1410]/60 hover:border-[#9E6B47]/40 transition-colors"
            >
              Neue Aufnahme
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pb-10">
        <button
          type="button"
          onClick={goBack}
          className="px-5 py-2.5 rounded-full border border-[#9E6B47] text-[#9E6B47] text-sm font-body hover:bg-[#9E6B47]/5 transition-colors"
        >
          Zurück
        </button>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleFinish}
            disabled={saving}
            className="px-4 py-2.5 rounded-full border border-[#E2DAD0] text-sm font-body text-[#1A1410]/50 hover:border-[#9E6B47]/40 transition-colors"
          >
            Überspringen
          </button>
          <button
            type="button"
            onClick={handleFinish}
            disabled={saving}
            className={cn(
              'px-6 py-2.5 rounded-full text-sm font-body transition-colors',
              saving
                ? 'bg-[#E2DAD0] text-[#1A1410]/30 cursor-not-allowed'
                : 'bg-[#9E6B47] text-white hover:bg-[#7A4E30]',
            )}
          >
            {saving ? 'Speichern…' : 'Profil speichern'}
          </button>
        </div>
      </div>
    </StepShell>
  )

  // ── Step dispatcher ─────────────────────────────────────────────
  const renderStep = () => {
    switch (step) {
      case 1: return renderStep1()
      case 2: return renderStep2()
      case 3: return renderStep3()
      case 4: return renderStep4()
      case 5: return renderStep5()
      case 6: return renderStep6()
      case 7: return renderStep7()
      case 8: return renderStep8()
      case 9: return renderStep9()
      case 10: return renderStep10()
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF8F4]">
      <Header />
      <main className="pb-safe">
        {renderStep()}
      </main>
    </div>
  )
}
