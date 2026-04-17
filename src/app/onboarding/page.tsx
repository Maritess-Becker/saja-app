'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { SajaLogo } from '@/components/ui/SajaLogo'
import toast from 'react-hot-toast'
import { ChevronLeft, Plus, X, Mic } from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────
type PhotoItem = { url: string; path: string; caption?: string }

// ── Phase/SubStep sizes ──────────────────────────────────────────────
// Phase 1: 6 SubSteps (0=welcome,1=name,2=birthdate,3=gender,4=location,5=intention)
// Phase 2: 0=intro, 1-10=questions
// Phase 3: 0=intro, 1-10=questions
// Phase 4: 0=intro, 1-15=questions
// Phase 5: 0=werte, 1=dealbreaker
// Phase 6: 0=intro, 1=sunSign, 2=ascendant, 3=chinese
// Phase 7: 0=photos, 1=prompts, 2=audio
// Phase 8: 0=loading, 1=bindung, 2=love, 3=personality, 4=profile, 5=compat
const PHASE_MAX_SUBSTEP = [5, 10, 10, 15, 3, 3, 2, 5]
const PHASE_TOTAL_STEPS = [6, 11, 11, 16, 4, 4, 3, 6]

// ── Helper functions ─────────────────────────────────────────────────
const STERNZEICHEN = [
  '♈ Widder', '♉ Stier', '♊ Zwillinge', '♋ Krebs',
  '♌ Löwe', '♍ Jungfrau', '♎ Waage', '♏ Skorpion',
  '♐ Schütze', '♑ Steinbock', '♒ Wassermann', '♓ Fische',
]

function getSunSign(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const m = d.getMonth() + 1
  const day = d.getDate()
  if ((m === 3 && day >= 21) || (m === 4 && day <= 19)) return '♈ Widder'
  if ((m === 4 && day >= 20) || (m === 5 && day <= 20)) return '♉ Stier'
  if ((m === 5 && day >= 21) || (m === 6 && day <= 20)) return '♊ Zwillinge'
  if ((m === 6 && day >= 21) || (m === 7 && day <= 22)) return '♋ Krebs'
  if ((m === 7 && day >= 23) || (m === 8 && day <= 22)) return '♌ Löwe'
  if ((m === 8 && day >= 23) || (m === 9 && day <= 22)) return '♍ Jungfrau'
  if ((m === 9 && day >= 23) || (m === 10 && day <= 22)) return '♎ Waage'
  if ((m === 10 && day >= 23) || (m === 11 && day <= 21)) return '♏ Skorpion'
  if ((m === 11 && day >= 22) || (m === 12 && day <= 21)) return '♐ Schütze'
  if ((m === 12 && day >= 22) || (m === 1 && day <= 19)) return '♑ Steinbock'
  if ((m === 1 && day >= 20) || (m === 2 && day <= 18)) return '♒ Wassermann'
  return '♓ Fische'
}

function getChineseZodiacName(year: number): string {
  const animals = ['Ratte', 'Ochse', 'Tiger', 'Hase', 'Drache', 'Schlange', 'Pferd', 'Ziege', 'Affe', 'Hahn', 'Hund', 'Schwein']
  return animals[((year - 1900) % 12 + 12) % 12]
}

function calcAge(birthDate: string): number | null {
  if (!birthDate) return null
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

// ── Chinese Zodiac Data ──────────────────────────────────────────────
const CHINESE_ZODIAC_DATA: Record<string, { emoji: string; desc: string }> = {
  'Ratte': { emoji: '🐭', desc: 'Ratten sind klug, charmant und anpassungsfähig. Sie haben ein gutes Gespür für Menschen und eine natürliche Fähigkeit zum Netzwerken.' },
  'Ochse': { emoji: '🐂', desc: 'Ochsen sind zuverlässig, geduldig und unermüdlich. Sie stehen für Beständigkeit und echte Verlässlichkeit.' },
  'Tiger': { emoji: '🐯', desc: 'Tiger sind mutig, leidenschaftlich und charismatisch. Sie gehen mit vollem Einsatz in alles was sie tun.' },
  'Hase': { emoji: '🐇', desc: 'Hasen sind feinfühlig, diplomatisch und anmutig. Sie schaffen Harmonie und haben einen feinen Sinn für Schönheit.' },
  'Drache': { emoji: '🐉', desc: 'Drachen sind charismatisch, mutig und bringen Feuer in alles was sie tun. Sie sind geboren um aufzufallen.' },
  'Schlange': { emoji: '🐍', desc: 'Schlangen sind weise, intuitiv und tiefgründig. Sie denken viel nach und handeln mit Bedacht.' },
  'Pferd': { emoji: '🐴', desc: 'Pferde sind frei, lebhaft und abenteuerlustig. Sie lieben es in Bewegung zu sein und neue Wege zu gehen.' },
  'Ziege': { emoji: '🐐', desc: 'Ziegen sind kreativ, einfühlsam und liebevoll. Sie bringen Sanftheit und Wärme in jede Beziehung.' },
  'Affe': { emoji: '🐒', desc: 'Affen sind verspielt, intelligent und erfinderisch. Sie finden in allem das Abenteuer und bringen Leichtigkeit.' },
  'Hahn': { emoji: '🐓', desc: 'Hähne sind direkt, fleißig und zuverlässig. Sie sagen was sie denken und stehen zu ihren Werten.' },
  'Hund': { emoji: '🐕', desc: 'Hunde sind loyal, ehrlich und fürsorglich. Treue ist für sie keine Pflicht sondern eine Selbstverständlichkeit.' },
  'Schwein': { emoji: '🐷', desc: 'Schweine sind großzügig, herzlich und genussfreudig. Sie lieben das Leben und teilen diese Freude gerne.' },
}

// ── Phase 2: Bindungstyp ─────────────────────────────────────────────
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

  if (secure >= 4) return 'Sicher gebunden'
  if (anxious >= 4) return 'Ängstlich gebunden'
  if (avoidant >= 4) return 'Vermeidend gebunden'
  if (anxious >= 3.5 && avoidant >= 3.5) return 'Desorganisiert gebunden'
  if (secure >= 3.5) return 'Sicher gebunden'
  if (anxious > avoidant && anxious > secure) return 'Ängstlich gebunden'
  if (avoidant > anxious && avoidant > secure) return 'Vermeidend gebunden'
  return 'Sicher gebunden'
}

// ── Phase 3: Love Language ───────────────────────────────────────────
const LOVE_QUESTIONS: Array<{ A: string; B: string }> = [
  { A: 'Ich fühle mich geliebt wenn jemand einfach Zeit mit mir verbringt.', B: 'Ich fühle mich geliebt wenn mir jemand bei etwas hilft ohne gefragt zu werden.' },
  { A: 'Ein liebevolles Wort bedeutet mir mehr als ein teures Geschenk.', B: 'Eine Umarmung sagt manchmal mehr als tausend Worte.' },
  { A: 'Wenn mein Partner überraschend etwas für mich erledigt fühle ich mich sehr geliebt.', B: 'Kleine Aufmerksamkeiten und Geschenke berühren mich sehr.' },
  { A: 'Ich genieße es wenn wir einfach zusammen sind — auch ohne zu reden.', B: 'Körperliche Nähe ist mir sehr wichtig — Hand halten, kuscheln.' },
  { A: 'Lob und Anerkennung bedeuten mir sehr viel.', B: 'Wenn mein Partner Zeit für mich schafft fühle ich mich priorisiert.' },
  { A: 'Eine selbstgemachte Kleinigkeit berührt mich mehr als etwas Gekauftes.', B: 'Ein spontaner Kuss oder eine Berührung im Vorbeigehen macht meinen Tag.' },
  { A: 'Ich liebe es wenn jemand sagt wie viel er/sie mich schätzt.', B: 'Gemeinsame Erlebnisse sind mir wichtiger als materielle Dinge.' },
  { A: 'Wenn jemand für mich kocht oder aufräumt fühle ich mich geliebt.', B: 'Ein handgeschriebener Brief oder eine persönliche Karte bewegt mich.' },
  { A: 'Ungeteilte Aufmerksamkeit ist das Schönste das mir jemand schenken kann.', B: 'Körperkontakt — auch kleine Gesten — sind sehr wichtig für mich.' },
  { A: 'Ich höre gerne wie sehr ich dem anderen bedeute.', B: 'Wenn jemand kleine Dinge für mich erledigt zeigt er/sie echte Fürsorge.' },
]

const LOVE_MAPPING: Array<{ A: string; B: string }> = [
  { A: 'QT', B: 'AS' }, { A: 'WA', B: 'PT' }, { A: 'AS', B: 'RG' }, { A: 'QT', B: 'PT' },
  { A: 'WA', B: 'QT' }, { A: 'RG', B: 'PT' }, { A: 'WA', B: 'QT' }, { A: 'AS', B: 'RG' },
  { A: 'QT', B: 'PT' }, { A: 'WA', B: 'AS' },
]

function computeLoveLanguage(answers: ('A' | 'B')[]): { primary: string; secondary: string } {
  const counts: Record<string, number> = { WA: 0, QT: 0, AS: 0, PT: 0, RG: 0 }
  answers.forEach((choice, i) => {
    const key = LOVE_MAPPING[i][choice]
    counts[key]++
  })
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  const MAP: Record<string, string> = {
    WA: 'Words of Affirmation', QT: 'Quality Time',
    AS: 'Acts of Service', PT: 'Physical Touch', RG: 'Receiving Gifts',
  }
  return { primary: MAP[sorted[0][0]], secondary: MAP[sorted[1][0]] }
}

// ── Phase 4: Personality ─────────────────────────────────────────────
const PERSONALITY_QUESTIONS = [
  { text: 'Ich suche aktiv neue Erfahrungen und Perspektiven.', dim: 'Offenheit' },
  { text: 'Ich bin offen für unkonventionelle Lebensweisen und Ideen.', dim: 'Offenheit' },
  { text: 'Kreativität und Fantasie spielen eine große Rolle in meinem Leben.', dim: 'Offenheit' },
  { text: 'Verlässlichkeit ist mir in einer Partnerschaft sehr wichtig.', dim: 'Gewissenhaftigkeit' },
  { text: 'Ich halte meine Versprechen — auch kleine.', dim: 'Gewissenhaftigkeit' },
  { text: 'Ich plane gerne und mag Struktur in meinem Alltag.', dim: 'Gewissenhaftigkeit' },
  { text: 'In Konflikten gehe ich lieber auf den anderen zu als auf meinem Standpunkt zu beharren.', dim: 'Verträglichkeit' },
  { text: 'Das Wohlbefinden meines Partners ist mir genauso wichtig wie meines.', dim: 'Verträglichkeit' },
  { text: 'Ich kann gut zuhören ohne sofort Ratschläge zu geben.', dim: 'Verträglichkeit' },
  { text: 'Ich kann mit Unsicherheit in einer Beziehung gut umgehen.', dim: 'Stabilität' },
  { text: 'Nach einem Streit beruhige ich mich relativ schnell wieder.', dim: 'Stabilität' },
  { text: 'Ich lasse mich durch Stimmungen meines Partners nicht stark beeinflussen.', dim: 'Stabilität' },
  { text: 'Ich tanke Energie auf wenn ich Zeit mit anderen Menschen verbringe.', dim: 'Extraversion' },
  { text: 'Ich spreche gerne über meine Gefühle und Gedanken.', dim: 'Extraversion' },
  { text: 'Soziale Situationen geben mir Energie statt mir Energie zu nehmen.', dim: 'Extraversion' },
]

function computePersonality(answers: number[]): Record<string, number> {
  if (answers.length < 15) return { openness: 0, conscientiousness: 0, agreeableness: 0, stability: 0, extraversion: 0 }
  return {
    openness: Math.round(([answers[0], answers[1], answers[2]].reduce((a, b) => a + b, 0) / 15) * 100),
    conscientiousness: Math.round(([answers[3], answers[4], answers[5]].reduce((a, b) => a + b, 0) / 15) * 100),
    agreeableness: Math.round(([answers[6], answers[7], answers[8]].reduce((a, b) => a + b, 0) / 15) * 100),
    stability: Math.round(([answers[9], answers[10], answers[11]].reduce((a, b) => a + b, 0) / 15) * 100),
    extraversion: Math.round(([answers[12], answers[13], answers[14]].reduce((a, b) => a + b, 0) / 15) * 100),
  }
}

// ── Prompt catalog ───────────────────────────────────────────────────
const PROMPT_CATALOG: Record<string, string[]> = {
  'Verbindung': [
    'Was ich brauche um wirklich anzukommen',
    'Eine Verbindung die mein Leben verändert hat',
    'So fühlt sich echte Nähe für mich an',
    'Was ich in einer Begegnung wirklich suche',
    'Ich öffne mich wenn …',
    'Das Schönste an einer tiefen Verbindung ist für mich',
    'Wie ich merke dass jemand wirklich da ist',
  ],
  'Werte & Leben': [
    'Wofür ich aufstehe wenn es schwer wird',
    'Das hat mein Leben von Grund auf verändert',
    'Meine Art die Welt zu sehen in einem Satz',
    'Was ich nicht verhandle',
    'Wie ich lebe wenn ich ganz ich selbst bin',
    'Was mich täglich trägt',
    'Das möchte ich in 5 Jahren fühlen — nicht haben',
  ],
  'Selbstreflexion': [
    'Was ich gerade über mich lerne',
    'Mein Bindungstyp — und was das über mich sagt',
    'Wo ich früher dachte ich bin so — und jetzt weiß ich anders',
    'Was ich in meiner letzten Beziehung über mich gelernt habe',
    'Meine größte Herausforderung in der Liebe war',
    'Dafür brauche ich noch Mut',
    'Was ich mir selbst gerade beweise',
  ],
  'Leicht & Offen': [
    'Das bringt mich sofort zum Lachen',
    'Mein perfekter Sonntag — ehrlich',
    'Das überrascht die meisten Menschen an mir',
    'Drei Dinge die mir jeden Tag Freude machen',
    'Worüber ich stundenlang reden könnte',
    'Mein liebstes Ritual',
    'Was ich gerne zusammen entdecken würde',
  ],
  'Körper & Präsenz': [
    'Wie ich in meinem Körper ankomme',
    'Was mir hilft präsent zu sein wenn es laut wird',
    'Berührt werde ich durch …',
    'So tanke ich wirklich auf',
  ],
}

// ── Phase 8: Result content ──────────────────────────────────────────
const BINDUNG_CONTENT: Record<string, { title: string; text: string; emoji: string }> = {
  'Sicher gebunden': {
    emoji: '🌿',
    title: 'Du bist sicher gebunden.',
    text: 'Du kannst Nähe zulassen ohne dich dabei zu verlieren. Du weißt wer du bist — auch in einer Beziehung. Das ist keine Selbstverständlichkeit.',
  },
  'Ängstlich gebunden': {
    emoji: '🌊',
    title: 'Du liebst tief.',
    text: 'Du gibst viel und liebst intensiv. Manchmal brauchst du mehr Bestätigung als andere — und das ist völlig menschlich. Das Wissen darüber ist bereits der erste Schritt.',
  },
  'Vermeidend gebunden': {
    emoji: '🏔️',
    title: 'Du schätzt deine Unabhängigkeit.',
    text: 'Du bist bei dir — auch in einer Beziehung. Nähe kann sich manchmal beengend anfühlen. Mit dem richtigen Menschen verändert sich das.',
  },
  'Desorganisiert gebunden': {
    emoji: '🌀',
    title: 'Du bist komplex — und das ist schön.',
    text: 'Du erlebst Nähe als gleichzeitig anziehend und herausfordernd. Diese Tiefe macht dich einzigartig. Selbsterkenntnis ist hier bereits Heilung.',
  },
}

const LOVE_CONTENT: Record<string, { emoji: string; desc: string }> = {
  'Words of Affirmation': { emoji: '💬', desc: 'Worte berühren dich am tiefsten. Ehrliche Anerkennung und liebevolle Nachrichten sind für dich Ausdruck echter Zuneigung.' },
  'Quality Time': { emoji: '⏳', desc: 'Echte Präsenz bedeutet dir alles. Wenn jemand wirklich da ist — ohne Ablenkung — fühlst du dich tief geliebt.' },
  'Acts of Service': { emoji: '🤝', desc: 'Wenn jemand für dich da ist und handelt ohne zu fragen — das ist für dich der stärkste Ausdruck von Fürsorge.' },
  'Physical Touch': { emoji: '🤗', desc: 'Körperliche Nähe ist deine Sprache. Eine Berührung im richtigen Moment sagt mehr als tausend Worte.' },
  'Receiving Gifts': { emoji: '🎁', desc: 'Durchdachte Aufmerksamkeiten berühren dich. Nicht der Wert — sondern das Zeichen: Ich habe an dich gedacht.' },
}

const COMPAT_TEXT: Record<string, string> = {
  'Sicher gebunden': 'Du harmonierst mit allen Bindungstypen gut — besonders mit anderen sicher Gebundenen. Mit Geduld kannst du auch ängstlich gebundene Menschen dabei unterstützen zu wachsen.',
  'Ängstlich gebunden': 'Du harmonierst am besten mit sicher gebundenen Partnern die dir die nötige Bestätigung geben können ohne sich selbst zu verlieren.',
  'Vermeidend gebunden': 'Du brauchst jemanden der deine Unabhängigkeit respektiert. Sicher gebundene Partner können dir zeigen dass Nähe keine Bedrohung ist.',
  'Desorganisiert gebunden': 'Du brauchst besonders viel Sicherheit und Konsistenz. Sicher gebundene Partner die ruhig und verlässlich sind können dir einen sicheren Hafen geben.',
}

// ── RadarChart SVG ───────────────────────────────────────────────────
function RadarChart({ scores }: { scores: Record<string, number> }) {
  const dimensions = [
    { key: 'openness', label: 'Offenheit' },
    { key: 'conscientiousness', label: 'Gewissen-\nhaftigkeit' },
    { key: 'agreeableness', label: 'Verträg-\nlichkeit' },
    { key: 'stability', label: 'Stabilität' },
    { key: 'extraversion', label: 'Extraver-\nsion' },
  ]
  const cx = 150, cy = 150, r = 100
  const n = dimensions.length

  function getPoint(index: number, value: number) {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2
    const dist = (value / 100) * r
    return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) }
  }

  function getLabelPoint(index: number) {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2
    const dist = r + 28
    return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) }
  }

  const gridLevels = [25, 50, 75, 100]

  function getGridPolygon(value: number) {
    return Array.from({ length: n }).map((_, i) => {
      const p = getPoint(i, value)
      return `${p.x},${p.y}`
    }).join(' ')
  }

  const dataPoints = dimensions.map((d, i) => getPoint(i, scores[d.key] ?? 0))
  const dataPolygon = dataPoints.map(p => `${p.x},${p.y}`).join(' ')

  return (
    <svg width="300" height="300" viewBox="0 0 300 300" className="mx-auto">
      {gridLevels.map(level => (
        <polygon key={level} points={getGridPolygon(level)} fill="none" stroke="#E2DAD0" strokeWidth="1" />
      ))}
      {dimensions.map((_, i) => {
        const p = getPoint(i, 100)
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#E2DAD0" strokeWidth="1" />
      })}
      <polygon points={dataPolygon} fill="rgba(158,107,71,0.2)" stroke="#9E6B47" strokeWidth="2" />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="#9E6B47" />
      ))}
      {dimensions.map((d, i) => {
        const lp = getLabelPoint(i)
        const lines = d.label.split('\n')
        return (
          <text key={i} x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="#6E6560" fontFamily="DM Sans">
            {lines.map((line, li) => (
              <tspan key={li} x={lp.x} dy={li === 0 ? 0 : 13}>{line}</tspan>
            ))}
          </text>
        )
      })}
    </svg>
  )
}

// ── ProgressHeader ───────────────────────────────────────────────────
function ProgressHeader({ phase, subStep }: { phase: number; subStep: number }) {
  const phaseOffset = PHASE_TOTAL_STEPS.slice(0, phase - 1).reduce((a, b) => a + b, 0)
  const totalSteps = PHASE_TOTAL_STEPS.reduce((a, b) => a + b, 0)
  const currentStep = phaseOffset + subStep
  const progress = (currentStep / totalSteps) * 100
  const remainingMinutes = Math.round(22 * (1 - progress / 100))

  return (
    <div className="sticky top-0 z-20 bg-[#FAF8F4] px-5 pt-4 pb-3">
      <div className="max-w-lg mx-auto">
        <div className="h-0.5 bg-[#E2DAD0] rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-[#9E6B47] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="font-body text-[12px] font-light text-[#A89888]">
          Phase {phase} von 8 · ~{Math.max(1, remainingMinutes)} Minuten verbleibend
        </p>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════
export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [phase, setPhase] = useState(1)
  const [subStep, setSubStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  // Phase 1 state
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [gender, setGender] = useState('')
  const [seeking, setSeeking] = useState<string[]>([])
  const [location, setLocation] = useState('')
  const [intention, setIntention] = useState('')
  const [relationshipModel, setRelationshipModel] = useState('')

  // Phase 2 state
  const [bindungsAnswers, setBindungsAnswers] = useState<number[]>([])
  const [bindungsResult, setBindungsResult] = useState('')

  // Phase 3 state
  const [loveAnswers, setLoveAnswers] = useState<('A' | 'B')[]>([])
  const [lovePrimary, setLovePrimary] = useState('')
  const [loveSecondary, setLoveSecondary] = useState('')

  // Phase 4 state
  const [personalityAnswers, setPersonalityAnswers] = useState<number[]>([])
  const [personalityScores, setPersonalityScores] = useState<Record<string, number>>({
    openness: 0, conscientiousness: 0, agreeableness: 0, stability: 0, extraversion: 0,
  })

  // Phase 5 state
  const [werte, setWerte] = useState<string[]>([])
  const [dealbreakers, setDealbreakers] = useState<string[]>([])
  const [myWorld, setMyWorld] = useState<string[]>([])
  const [sexualityInterests, setSexualityInterests] = useState<string[]>([])
  const [sexualityVisible, setSexualityVisible] = useState(false)

  // Phase 6 state
  const [sunSign, setSunSign] = useState('')
  const [ascendant, setAscendant] = useState('')
  const [chineseZodiac, setChineseZodiac] = useState('')

  // Phase 7 state
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragIndexRef = useRef<number | null>(null)
  const [promptPhase, setPromptPhase] = useState<'select' | 'answer'>('select')
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([])
  const [promptAnswers, setPromptAnswers] = useState<Record<string, string>>({})
  const [activePromptCategory, setActivePromptCategory] = useState('Verbindung')

  // Audio state
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState('')
  const [audioPromptUrl, setAudioPromptUrl] = useState('')
  const [recordingSeconds, setRecordingSeconds] = useState(30)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<BlobPart[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Phase 8 state
  const [phase8LoadingDone, setPhase8LoadingDone] = useState(false)

  // ── Restore progress from localStorage ──────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem('saja_onboarding_progress')
    if (saved) {
      try {
        const { phase: p, subStep: s } = JSON.parse(saved)
        if (p && s !== undefined) {
          setPhase(p)
          setSubStep(s)
        }
      } catch { /* ignore */ }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('saja_onboarding_progress', JSON.stringify({ phase, subStep }))
  }, [phase, subStep])

  // ── Load user + existing profile ────────────────────────────────
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
        if (data.intention) setIntention(data.intention)
        if (data.relationship_model) setRelationshipModel(data.relationship_model)
        if (data.bindungstyp) setBindungsResult(data.bindungstyp)
        if (data.love_language) setLovePrimary(data.love_language)
        if (data.love_language_secondary) setLoveSecondary(data.love_language_secondary)
        if (data.personality_scores) setPersonalityScores(data.personality_scores)
        if (data.werte) setWerte(data.werte)
        if (data.dealbreakers) setDealbreakers(data.dealbreakers)
        if (data.my_world) setMyWorld(data.my_world)
        if (data.sexuality_interests) setSexualityInterests(data.sexuality_interests)
        if (data.sexuality_visible !== undefined) setSexualityVisible(data.sexuality_visible)
        if (data.sun_sign) setSunSign(data.sun_sign)
        if (data.ascendant) setAscendant(data.ascendant)
        if (data.chinese_zodiac) setChineseZodiac(data.chinese_zodiac)
        if (data.photos) {
          const rawPhotos = data.photos as unknown[]
          setPhotos(rawPhotos.map((p: unknown) =>
            typeof p === 'string'
              ? { url: p as string, path: (p as string).split('/profile-photos/')[1] ?? (p as string) }
              : p as PhotoItem
          ))
        }
        if (data.prompts) {
          const keys = (data.prompts as Array<{ question: string; answer: string }>).map(p => p.question)
          setSelectedPrompts(keys)
          const ans: Record<string, string> = {}
          ;(data.prompts as Array<{ question: string; answer: string }>).forEach(p => { ans[p.question] = p.answer })
          setPromptAnswers(ans)
        }
        if (data.audio_prompt_url) setAudioPromptUrl(data.audio_prompt_url)
      }
      setLoading(false)
    }
    load()
  }, [])

  // ── Chinese zodiac auto-compute from birthDate ───────────────────
  useEffect(() => {
    if (birthDate) {
      const year = new Date(birthDate).getFullYear()
      setChineseZodiac(getChineseZodiacName(year))
    }
  }, [birthDate])

  // ── Sun sign auto-compute from birthDate ─────────────────────────
  useEffect(() => {
    if (birthDate && !sunSign) {
      setSunSign(getSunSign(birthDate))
    }
  }, [birthDate])

  // ── Phase 8 loading timer ────────────────────────────────────────
  useEffect(() => {
    if (phase === 8 && subStep === 0) {
      setPhase8LoadingDone(false)
      const timer = setTimeout(() => {
        setPhase8LoadingDone(true)
        setSubStep(1)
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [phase, subStep])

  // ── Auto-save ────────────────────────────────────────────────────
  async function autoSave() {
    if (!userId) return
    const age = birthDate ? calcAge(birthDate) : null
    await supabase.from('profiles').upsert({
      user_id: userId,
      name,
      birth_date: birthDate || null,
      age,
      location,
      gender,
      seeking,
      intention,
      relationship_model: relationshipModel,
      bindungstyp: bindungsResult || null,
      love_language: lovePrimary || null,
      love_language_secondary: loveSecondary || null,
      personality_scores: Object.keys(personalityScores).length > 0 ? personalityScores : null,
      werte,
      dealbreakers,
      my_world: myWorld,
      sexuality_interests: sexualityVisible ? sexualityInterests : [],
      sexuality_visible: sexualityVisible,
      prompts: selectedPrompts.map(q => ({ question: q, answer: promptAnswers[q] ?? '' })),
      photos,
      audio_prompt_url: audioPromptUrl || null,
      sun_sign: sunSign || null,
      ascendant: ascendant || null,
      chinese_zodiac: chineseZodiac || null,
      is_complete: phase === 8 && subStep >= 5,
    }, { onConflict: 'user_id' })
  }

  // ── Navigation ───────────────────────────────────────────────────
  function goNext() {
    autoSave()
    const maxSub = PHASE_MAX_SUBSTEP[phase - 1]
    if (subStep < maxSub) {
      setSubStep(s => s + 1)
    } else if (phase < 8) {
      setPhase(p => p + 1)
      setSubStep(0)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function goBack() {
    if (subStep > 0) {
      setSubStep(s => s - 1)
    } else if (phase > 1) {
      const prevPhase = phase - 1
      setPhase(prevPhase)
      setSubStep(PHASE_MAX_SUBSTEP[prevPhase - 1])
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Photo upload handlers ────────────────────────────────────────
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

  function handleDragStart(index: number) {
    dragIndexRef.current = index
  }

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

  function handleDrop() {
    dragIndexRef.current = null
  }

  function updateCaption(index: number, caption: string) {
    setPhotos(prev => prev.map((p, i) => i === index ? { ...p, caption } : p))
  }

  // ── Audio recording ──────────────────────────────────────────────
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
        stream.getTracks().forEach(t => t.stop())
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

  // ── Scale answer auto-advance ────────────────────────────────────
  async function handleBindungsScale(questionIndex: number, value: number) {
    const newAnswers = [...bindungsAnswers]
    newAnswers[questionIndex] = value
    setBindungsAnswers(newAnswers)
    await new Promise(resolve => setTimeout(resolve, 400))
    if (questionIndex < 9) {
      setSubStep(questionIndex + 2)
    } else {
      const result = computeBindungstyp(newAnswers)
      setBindungsResult(result)
      setPhase(3)
      setSubStep(0)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleLoveChoice(questionIndex: number, choice: 'A' | 'B') {
    const newAnswers = [...loveAnswers] as ('A' | 'B')[]
    newAnswers[questionIndex] = choice
    setLoveAnswers(newAnswers)
    await new Promise(resolve => setTimeout(resolve, 400))
    if (questionIndex < 9) {
      setSubStep(questionIndex + 2)
    } else {
      const result = computeLoveLanguage(newAnswers)
      setLovePrimary(result.primary)
      setLoveSecondary(result.secondary)
      setPhase(4)
      setSubStep(0)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handlePersonalityScale(questionIndex: number, value: number) {
    const newAnswers = [...personalityAnswers]
    newAnswers[questionIndex] = value
    setPersonalityAnswers(newAnswers)
    await new Promise(resolve => setTimeout(resolve, 400))
    if (questionIndex < 14) {
      setSubStep(questionIndex + 2)
    } else {
      const scores = computePersonality(newAnswers)
      setPersonalityScores(scores)
      setPhase(5)
      setSubStep(0)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Final finish ─────────────────────────────────────────────────
  async function handleFinish() {
    let finalAudioUrl = audioPromptUrl
    if (audioBlob && !audioPromptUrl) {
      finalAudioUrl = await uploadAudio()
      setAudioPromptUrl(finalAudioUrl)
    }
    autoSave()
    setPhase(8)
    setSubStep(0)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Loading state ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#9E6B47] border-t-transparent animate-spin" />
      </div>
    )
  }

  const age = birthDate ? calcAge(birthDate) : null
  const maxDate = new Date()
  maxDate.setFullYear(maxDate.getFullYear() - 18)
  const maxDateStr = maxDate.toISOString().split('T')[0]

  const backButton = (phase > 1 || subStep > 0) && (
    <button
      onClick={goBack}
      className="font-body text-sm text-[#A89888] mb-6 flex items-center gap-1.5"
    >
      <ChevronLeft className="w-4 h-4" /> Zurück
    </button>
  )

  // ════════════════════════════════════════════════════════════════
  // PHASE 1
  // ════════════════════════════════════════════════════════════════

  // Phase 1, SubStep 0 — Welcome
  if (phase === 1 && subStep === 0) {
    return (
      <div className="min-h-screen bg-[#FAF8F4]">
        <ProgressHeader phase={phase} subStep={subStep} />
        <div className="max-w-lg mx-auto px-5 pt-12 pb-24 flex flex-col items-center">
          <SajaLogo className="h-10 w-auto mb-8" />
          <h2 className="font-heading text-[36px] font-light text-[#1A1410] leading-tight text-center mb-6">
            Bevor du jemanden siehst lernst du dich selbst kennen.
          </h2>
          <p className="font-body text-[15px] font-light text-[#6E6560] leading-relaxed text-center mb-12">
            Saja funktioniert anders als andere Dating-Apps. Wir glauben dass echte Verbindung mit Selbsterkenntnis beginnt. Das dauert ca. 20 Minuten — und es lohnt sich.
          </p>
          <button
            onClick={goNext}
            className="w-full py-4 rounded-full bg-[#9E6B47] text-white font-body text-[16px] font-medium hover:bg-[#7A4E30] active:scale-[0.98] transition-all"
          >
            Ich bin bereit →
          </button>
        </div>
      </div>
    )
  }

  // Phase 1, SubStep 1 — Name
  if (phase === 1 && subStep === 1) {
    return (
      <div className="min-h-screen bg-[#FAF8F4]">
        <ProgressHeader phase={phase} subStep={subStep} />
        <div className="max-w-lg mx-auto px-5 pt-8 pb-24">
          {backButton}
          <p className="font-heading text-[22px] font-normal text-[#1A1410] leading-snug mb-6">Wie heißt du?</p>
          <p className="font-body text-[13px] font-light text-[#A89888] leading-relaxed mb-6">Nur dein Vorname — so zeigen wir dich.</p>
          <input
            type="text"
            placeholder="Dein Vorname"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-5 py-4 rounded-2xl border-2 border-[#E2DAD0] bg-white font-body text-[16px] focus:outline-none focus:border-[#9E6B47] transition-colors"
          />
          <button
            onClick={goNext}
            disabled={name.trim().length <= 1}
            className={cn(
              'w-full py-4 rounded-full font-body text-[16px] font-medium transition-all mt-8',
              name.trim().length > 1
                ? 'bg-[#9E6B47] text-white hover:bg-[#7A4E30] active:scale-[0.98]'
                : 'bg-[#E2DAD0] text-[#1A1410]/30 cursor-not-allowed'
            )}
          >
            Weiter →
          </button>
        </div>
      </div>
    )
  }

  // Phase 1, SubStep 2 — Birthdate
  if (phase === 1 && subStep === 2) {
    const chineseSignName = birthDate ? getChineseZodiacName(new Date(birthDate).getFullYear()) : ''
    const chineseData = chineseSignName ? CHINESE_ZODIAC_DATA[chineseSignName] : null
    const canProceed = !!birthDate && (age !== null && age >= 18)

    return (
      <div className="min-h-screen bg-[#FAF8F4]">
        <ProgressHeader phase={phase} subStep={subStep} />
        <div className="max-w-lg mx-auto px-5 pt-8 pb-24">
          {backButton}
          <p className="font-heading text-[22px] font-normal text-[#1A1410] leading-snug mb-6">Wann wurdest du geboren?</p>
          <input
            type="date"
            value={birthDate}
            onChange={e => setBirthDate(e.target.value)}
            max={maxDateStr}
            className="w-full px-5 py-4 rounded-2xl border-2 border-[#E2DAD0] bg-white font-body text-[16px] focus:outline-none focus:border-[#9E6B47] transition-colors"
          />
          {birthDate && age !== null && age < 18 && (
            <p className="font-body text-[13px] text-red-500 mt-2">Du musst mindestens 18 Jahre alt sein.</p>
          )}
          {birthDate && age !== null && age >= 18 && chineseData && (
            <div className="mt-4 flex items-center gap-3 px-4 py-3 bg-white rounded-2xl border border-[#E2DAD0]">
              <span className="text-2xl">{chineseData.emoji}</span>
              <div>
                <p className="font-body text-[14px] text-[#1A1410]">{age} Jahre alt</p>
                <p className="font-body text-[12px] text-[#A89888]">{chineseSignName} · {getSunSign(birthDate)}</p>
              </div>
            </div>
          )}
          <button
            onClick={goNext}
            disabled={!canProceed}
            className={cn(
              'w-full py-4 rounded-full font-body text-[16px] font-medium transition-all mt-8',
              canProceed
                ? 'bg-[#9E6B47] text-white hover:bg-[#7A4E30] active:scale-[0.98]'
                : 'bg-[#E2DAD0] text-[#1A1410]/30 cursor-not-allowed'
            )}
          >
            Weiter →
          </button>
        </div>
      </div>
    )
  }

  // Phase 1, SubStep 3 — Gender + Seeking
  if (phase === 1 && subStep === 3) {
    const canProceed = !!gender && seeking.length > 0
    return (
      <div className="min-h-screen bg-[#FAF8F4]">
        <ProgressHeader phase={phase} subStep={subStep} />
        <div className="max-w-lg mx-auto px-5 pt-8 pb-24">
          {backButton}
          <p className="font-heading text-[22px] font-normal text-[#1A1410] leading-snug mb-6">Wie identifizierst du dich?</p>
          <div className="space-y-3 mb-8">
            {['Frau', 'Mann', 'Nicht-binär', 'Weitere'].map(opt => (
              <button
                key={opt}
                onClick={() => setGender(opt)}
                className={cn(
                  'w-full text-left px-5 py-4 rounded-2xl border-2 transition-all font-body text-[16px]',
                  gender === opt
                    ? 'border-[#9E6B47] bg-[#9E6B47]/5 text-[#1A1410]'
                    : 'border-[#E2DAD0] bg-white text-[#1A1410]/70 hover:border-[#9E6B47]/40'
                )}
              >
                {opt}
              </button>
            ))}
          </div>
          {gender && (
            <>
              <p className="font-heading text-[22px] font-normal text-[#1A1410] leading-snug mb-6">Wen suchst du?</p>
              <div className="flex flex-wrap gap-2 mb-8">
                {['Frauen', 'Männer', 'Alle'].map(opt => (
                  <button
                    key={opt}
                    onClick={() => setSeeking(prev => prev.includes(opt) ? prev.filter(x => x !== opt) : [...prev, opt])}
                    className={cn(
                      'px-4 py-2 rounded-full border transition-all font-body text-[14px]',
                      seeking.includes(opt)
                        ? 'bg-[#9E6B47] border-[#9E6B47] text-white'
                        : 'bg-white border-[#E2DAD0] text-[#1A1410]/70 hover:border-[#9E6B47]/40'
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </>
          )}
          <button
            onClick={goNext}
            disabled={!canProceed}
            className={cn(
              'w-full py-4 rounded-full font-body text-[16px] font-medium transition-all',
              canProceed
                ? 'bg-[#9E6B47] text-white hover:bg-[#7A4E30] active:scale-[0.98]'
                : 'bg-[#E2DAD0] text-[#1A1410]/30 cursor-not-allowed'
            )}
          >
            Weiter →
          </button>
        </div>
      </div>
    )
  }

  // Phase 1, SubStep 4 — Location
  if (phase === 1 && subStep === 4) {
    return (
      <div className="min-h-screen bg-[#FAF8F4]">
        <ProgressHeader phase={phase} subStep={subStep} />
        <div className="max-w-lg mx-auto px-5 pt-8 pb-24">
          {backButton}
          <p className="font-heading text-[22px] font-normal text-[#1A1410] leading-snug mb-6">Wo lebst du?</p>
          <input
            type="text"
            list="cities"
            placeholder="Stadt eingeben..."
            value={location}
            onChange={e => setLocation(e.target.value)}
            className="w-full px-5 py-4 rounded-2xl border-2 border-[#E2DAD0] bg-white font-body text-[16px] focus:outline-none focus:border-[#9E6B47] transition-colors"
          />
          <datalist id="cities">
            {['Berlin', 'Hamburg', 'München', 'Köln', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Leipzig', 'Dortmund', 'Essen', 'Bremen', 'Dresden', 'Hannover', 'Nürnberg', 'Duisburg', 'Bochum', 'Wuppertal', 'Bielefeld', 'Bonn', 'Münster', 'Wien', 'Zürich', 'Basel', 'Bern', 'Graz'].map(c => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <button
            onClick={goNext}
            disabled={location.trim().length <= 1}
            className={cn(
              'w-full py-4 rounded-full font-body text-[16px] font-medium transition-all mt-8',
              location.trim().length > 1
                ? 'bg-[#9E6B47] text-white hover:bg-[#7A4E30] active:scale-[0.98]'
                : 'bg-[#E2DAD0] text-[#1A1410]/30 cursor-not-allowed'
            )}
          >
            Weiter →
          </button>
        </div>
      </div>
    )
  }

  // Phase 1, SubStep 5 — Intention + RelationshipModel
  if (phase === 1 && subStep === 5) {
    const canProceed = !!intention && !!relationshipModel
    return (
      <div className="min-h-screen bg-[#FAF8F4]">
        <ProgressHeader phase={phase} subStep={subStep} />
        <div className="max-w-lg mx-auto px-5 pt-8 pb-24">
          {backButton}
          <p className="font-heading text-[22px] font-normal text-[#1A1410] leading-snug mb-6">Was suchst du gerade?</p>
          <div className="space-y-3 mb-8">
            {['Feste Partnerschaft', 'Etwas Ernstes aufbauen', 'Offen schauen'].map(opt => (
              <button
                key={opt}
                onClick={() => setIntention(opt)}
                className={cn(
                  'w-full text-left px-5 py-4 rounded-2xl border-2 transition-all font-body text-[16px]',
                  intention === opt
                    ? 'border-[#9E6B47] bg-[#9E6B47]/5 text-[#1A1410]'
                    : 'border-[#E2DAD0] bg-white text-[#1A1410]/70 hover:border-[#9E6B47]/40'
                )}
              >
                {opt}
              </button>
            ))}
          </div>
          {intention && (
            <>
              <p className="font-heading text-[22px] font-normal text-[#1A1410] leading-snug mb-6">Welches Beziehungsmodell passt zu dir?</p>
              <div className="space-y-3 mb-8">
                {['Monogam', 'Ethisch non-monogam', 'Offen für beides'].map(opt => (
                  <button
                    key={opt}
                    onClick={() => setRelationshipModel(opt)}
                    className={cn(
                      'w-full text-left px-5 py-4 rounded-2xl border-2 transition-all font-body text-[16px]',
                      relationshipModel === opt
                        ? 'border-[#9E6B47] bg-[#9E6B47]/5 text-[#1A1410]'
                        : 'border-[#E2DAD0] bg-white text-[#1A1410]/70 hover:border-[#9E6B47]/40'
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </>
          )}
          <button
            onClick={goNext}
            disabled={!canProceed}
            className={cn(
              'w-full py-4 rounded-full font-body text-[16px] font-medium transition-all',
              canProceed
                ? 'bg-[#9E6B47] text-white hover:bg-[#7A4E30] active:scale-[0.98]'
                : 'bg-[#E2DAD0] text-[#1A1410]/30 cursor-not-allowed'
            )}
          >
            Weiter →
          </button>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════════
  // PHASE 2 — BINDUNGSTYP
  // ════════════════════════════════════════════════════════════════

  // Phase 2, SubStep 0 — Intro
  if (phase === 2 && subStep === 0) {
    return (
      <div className="min-h-screen bg-[#FAF8F4]">
        <ProgressHeader phase={phase} subStep={subStep} />
        <div className="max-w-lg mx-auto px-5 pt-8 pb-24">
          {backButton}
          <h2 className="font-heading text-[32px] font-light text-[#1A1410] leading-tight mb-3">Wie liebst du?</h2>
          <p className="font-body text-[13px] font-light text-[#A89888] leading-relaxed mb-8">
            Unser Bindungsmuster entsteht in der Kindheit und prägt all unsere Beziehungen. Diese 10 Fragen helfen uns zu verstehen wie du Nähe erlebst.
          </p>
          <button
            onClick={goNext}
            className="w-full py-4 rounded-full bg-[#9E6B47] text-white font-body text-[16px] font-medium hover:bg-[#7A4E30] active:scale-[0.98] transition-all mt-4"
          >
            Test starten →
          </button>
        </div>
      </div>
    )
  }

  // Phase 2, SubSteps 1-10 — Questions
  if (phase === 2 && subStep >= 1 && subStep <= 10) {
    const qIndex = subStep - 1
    const currentScale = bindungsAnswers[qIndex] ?? 0
    return (
      <div className="min-h-screen bg-[#FAF8F4]">
        <ProgressHeader phase={phase} subStep={subStep} />
        <div className="max-w-lg mx-auto px-5 pt-8 pb-24">
          {backButton}
          <p className="font-body text-[13px] font-light text-[#A89888] mb-4">Frage {subStep} von 10</p>
          <p className="font-heading text-[22px] font-normal text-[#1A1410] leading-snug mb-8">
            {BINDUNGS_QUESTIONS[qIndex]}
          </p>
          <div className="flex justify-between gap-2 mt-4">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => handleBindungsScale(qIndex, n)}
                className={cn(
                  'flex-1 py-4 rounded-xl border-2 font-body text-[16px] font-medium transition-all',
                  currentScale === n
                    ? 'border-[#9E6B47] bg-[#9E6B47] text-white'
                    : 'border-[#E2DAD0] bg-white text-[#1A1410]/60 hover:border-[#9E6B47]/40'
                )}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="font-body text-[11px] text-[#A89888]">Stimme gar nicht zu</span>
            <span className="font-body text-[11px] text-[#A89888]">Stimme völlig zu</span>
          </div>
          {currentScale > 0 && (
            <button
              onClick={() => handleBindungsScale(qIndex, currentScale)}
              className="w-full py-4 rounded-full bg-[#9E6B47] text-white font-body text-[16px] font-medium hover:bg-[#7A4E30] active:scale-[0.98] transition-all mt-8"
            >
              Weiter →
            </button>
          )}
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════════
  // PHASE 3 — LOVE LANGUAGE
  // ════════════════════════════════════════════════════════════════

  // Phase 3, SubStep 0 — Intro
  if (phase === 3 && subStep === 0) {
    return (
      <div className="min-h-screen bg-[#FAF8F4]">
        <ProgressHeader phase={phase} subStep={subStep} />
        <div className="max-w-lg mx-auto px-5 pt-8 pb-24">
          {backButton}
          <h2 className="font-heading text-[32px] font-light text-[#1A1410] leading-tight mb-3">Wie empfängst du Liebe?</h2>
          <p className="font-body text-[13px] font-light text-[#A89888] leading-relaxed mb-8">
            Es gibt 5 verschiedene Arten Liebe zu geben und zu empfangen. Welche spricht dich am meisten an?
          </p>
          <button
            onClick={goNext}
            className="w-full py-4 rounded-full bg-[#9E6B47] text-white font-body text-[16px] font-medium hover:bg-[#7A4E30] active:scale-[0.98] transition-all mt-4"
          >
            Test starten →
          </button>
        </div>
      </div>
    )
  }

  // Phase 3, SubSteps 1-10 — A/B Questions
  if (phase === 3 && subStep >= 1 && subStep <= 10) {
    const qIndex = subStep - 1
    const currentChoice = loveAnswers[qIndex] ?? null
    const q = LOVE_QUESTIONS[qIndex]
    return (
      <div className="min-h-screen bg-[#FAF8F4]">
        <ProgressHeader phase={phase} subStep={subStep} />
        <div className="max-w-lg mx-auto px-5 pt-8 pb-24">
          {backButton}
          <p className="font-body text-[13px] font-light text-[#A89888] mb-4">Frage {subStep} von 10</p>
          <p className="font-heading text-[22px] font-normal text-[#1A1410] leading-snug mb-8">Was trifft eher auf dich zu?</p>
          <div className="space-y-3">
            {(['A', 'B'] as const).map(opt => (
              <button
                key={opt}
                onClick={() => handleLoveChoice(qIndex, opt)}
                className={cn(
                  'w-full text-left px-5 py-4 rounded-2xl border-2 transition-all font-body text-[15px]',
                  currentChoice === opt
                    ? 'border-[#9E6B47] bg-[#9E6B47]/5 text-[#1A1410]'
                    : 'border-[#E2DAD0] bg-white text-[#1A1410]/70 hover:border-[#9E6B47]/40'
                )}
              >
                {q[opt]}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════════
  // PHASE 4 — PERSÖNLICHKEIT
  // ════════════════════════════════════════════════════════════════

  // Phase 4, SubStep 0 — Intro
  if (phase === 4 && subStep === 0) {
    return (
      <div className="min-h-screen bg-[#FAF8F4]">
        <ProgressHeader phase={phase} subStep={subStep} />
        <div className="max-w-lg mx-auto px-5 pt-8 pb-24">
          {backButton}
          <h2 className="font-heading text-[32px] font-light text-[#1A1410] leading-tight mb-3">Wer bist du in einer Beziehung?</h2>
          <p className="font-body text-[13px] font-light text-[#A89888] leading-relaxed mb-8">
            Fünf Persönlichkeitsdimensionen die für Kompatibilität entscheidend sind.
          </p>
          <button
            onClick={goNext}
            className="w-full py-4 rounded-full bg-[#9E6B47] text-white font-body text-[16px] font-medium hover:bg-[#7A4E30] active:scale-[0.98] transition-all mt-4"
          >
            Test starten →
          </button>
        </div>
      </div>
    )
  }

  // Phase 4, SubSteps 1-15 — Questions
  if (phase === 4 && subStep >= 1 && subStep <= 15) {
    const qIndex = subStep - 1
    const q = PERSONALITY_QUESTIONS[qIndex]
    const currentScale = personalityAnswers[qIndex] ?? 0
    return (
      <div className="min-h-screen bg-[#FAF8F4]">
        <ProgressHeader phase={phase} subStep={subStep} />
        <div className="max-w-lg mx-auto px-5 pt-8 pb-24">
          {backButton}
          <span className="font-body text-[11px] uppercase tracking-widest text-[#9E6B47] bg-[#9E6B47]/10 px-3 py-1 rounded-full">
            {q.dim}
          </span>
          <p className="font-body text-[13px] font-light text-[#A89888] mt-4 mb-2">Frage {subStep} von 15</p>
          <p className="font-heading text-[22px] font-normal text-[#1A1410] leading-snug mb-8">
            {q.text}
          </p>
          <div className="flex justify-between gap-2 mt-4">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => handlePersonalityScale(qIndex, n)}
                className={cn(
                  'flex-1 py-4 rounded-xl border-2 font-body text-[16px] font-medium transition-all',
                  currentScale === n
                    ? 'border-[#9E6B47] bg-[#9E6B47] text-white'
                    : 'border-[#E2DAD0] bg-white text-[#1A1410]/60 hover:border-[#9E6B47]/40'
                )}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="font-body text-[11px] text-[#A89888]">Stimme gar nicht zu</span>
            <span className="font-body text-[11px] text-[#A89888]">Stimme völlig zu</span>
          </div>
          {currentScale > 0 && (
            <button
              onClick={() => handlePersonalityScale(qIndex, currentScale)}
              className="w-full py-4 rounded-full bg-[#9E6B47] text-white font-body text-[16px] font-medium hover:bg-[#7A4E30] active:scale-[0.98] transition-all mt-8"
            >
              Weiter →
            </button>
          )}
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════════
  // PHASE 5 — WERTE & DEALBREAKER
  // ════════════════════════════════════════════════════════════════

  // Phase 5, SubStep 0 — Werte
  if (phase === 5 && subStep === 0) {
    return (
      <div className="min-h-screen bg-[#FAF8F4]">
        <ProgressHeader phase={phase} subStep={subStep} />
        <div className="max-w-lg mx-auto px-5 pt-8 pb-24">
          {backButton}
          <h2 className="font-heading text-[32px] font-light text-[#1A1410] leading-tight mb-3">Was trägt dich?</h2>
          <p className="font-body text-[13px] font-light text-[#A89888] leading-relaxed mb-6">
            Wähle bis zu 5 Werte die dir wirklich wichtig sind.
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {['Achtsamkeit', 'Natur', 'Wachstum', 'Kreativität', 'Spiritualität', 'Familie', 'Abenteuer', 'Tiefe Gespräche', 'Körperlichkeit', 'Humor', 'Stille', 'Freiheit', 'Verlässlichkeit', 'Kunst', 'Reisen'].map(opt => (
              <button
                key={opt}
                onClick={() => {
                  if (werte.includes(opt)) {
                    setWerte(prev => prev.filter(x => x !== opt))
                  } else if (werte.length < 5) {
                    setWerte(prev => [...prev, opt])
                  }
                }}
                disabled={!werte.includes(opt) && werte.length >= 5}
                className={cn(
                  'px-4 py-2 rounded-full border transition-all font-body text-[14px]',
                  werte.includes(opt)
                    ? 'bg-[#9E6B47] border-[#9E6B47] text-white'
                    : 'bg-white border-[#E2DAD0] text-[#1A1410]/70 hover:border-[#9E6B47]/40',
                  !werte.includes(opt) && werte.length >= 5 && 'opacity-30 cursor-not-allowed'
                )}
              >
                {opt}
              </button>
            ))}
          </div>
          <p className="font-body text-[13px] text-[#A89888] mb-6">{werte.length}/5 ausgewählt</p>
          <button
            onClick={goNext}
            disabled={werte.length === 0}
            className={cn(
              'w-full py-4 rounded-full font-body text-[16px] font-medium transition-all mt-4',
              werte.length > 0
                ? 'bg-[#9E6B47] text-white hover:bg-[#7A4E30] active:scale-[0.98]'
                : 'bg-[#E2DAD0] text-[#1A1410]/30 cursor-not-allowed'
            )}
          >
            Weiter →
          </button>
        </div>
      </div>
    )
  }

  // Phase 5, SubStep 1 — Dealbreaker
  if (phase === 5 && subStep === 1) {
    return (
      <div className="min-h-screen bg-[#FAF8F4]">
        <ProgressHeader phase={phase} subStep={subStep} />
        <div className="max-w-lg mx-auto px-5 pt-8 pb-24">
          {backButton}
          <h2 className="font-heading text-[32px] font-light text-[#1A1410] leading-tight mb-3">Was geht wirklich nicht?</h2>
          <p className="font-body text-[13px] font-light text-[#A89888] leading-relaxed mb-6">
            Ehrlichkeit spart euch beiden Zeit. Wähle bis zu 3 Dealbreaker.
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {['Kinder gewünscht', 'Keine Kinder gewünscht', 'Rauchen', 'Fernbeziehung', 'Großer Altersunterschied', 'Haustiere', 'Starke Religiosität', 'Vegan/Vegetarisch'].map(opt => (
              <button
                key={opt}
                onClick={() => {
                  if (dealbreakers.includes(opt)) {
                    setDealbreakers(prev => prev.filter(x => x !== opt))
                  } else if (dealbreakers.length < 3) {
                    setDealbreakers(prev => [...prev, opt])
                  }
                }}
                disabled={!dealbreakers.includes(opt) && dealbreakers.length >= 3}
                className={cn(
                  'px-4 py-2 rounded-full border transition-all font-body text-[14px]',
                  dealbreakers.includes(opt)
                    ? 'bg-[#9E6B47] border-[#9E6B47] text-white'
                    : 'bg-white border-[#E2DAD0] text-[#1A1410]/70 hover:border-[#9E6B47]/40',
                  !dealbreakers.includes(opt) && dealbreakers.length >= 3 && 'opacity-30 cursor-not-allowed'
                )}
              >
                {opt}
              </button>
            ))}
          </div>
          <p className="font-body text-[13px] text-[#A89888] mb-6">{dealbreakers.length}/3 ausgewählt</p>
          <button
            onClick={goNext}
            className="w-full py-4 rounded-full bg-[#9E6B47] text-white font-body text-[16px] font-medium hover:bg-[#7A4E30] active:scale-[0.98] transition-all"
          >
            Weiter →
          </button>
        </div>
      </div>
    )
  }

  // Phase 5, SubStep 2 — Meine Welt
  if (phase === 5 && subStep === 2) {
    const MY_WORLD_CATEGORIES = [
      {
        label: 'Spiritualität & Bewusstsein',
        items: ['🧘 Yoga & Meditation', '🌿 Achtsamkeit & Minimalismus', '🔮 Astrologie & Esoterik', '✨ Human Design & Gene Keys', '🌙 Schamanismus & Naturverbundenheit', '☯️ Buddhismus & östliche Philosophie'],
      },
      {
        label: 'Körper & Sexualität',
        items: ['🔥 Tantra & bewusste Körperlichkeit', '💫 Bewusste Sexualität & sex-positiv', '🌸 Sexuelle Heilung & Embodiment', '⚡ BDSM & Kink (bewusst & konsensual)', '💃 Tanz & somatische Praktiken'],
      },
      {
        label: 'Beziehungen & Wachstum',
        items: ['💞 Polyamorie & ethische Non-Monogamie', '🤝 Beziehungsanarchie', '🧠 Psychologie & Trauma-Arbeit', '👁️ Inneres Kind & IFS', '🌱 Persönlichkeitsentwicklung'],
      },
      {
        label: 'Gemeinschaft & Werte',
        items: ['♀️ Female Empowerment & Weiblichkeit', '♂️ Male Empowerment & Männlichkeit', '🌍 Permakultur & Nachhaltigkeit', '🏡 Gemeinschaft & Intentional Living', '🎨 Kreativität & Kunst als Weg'],
      },
    ]

    return (
      <div className="min-h-screen bg-[#FAF8F4]">
        <ProgressHeader phase={phase} subStep={subStep} />
        <div className="max-w-lg mx-auto px-5 pt-6 pb-28">
          {backButton}
          <h2 className="font-heading text-[32px] font-light text-[#1A1410] leading-tight mb-2">Wo fühlst du dich zuhause?</h2>
          <p className="font-body text-[13px] font-light text-[#A89888] leading-relaxed mb-6">
            Wähle die Communities und Szenen die zu deinem Leben gehören — oder lass es offen. Es gibt kein Richtig oder Falsch.
          </p>

          <div className="space-y-6">
            {MY_WORLD_CATEGORIES.map((cat) => (
              <div key={cat.label}>
                <p className="font-body text-[11px] uppercase tracking-widest text-[#A89888] mb-3">{cat.label}</p>
                <div className="flex flex-wrap gap-2">
                  {cat.items.map((item) => (
                    <button
                      key={item}
                      onClick={() => setMyWorld(prev =>
                        prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]
                      )}
                      className={cn(
                        'px-3 py-2 rounded-full border transition-all font-body text-[13px]',
                        myWorld.includes(item)
                          ? 'bg-[#9E6B47] border-[#9E6B47] text-white'
                          : 'bg-white border-[#E2DAD0] text-[#1A1410]/70 hover:border-[#9E6B47]/40'
                      )}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={goNext}
            className="w-full py-4 rounded-full bg-[#9E6B47] text-white font-body text-[16px] font-medium hover:bg-[#7A4E30] active:scale-[0.98] transition-all mt-8"
          >
            {myWorld.length > 0 ? `${myWorld.length} Szene${myWorld.length > 1 ? 'n' : ''} gewählt →` : 'Überspringen →'}
          </button>
        </div>
      </div>
    )
  }

  // Phase 5, SubStep 3 — Intimität & Sexualität
  if (phase === 5 && subStep === 3) {
    const SEXUALITY_CATEGORIES = [
      {
        label: 'Sensualität & Verbindung',
        items: ['Sinnliche Berührung & Körpernähe', 'Tantrische Intimität', 'Slow Sex & bewusste Sexualität', 'Emotionale Tiefe vor körperlicher Nähe', 'Sexuelle Heilung & Embodiment'],
      },
      {
        label: 'Erkundung & Offenheit',
        items: ['Sex-Positiv & offen für Neues', 'Polyamorös & mehrere Verbindungen', 'Rollenspiel & Fantasien', 'BDSM & Kink (bewusst & konsensual)', 'Fetische (privat besprechen)'],
      },
      {
        label: 'Orientierung & Identität',
        items: ['Queer', 'Bisexuell', 'Pansexuell', 'Asexuell / Demisexuell', 'Non-Binary / Genderfluid'],
      },
    ]

    return (
      <div className="min-h-screen bg-[#FAF8F4]">
        <ProgressHeader phase={phase} subStep={subStep} />
        <div className="max-w-lg mx-auto px-5 pt-6 pb-28">
          {backButton}
          <h2 className="font-heading text-[32px] font-light text-[#1A1410] leading-tight mb-2">Was du zeigst siehst du auch.</h2>
          <p className="font-body text-[14px] font-light text-[#6E6560] leading-relaxed mb-2">
            Dieser Bereich ist freiwillig und funktioniert nach dem Gegenseitigkeitsprinzip: Du siehst die sexuellen Interessen anderer nur wenn du deine eigenen angibst.
          </p>
          <p className="font-body text-[12px] font-light text-[#A89888] leading-relaxed mb-6">
            Das schafft einen sicheren, respektvollen Raum für alle.
          </p>

          {/* Toggle: Teilen ja/nein */}
          <div className="bg-white rounded-2xl border border-[#E2DAD0] p-4 mb-6 flex items-center justify-between">
            <div>
              <p className="font-body text-[14px] text-[#1A1410] font-medium">Interessen teilen</p>
              <p className="font-body text-[12px] text-[#A89888]">Sichtbar für andere die auch geteilt haben</p>
            </div>
            <button
              onClick={() => setSexualityVisible(v => !v)}
              className={cn(
                'w-12 h-6 rounded-full transition-colors relative flex-shrink-0',
                sexualityVisible ? 'bg-[#9E6B47]' : 'bg-[#E2DAD0]'
              )}
            >
              <div className={cn(
                'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                sexualityVisible ? 'translate-x-6' : 'translate-x-0.5'
              )} />
            </button>
          </div>

          {sexualityVisible && (
            <div className="space-y-6">
              {SEXUALITY_CATEGORIES.map((cat) => (
                <div key={cat.label}>
                  <p className="font-body text-[11px] uppercase tracking-widest text-[#A89888] mb-3">{cat.label}</p>
                  <div className="flex flex-wrap gap-2">
                    {cat.items.map((item) => (
                      <button
                        key={item}
                        onClick={() => setSexualityInterests(prev =>
                          prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]
                        )}
                        className={cn(
                          'px-3 py-2 rounded-full border transition-all font-body text-[13px]',
                          sexualityInterests.includes(item)
                            ? 'bg-[#1A1410] border-[#1A1410] text-white'
                            : 'bg-white border-[#E2DAD0] text-[#1A1410]/70 hover:border-[#1A1410]/40'
                        )}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={goNext}
            className="w-full py-4 rounded-full bg-[#9E6B47] text-white font-body text-[16px] font-medium hover:bg-[#7A4E30] active:scale-[0.98] transition-all mt-8"
          >
            {sexualityVisible && sexualityInterests.length > 0
              ? 'Weiter →'
              : 'Überspringen →'}
          </button>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════════
  // PHASE 6 — HOROSKOP
  // ════════════════════════════════════════════════════════════════

  // Phase 6, SubStep 0 — Intro
  if (phase === 6 && subStep === 0) {
    return (
      <div className="min-h-screen bg-[#FAF8F4]">
        <ProgressHeader phase={phase} subStep={subStep} />
        <div className="max-w-lg mx-auto px-5 pt-8 pb-24">
          {backButton}
          <h2 className="font-heading text-[32px] font-light text-[#1A1410] leading-tight mb-3">Dein kosmisches Profil</h2>
          <p className="font-body text-[13px] font-light text-[#A89888] leading-relaxed mb-8">
            Optional — aber viele unserer Mitglieder finden es spannend.
          </p>
          <button
            onClick={goNext}
            className="w-full py-4 rounded-full bg-[#9E6B47] text-white font-body text-[16px] font-medium hover:bg-[#7A4E30] active:scale-[0.98] transition-all"
          >
            Weiter →
          </button>
          <button
            onClick={() => { setPhase(7); setSubStep(0); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            className="font-body text-sm text-[#A89888] mt-3 w-full text-center"
          >
            Phase überspringen
          </button>
        </div>
      </div>
    )
  }

  // Phase 6, SubStep 1 — Sonnenzeichen
  if (phase === 6 && subStep === 1) {
    return (
      <div className="min-h-screen bg-[#FAF8F4]">
        <ProgressHeader phase={phase} subStep={subStep} />
        <div className="max-w-lg mx-auto px-5 pt-8 pb-24">
          {backButton}
          <p className="font-heading text-[22px] font-normal text-[#1A1410] leading-snug mb-6">Was ist dein Sternzeichen?</p>
          <select
            value={sunSign}
            onChange={e => setSunSign(e.target.value)}
            className="w-full px-5 py-4 rounded-2xl border-2 border-[#E2DAD0] bg-white font-body text-[16px] focus:outline-none focus:border-[#9E6B47] transition-colors"
          >
            <option value="">Bitte wählen</option>
            {STERNZEICHEN.map(z => <option key={z} value={z}>{z}</option>)}
          </select>
          <button
            onClick={goNext}
            className="w-full py-4 rounded-full bg-[#9E6B47] text-white font-body text-[16px] font-medium hover:bg-[#7A4E30] active:scale-[0.98] transition-all mt-8"
          >
            Weiter →
          </button>
        </div>
      </div>
    )
  }

  // Phase 6, SubStep 2 — Aszendent
  if (phase === 6 && subStep === 2) {
    return (
      <div className="min-h-screen bg-[#FAF8F4]">
        <ProgressHeader phase={phase} subStep={subStep} />
        <div className="max-w-lg mx-auto px-5 pt-8 pb-24">
          {backButton}
          <p className="font-heading text-[22px] font-normal text-[#1A1410] leading-snug mb-3">Kennst du deinen Aszendenten?</p>
          <p className="font-body text-[13px] font-light text-[#A89888] leading-relaxed mb-2">
            Deinen Aszendenten findest du auf astro.com — du brauchst deine genaue Geburtszeit und den Geburtsort.
          </p>
          <a href="https://www.astro.com" target="_blank" rel="noreferrer" className="text-[#9E6B47] underline text-sm font-body block mb-6">
            Auf astro.com nachschauen →
          </a>
          <select
            value={ascendant}
            onChange={e => setAscendant(e.target.value)}
            className="w-full px-5 py-4 rounded-2xl border-2 border-[#E2DAD0] bg-white font-body text-[16px] focus:outline-none focus:border-[#9E6B47] transition-colors"
          >
            <option value="">Bitte wählen (optional)</option>
            {STERNZEICHEN.map(z => <option key={z} value={z}>{z}</option>)}
          </select>
          <button
            onClick={goNext}
            className="w-full py-4 rounded-full bg-[#9E6B47] text-white font-body text-[16px] font-medium hover:bg-[#7A4E30] active:scale-[0.98] transition-all mt-8"
          >
            Weiter →
          </button>
          <button
            onClick={goNext}
            className="font-body text-sm text-[#A89888] mt-3 w-full text-center"
          >
            Überspringen
          </button>
        </div>
      </div>
    )
  }

  // Phase 6, SubStep 3 — Chinesisches Zeichen
  if (phase === 6 && subStep === 3) {
    const czData = chineseZodiac ? CHINESE_ZODIAC_DATA[chineseZodiac] : null
    return (
      <div className="min-h-screen bg-[#FAF8F4]">
        <ProgressHeader phase={phase} subStep={subStep} />
        <div className="max-w-lg mx-auto px-5 pt-8 pb-24">
          {backButton}
          <p className="font-heading text-[22px] font-normal text-[#1A1410] leading-snug mb-6">Dein chinesisches Tierzeichen</p>
          {czData ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">{czData.emoji}</div>
              <h2 className="font-heading text-[32px] font-light text-[#1A1410] mb-4">{chineseZodiac}</h2>
              <p className="font-body text-[15px] font-light text-[#6E6560] leading-relaxed">{czData.desc}</p>
            </div>
          ) : (
            <p className="font-body text-[15px] text-[#A89888]">Bitte trage dein Geburtsdatum in Phase 1 ein um dein chinesisches Zeichen zu sehen.</p>
          )}
          <button
            onClick={goNext}
            className="w-full py-4 rounded-full bg-[#9E6B47] text-white font-body text-[16px] font-medium hover:bg-[#7A4E30] active:scale-[0.98] transition-all mt-8"
          >
            Weiter →
          </button>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════════
  // PHASE 7 — PROFIL AUFBAUEN
  // ════════════════════════════════════════════════════════════════

  // Phase 7, SubStep 0 — Fotos
  if (phase === 7 && subStep === 0) {
    return (
      <div className="min-h-screen bg-[#FAF8F4]">
        <ProgressHeader phase={phase} subStep={subStep} />
        <div className="max-w-lg mx-auto px-5 pt-8 pb-24">
          {backButton}
          <h2 className="font-heading text-[32px] font-light text-[#1A1410] leading-tight mb-3">Deine Fotos</h2>
          <p className="font-body text-[13px] font-light text-[#A89888] leading-relaxed mb-6">
            Lade mindestens ein Foto hoch. Das erste wird dein Hauptfoto.
          </p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="relative aspect-[3/4]">
                {photos[i] ? (
                  <div
                    className="relative w-full h-full rounded-2xl overflow-hidden"
                    draggable
                    onDragStart={() => handleDragStart(i)}
                    onDragOver={e => handleDragOver(e, i)}
                    onDrop={handleDrop}
                  >
                    <img src={photos[i].url} alt="" className="w-full h-full object-cover" />
                    {i === 0 && (
                      <span className="absolute top-2 left-2 bg-[#9E6B47] text-white text-[10px] font-body px-2 py-0.5 rounded-full">
                        Hauptfoto
                      </span>
                    )}
                    <button
                      onClick={() => removePhoto(i)}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-full rounded-2xl border-2 border-dashed border-[#E2DAD0] flex flex-col items-center justify-center gap-2 hover:border-[#9E6B47]/50 transition-colors bg-white"
                  >
                    <Plus className="w-6 h-6 text-[#A89888]" />
                    <span className="font-body text-[12px] text-[#A89888]">{i === 0 ? 'Hauptfoto' : 'Foto hinzufügen'}</span>
                  </button>
                )}
              </div>
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
          {uploadingPhoto && (
            <p className="font-body text-[13px] text-[#A89888] text-center mb-4">Lädt hoch...</p>
          )}
          {photos.slice(1).map((photo, idx) => (
            <div key={idx + 1} className="flex items-start gap-3 mb-3">
              <img src={photo.url} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" alt="" />
              <input
                type="text"
                placeholder="Bildunterschrift (optional)..."
                maxLength={100}
                value={photo.caption ?? ''}
                onChange={e => updateCaption(idx + 1, e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#E2DAD0] bg-white font-body text-[14px] focus:outline-none focus:border-[#9E6B47]"
              />
            </div>
          ))}
          <button
            onClick={goNext}
            disabled={photos.length === 0}
            className={cn(
              'w-full py-4 rounded-full font-body text-[16px] font-medium transition-all mt-4',
              photos.length > 0
                ? 'bg-[#9E6B47] text-white hover:bg-[#7A4E30] active:scale-[0.98]'
                : 'bg-[#E2DAD0] text-[#1A1410]/30 cursor-not-allowed'
            )}
          >
            Weiter →
          </button>
        </div>
      </div>
    )
  }

  // Phase 7, SubStep 1 — Prompts
  if (phase === 7 && subStep === 1) {
    const allAnswered = selectedPrompts.length >= 2 && selectedPrompts.every(q => (promptAnswers[q] ?? '').trim().length >= 3)

    if (promptPhase === 'answer') {
      return (
        <div className="min-h-screen bg-[#FAF8F4]">
          <ProgressHeader phase={phase} subStep={subStep} />
          <div className="max-w-lg mx-auto px-5 pt-8 pb-24">
            <button
              onClick={() => setPromptPhase('select')}
              className="font-body text-sm text-[#A89888] mb-6 flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" /> Zurück
            </button>
            <h2 className="font-heading text-[32px] font-light text-[#1A1410] leading-tight mb-3">Deine Antworten</h2>
            <p className="font-body text-[13px] font-light text-[#A89888] leading-relaxed mb-6">
              Schreib kurz und ehrlich — max. 150 Zeichen.
            </p>
            <div className="space-y-6 mb-8">
              {selectedPrompts.map(q => (
                <div key={q}>
                  <p className="font-body text-[14px] text-[#9E6B47] font-medium mb-2">{q}</p>
                  <textarea
                    value={promptAnswers[q] ?? ''}
                    onChange={e => {
                      if (e.target.value.length > 150) return
                      setPromptAnswers(prev => ({ ...prev, [q]: e.target.value }))
                    }}
                    rows={3}
                    placeholder="Deine Antwort..."
                    className="w-full px-4 py-3 rounded-2xl border-2 border-[#E2DAD0] bg-white font-body text-[14px] focus:outline-none focus:border-[#9E6B47] resize-none transition-colors"
                  />
                  <p className="text-right font-body text-[11px] text-[#A89888] mt-1">{(promptAnswers[q] ?? '').length}/150</p>
                </div>
              ))}
            </div>
            <button
              onClick={goNext}
              disabled={!allAnswered}
              className={cn(
                'w-full py-4 rounded-full font-body text-[16px] font-medium transition-all',
                allAnswered
                  ? 'bg-[#9E6B47] text-white hover:bg-[#7A4E30] active:scale-[0.98]'
                  : 'bg-[#E2DAD0] text-[#1A1410]/30 cursor-not-allowed'
              )}
            >
              Weiter →
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-[#FAF8F4]">
        <ProgressHeader phase={phase} subStep={subStep} />
        <div className="max-w-lg mx-auto px-5 pt-8 pb-24">
          {backButton}
          <h2 className="font-heading text-[32px] font-light text-[#1A1410] leading-tight mb-3">Deine Prompts</h2>
          <p className="font-body text-[13px] font-light text-[#A89888] leading-relaxed mb-6">
            Wähle 2–3 Fragen die zu dir passen.
          </p>
          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
            {Object.keys(PROMPT_CATALOG).map(cat => (
              <button
                key={cat}
                onClick={() => setActivePromptCategory(cat)}
                className={cn(
                  'px-4 py-2 rounded-full border whitespace-nowrap font-body text-[13px] transition-all flex-shrink-0',
                  activePromptCategory === cat
                    ? 'bg-[#9E6B47] border-[#9E6B47] text-white'
                    : 'bg-white border-[#E2DAD0] text-[#1A1410]/70 hover:border-[#9E6B47]/40'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="space-y-2 mb-6">
            {(PROMPT_CATALOG[activePromptCategory] ?? []).map(q => {
              const active = selectedPrompts.includes(q)
              const maxReached = selectedPrompts.length >= 3
              return (
                <button
                  key={q}
                  disabled={maxReached && !active}
                  onClick={() => setSelectedPrompts(prev =>
                    prev.includes(q) ? prev.filter(x => x !== q) : maxReached ? prev : [...prev, q]
                  )}
                  className={cn(
                    'w-full text-left px-5 py-4 rounded-2xl border-2 transition-all font-body text-[15px]',
                    active
                      ? 'border-[#9E6B47] bg-[#9E6B47]/5 text-[#1A1410]'
                      : 'border-[#E2DAD0] bg-white text-[#1A1410]/70 hover:border-[#9E6B47]/40',
                    maxReached && !active && 'opacity-30 cursor-not-allowed'
                  )}
                >
                  {q}
                </button>
              )
            })}
          </div>
          <p className="font-body text-[13px] text-[#A89888] mb-6">{selectedPrompts.length}/3 ausgewählt</p>
          <button
            onClick={() => setPromptPhase('answer')}
            disabled={selectedPrompts.length < 2}
            className={cn(
              'w-full py-4 rounded-full font-body text-[16px] font-medium transition-all',
              selectedPrompts.length >= 2
                ? 'bg-[#9E6B47] text-white hover:bg-[#7A4E30] active:scale-[0.98]'
                : 'bg-[#E2DAD0] text-[#1A1410]/30 cursor-not-allowed'
            )}
          >
            Weiter →
          </button>
          <button
            onClick={goNext}
            className="font-body text-sm text-[#A89888] mt-3 w-full text-center"
          >
            Überspringen
          </button>
        </div>
      </div>
    )
  }

  // Phase 7, SubStep 2 — Audio
  if (phase === 7 && subStep === 2) {
    return (
      <div className="min-h-screen bg-[#FAF8F4]">
        <ProgressHeader phase={phase} subStep={subStep} />
        <div className="max-w-lg mx-auto px-5 pt-8 pb-24">
          {backButton}
          <h2 className="font-heading text-[32px] font-light text-[#1A1410] leading-tight mb-3">Deine Stimme</h2>
          <p className="font-body text-[13px] font-light text-[#A89888] leading-relaxed mb-6">
            Optional: Lass andere deine Stimme hören. Max. 30 Sekunden.
          </p>
          <div className="rounded-2xl bg-[#F6F2EC] border border-[#E2DAD0] p-5 mb-8">
            <p className="font-heading text-[18px] font-light text-[#1A1410] leading-snug">
              „Was möchtest du dass jemand über dich weiß bevor ihr euch begegnet?"
            </p>
          </div>
          <div className="flex flex-col items-center gap-4 mb-8">
            {!audioUrl ? (
              <>
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={cn(
                    'w-20 h-20 rounded-full flex items-center justify-center text-white shadow-md transition-colors',
                    isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-[#9E6B47] hover:bg-[#7A4E30]'
                  )}
                >
                  <Mic className="w-8 h-8" />
                </button>
                {isRecording && (
                  <p className="font-body text-sm text-red-500 font-medium">{recordingSeconds}s verbleibend</p>
                )}
                {!isRecording && (
                  <p className="font-body text-sm text-[#1A1410]/50">Drücke zum Aufnehmen (max. 30 Sek.)</p>
                )}
              </>
            ) : (
              <div className="w-full space-y-3">
                <audio src={audioUrl} controls className="w-full rounded-xl" />
                <button
                  onClick={() => { setAudioBlob(null); setAudioUrl(''); setAudioPromptUrl('') }}
                  className="w-full px-4 py-2 rounded-full border border-[#E2DAD0] text-sm font-body text-[#1A1410]/60 hover:border-[#9E6B47]/40 transition-colors"
                >
                  Neue Aufnahme
                </button>
              </div>
            )}
          </div>
          <button
            onClick={handleFinish}
            className="w-full py-4 rounded-full bg-[#9E6B47] text-white font-body text-[16px] font-medium hover:bg-[#7A4E30] active:scale-[0.98] transition-all"
          >
            Profil fertigstellen →
          </button>
          <button
            onClick={handleFinish}
            className="font-body text-sm text-[#A89888] mt-3 w-full text-center"
          >
            Überspringen
          </button>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════════
  // PHASE 8 — ERGEBNIS
  // ════════════════════════════════════════════════════════════════

  // Phase 8, SubStep 0 — Loading
  if (phase === 8 && subStep === 0) {
    return (
      <div className="min-h-screen bg-[#FAF8F4] flex flex-col items-center justify-center px-5">
        <SajaLogo className="h-10 w-auto mb-12" />
        <div className="relative w-16 h-16 mb-8">
          <div className="absolute inset-0 rounded-full border-2 border-[#E2DAD0]" />
          <div className="absolute inset-0 rounded-full border-2 border-[#9E6B47] border-t-transparent animate-spin" />
        </div>
        <p className="font-heading text-[22px] font-light text-[#1A1410] text-center leading-snug">
          Wir stellen dein Saja-Profil zusammen...
        </p>
        <p className="font-body text-[14px] font-light text-[#A89888] text-center mt-3">
          Einen Moment bitte
        </p>
      </div>
    )
  }

  // Phase 8, SubStep 1 — Bindungstyp Result
  if (phase === 8 && subStep === 1) {
    const safeResult = bindungsResult || 'Sicher gebunden'
    const content = BINDUNG_CONTENT[safeResult] ?? BINDUNG_CONTENT['Sicher gebunden']
    return (
      <div className="min-h-screen bg-[#FAF8F4]">
        <ProgressHeader phase={phase} subStep={subStep} />
        <div className="max-w-lg mx-auto px-5 pt-8 pb-24">
          <div className="text-center pt-8">
            <div className="text-7xl mb-6">{content.emoji}</div>
            <p className="font-body text-[12px] uppercase tracking-widest text-[#9E6B47] mb-4">Dein Bindungstyp</p>
            <h2 className="font-heading text-[36px] font-light text-[#1A1410] mb-6 leading-tight">{content.title}</h2>
            <p className="font-body text-[16px] font-light text-[#6E6560] leading-relaxed text-justify">{content.text}</p>
          </div>
          <button
            onClick={goNext}
            className="w-full py-4 rounded-full bg-[#9E6B47] text-white font-body text-[16px] font-medium hover:bg-[#7A4E30] active:scale-[0.98] transition-all mt-12"
          >
            Weiter →
          </button>
        </div>
      </div>
    )
  }

  // Phase 8, SubStep 2 — Love Language Result
  if (phase === 8 && subStep === 2) {
    const safePrimary = lovePrimary || 'Quality Time'
    const safeSecondary = loveSecondary || ''
    const primaryContent = LOVE_CONTENT[safePrimary] ?? LOVE_CONTENT['Quality Time']
    return (
      <div className="min-h-screen bg-[#FAF8F4]">
        <ProgressHeader phase={phase} subStep={subStep} />
        <div className="max-w-lg mx-auto px-5 pt-8 pb-24">
          {backButton}
          <div className="text-center pt-8">
            <p className="font-body text-[12px] uppercase tracking-widest text-[#9E6B47] mb-4">Deine Liebessprache</p>
            <div className="text-7xl mb-4">{primaryContent.emoji}</div>
            <h2 className="font-heading text-[36px] font-light text-[#1A1410] mb-2">{safePrimary}</h2>
            <p className="font-body text-[16px] font-light text-[#6E6560] leading-relaxed text-justify mb-8">{primaryContent.desc}</p>
            {safeSecondary && LOVE_CONTENT[safeSecondary] && (
              <div className="bg-white rounded-2xl p-5 border border-[#E2DAD0] text-left">
                <p className="font-body text-[12px] uppercase tracking-widest text-[#A89888] mb-2">Auch wichtig für dich</p>
                <p className="font-body text-[16px] text-[#1A1410]">{LOVE_CONTENT[safeSecondary].emoji} {safeSecondary}</p>
              </div>
            )}
          </div>
          <button
            onClick={goNext}
            className="w-full py-4 rounded-full bg-[#9E6B47] text-white font-body text-[16px] font-medium hover:bg-[#7A4E30] active:scale-[0.98] transition-all mt-12"
          >
            Weiter →
          </button>
        </div>
      </div>
    )
  }

  // Phase 8, SubStep 3 — Personality Radar
  if (phase === 8 && subStep === 3) {
    const labels: Record<string, string> = {
      openness: 'Offenheit',
      conscientiousness: 'Gewissenhaftigkeit',
      agreeableness: 'Verträglichkeit',
      stability: 'Stabilität',
      extraversion: 'Extraversion',
    }
    return (
      <div className="min-h-screen bg-[#FAF8F4]">
        <ProgressHeader phase={phase} subStep={subStep} />
        <div className="max-w-lg mx-auto px-5 pt-8 pb-24">
          {backButton}
          <div className="pt-8">
            <p className="font-body text-[12px] uppercase tracking-widest text-[#9E6B47] text-center mb-2">Deine Persönlichkeit</p>
            <h2 className="font-heading text-[32px] font-light text-[#1A1410] text-center mb-8">Deine Stärken in der Beziehung</h2>
            <RadarChart scores={personalityScores} />
            <div className="grid grid-cols-2 gap-3 mt-8">
              {Object.entries(personalityScores).map(([key, val]) => (
                <div key={key} className="bg-white rounded-2xl p-4 border border-[#E2DAD0]">
                  <p className="font-body text-[12px] text-[#A89888] mb-1">{labels[key] ?? key}</p>
                  <p className="font-heading text-[24px] text-[#9E6B47]">{val}%</p>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={goNext}
            className="w-full py-4 rounded-full bg-[#9E6B47] text-white font-body text-[16px] font-medium hover:bg-[#7A4E30] active:scale-[0.98] transition-all mt-8"
          >
            Weiter →
          </button>
        </div>
      </div>
    )
  }

  // Phase 8, SubStep 4 — Full Profile Overview
  if (phase === 8 && subStep === 4) {
    const safeResult = bindungsResult || 'Sicher gebunden'
    const safePrimary = lovePrimary || 'Quality Time'
    const badgeItems = [
      { label: 'Bindungstyp', value: safeResult },
      { label: 'Liebessprache', value: safePrimary },
      sunSign ? { label: 'Sternzeichen', value: sunSign } : null,
      ascendant ? { label: 'Aszendent', value: `↑ ${ascendant}` } : null,
      chineseZodiac ? { label: 'Chinesisches Zeichen', value: `${CHINESE_ZODIAC_DATA[chineseZodiac]?.emoji ?? ''} ${chineseZodiac}` } : null,
    ].filter(Boolean) as Array<{ label: string; value: string }>

    return (
      <div className="min-h-screen bg-[#FAF8F4]">
        <ProgressHeader phase={phase} subStep={subStep} />
        <div className="max-w-lg mx-auto px-5 pt-8 pb-24">
          {backButton}
          <div className="pt-8">
            <p className="font-body text-[12px] uppercase tracking-widest text-[#9E6B47] text-center mb-2">Dein Profil</p>
            <h2 className="font-heading text-[32px] font-light text-[#1A1410] text-center mb-3">So sehen dich andere.</h2>
            <p className="font-body text-[14px] font-light text-[#A89888] text-center mb-8">Das erscheint auf deinem Profil wenn andere es öffnen.</p>
            <div className="space-y-4">
              {badgeItems.map(item => (
                <div key={item.label} className="flex items-center justify-between py-3 border-b border-[#F6F2EC]">
                  <span className="font-body text-[14px] text-[#A89888]">{item.label}</span>
                  <span className="font-body text-[14px] font-medium text-[#1A1410]">{item.value}</span>
                </div>
              ))}
              {werte.length > 0 && (
                <div className="pt-2">
                  <p className="font-body text-[14px] text-[#A89888] mb-3">Deine Werte</p>
                  <div className="flex flex-wrap gap-2">
                    {werte.map(w => (
                      <span key={w} className="px-3 py-1.5 rounded-full bg-[#9E6B47]/10 text-[#9E6B47] font-body text-[13px]">{w}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={goNext}
            className="w-full py-4 rounded-full bg-[#9E6B47] text-white font-body text-[16px] font-medium hover:bg-[#7A4E30] active:scale-[0.98] transition-all mt-8"
          >
            Weiter →
          </button>
        </div>
      </div>
    )
  }

  // Phase 8, SubStep 5 — Compatibility + Finish
  if (phase === 8 && subStep === 5) {
    const safeResult = bindungsResult || 'Sicher gebunden'
    const compatText = COMPAT_TEXT[safeResult] ?? COMPAT_TEXT['Sicher gebunden']

    function handleDiscoverClick() {
      autoSave()
      localStorage.removeItem('saja_onboarding_progress')
      router.push('/discover')
    }

    return (
      <div className="min-h-screen bg-[#FAF8F4]">
        <ProgressHeader phase={phase} subStep={subStep} />
        <div className="max-w-lg mx-auto px-5 pt-8 pb-24">
          {backButton}
          <div className="pt-8 text-center">
            <div className="text-5xl mb-6">✨</div>
            <p className="font-body text-[12px] uppercase tracking-widest text-[#9E6B47] mb-4">Kompatibilität</p>
            <h2 className="font-heading text-[32px] font-light text-[#1A1410] mb-6">Mit wem harmonierst du?</h2>
            <p className="font-body text-[16px] font-light text-[#6E6560] leading-relaxed text-justify mb-12">
              {compatText}
            </p>
            <button
              onClick={handleDiscoverClick}
              className="w-full py-4 rounded-full bg-[#9E6B47] text-white font-body text-[16px] font-medium hover:bg-[#7A4E30] active:scale-[0.98] transition-all"
            >
              Saja entdecken →
            </button>
            <p className="font-body text-[13px] text-[#A89888] mt-4">Dein Profil ist jetzt sichtbar.</p>
          </div>
        </div>
      </div>
    )
  }

  // Fallback
  return (
    <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-[#9E6B47] border-t-transparent animate-spin" />
    </div>
  )
}
