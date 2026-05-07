'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import {
  Heart, X, MapPin, Briefcase, Sparkles, SlidersHorizontal, RotateCcw,
  Search, ChevronDown, Lock, Mic, Ruler, CornerUpLeft, Play, Pause,
} from 'lucide-react'
import { photoUrl, calculateAge } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import type { Profile, Light } from '@/types'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { SajaCircleAnimation } from '@/components/ui/SajaCircleAnimation'
import { SajaLogo } from '@/components/ui/SajaLogo'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  initialProfiles: Profile[]
  currentUserId: string
  isInConnection: boolean
  connectionId?: string
  tier: 'free' | 'membership' | 'premium'
  viewerSexualityVisible: boolean
  viewerProfile?: Profile | null
  onboardingPhase?: number
  serendipityIds?: string[]
  trialActive?: boolean
  trialDaysLeft?: number
  receivedLights?: Light[]
}

// ─── Matching Algorithm ───────────────────────────────────────────────────────

const BINDUNG_COMPAT: Record<string, Record<string, number>> = {
  'Sicher':                  { 'Sicher': 1.0, 'Ängstlich-präoccupiert': 0.8, 'Vermeidend-distanziert': 0.7, 'Desorganisiert': 0.6 },
  'Ängstlich-präoccupiert':  { 'Sicher': 0.8, 'Ängstlich-präoccupiert': 0.3, 'Vermeidend-distanziert': 0.2, 'Desorganisiert': 0.3 },
  'Vermeidend-distanziert':  { 'Sicher': 0.7, 'Ängstlich-präoccupiert': 0.2, 'Vermeidend-distanziert': 0.3, 'Desorganisiert': 0.3 },
  'Desorganisiert':          { 'Sicher': 0.6, 'Ängstlich-präoccupiert': 0.3, 'Vermeidend-distanziert': 0.3, 'Desorganisiert': 0.4 },
}

function scoreProfile(p: Profile, viewer: Profile): number {
  let score = 0
  // 1. Intention match (40 pts)
  if (viewer.intention && p.intention === viewer.intention) score += 40
  // 2. Bindungstyp compatibility (up to 30 pts)
  if (viewer.bindungstyp && p.bindungstyp) {
    const compat = BINDUNG_COMPAT[viewer.bindungstyp]?.[p.bindungstyp] ?? 0
    score += Math.round(compat * 30)
  }
  // 3. Emotional capacity similarity (20 pts)
  if (viewer.emotional_capacity && p.emotional_capacity === viewer.emotional_capacity) score += 20
  // 4. Values overlap (up to 20 pts)
  if (viewer.werte?.length && p.werte?.length) {
    const overlap = viewer.werte.filter((w) => p.werte.includes(w)).length
    score += Math.min(overlap * 4, 20)
  }
  return score
}

const REVISIT_QUESTIONS = [
  'Was bedeutet für dich gerade echte Verbindung?',
  'Woran merkst du dass du dich sicher fühlst?',
  'Was hoffst du aus dieser Begegnung mitzunehmen?',
  'Was beschäftigt dich gerade wirklich?',
  'Wie geht es dir heute — ehrlich?',
]

interface Filters {
  ageMin: number
  ageMax: number
  distanceKm: number
  locationQuery: string
  intentions: string[]
  relationshipModels: string[]
  hasChildren: string[]
  smoking: string[]
  drugs: string[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DISTANCE_OPTIONS = [
  { label: 'Egal', value: 0 },
  { label: '< 25 km', value: 25 },
  { label: '< 50 km', value: 50 },
  { label: '< 100 km', value: 100 },
  { label: '< 200 km', value: 200 },
]

const INTENTION_OPTIONS = [
  'Ernsthafte Beziehung',
  'Freundschaft & mehr',
  'Bewusstes Dating',
  'Offenes Erkunden',
]

const RELATIONSHIP_OPTIONS = [
  'Monogam',
  'Polyamorös',
  'Solo-Poly',
  'Offen',
  'Noch unsicher',
]

const DEFAULT_FILTERS: Filters = {
  ageMin: 18,
  ageMax: 100,
  distanceKm: 0,
  locationQuery: '',
  intentions: [],
  relationshipModels: [],
  hasChildren: [],
  smoking: [],
  drugs: [],
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function countActiveFilters(f: Filters): number {
  let n = 0
  if (f.ageMin !== DEFAULT_FILTERS.ageMin || f.ageMax !== DEFAULT_FILTERS.ageMax) n++
  if (f.distanceKm !== 0 || f.locationQuery.trim()) n++
  if (f.intentions.length) n++
  if (f.relationshipModels.length) n++
  if (f.hasChildren.length) n++
  if (f.smoking.length) n++
  if (f.drugs.length) n++
  return n
}

function toggle(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ChipGroup({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: string[]
  selected: string[]
  onChange: (val: string[]) => void
}) {
  return (
    <div>
      <p className="text-xs font-medium text-[#6B6058] uppercase tracking-wider mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(toggle(selected, opt))}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm border transition-all',
              selected.includes(opt)
                ? 'bg-[#6B7B5A] border-[#6B7B5A] text-[#F2EBE2]'
                : 'bg-[#F2EBE2] border-[rgba(44,26,14,0.12)] text-[#9A8A7A] hover:border-[rgba(44,26,14,0.30)]',
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

function PersonalityBar({
  leftLabel,
  rightLabel,
  value,
}: {
  leftLabel: string
  rightLabel: string
  value: number
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-[#6B6058]">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
      <div className="h-2 bg-[rgba(44,26,14,0.07)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${value}%`, background: 'rgba(107,123,90,0.60)' }}
        />
      </div>
    </div>
  )
}

/** Inline audio player for the audio prompt row */
function AudioPlayer({ url }: { url: string }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)

  function handleToggle() {
    const el = audioRef.current
    if (!el) return
    if (playing) {
      el.pause()
      setPlaying(false)
    } else {
      el.play().catch(() => {})
      setPlaying(true)
    }
  }

  return (
    <div className="flex items-center gap-3 px-5 py-4 border-t border-[rgba(47,74,60,0.10)]">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio
        ref={audioRef}
        src={url}
        onEnded={() => setPlaying(false)}
        preload="none"
      />
      <button
        onClick={handleToggle}
        className="w-10 h-10 rounded-full flex items-center justify-center shadow flex-shrink-0 hover:opacity-90 transition-all active:scale-95"
        style={{ background: '#6B7B5A' }}
      >
        {playing ? (
          <Pause className="w-4 h-4 text-white" />
        ) : (
          <Play className="w-4 h-4 text-white translate-x-0.5" />
        )}
      </button>
      <div className="flex-1">
        <p className="text-sm font-medium text-[#2C1A0E] mb-1">Sprach-Intro anhören</p>
        <div className="flex items-end gap-0.5 h-4">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'w-0.5 rounded-full transition-all',
                playing ? 'animate-pulse' : '',
              )}
              style={{
                background: playing ? '#6B7B5A' : 'rgba(107,123,90,0.30)',
                height: `${28 + Math.sin(i * 0.85) * 48 + Math.cos(i * 1.3) * 18}%`,
                animationDelay: `${i * 50}ms`,
              }}
            />
          ))}
        </div>
      </div>
      <Mic className="w-4 h-4 flex-shrink-0" style={{ color: '#9A8A7A' }} />
    </div>
  )
}

/** Single prompt block */
function PromptBlock({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="px-4 py-4 border-t border-[rgba(44,26,14,0.10)]">
      <div className="rounded-xl px-4 py-4 border-l-[3px]" style={{ background: 'rgba(44,26,14,0.04)', borderLeftColor: '#6B7B5A' }}>
        <p className="text-[11px] text-[#9A8A7A] uppercase tracking-widest mb-2">{question}</p>
        <p className="font-heading text-xl italic text-[#2C1A0E] leading-snug text-justify">{answer}</p>
      </div>
    </div>
  )
}

/** Additional photo with optional caption underneath */
function PhotoWithCaption({ photo, alt }: { photo: { url: string; path: string; caption?: string }; alt: string }) {
  const url = photoUrl(photo)
  if (!url) return null
  return (
    <div className="mx-3 mt-3">
      <div className="rounded-3xl overflow-hidden" style={{ height: '60vh' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={alt} className="w-full h-full object-cover" draggable={false} />
      </div>
      {photo.caption && (
        <p className="px-2 pt-2.5 text-sm text-[#6B6058] italic leading-relaxed text-justify">{photo.caption}</p>
      )}
    </div>
  )
}

// ─── Phase 2 Overlay ─────────────────────────────────────────────────────────

const WERTE_OPTIONS = ['Ehrlichkeit', 'Wachstum', 'Tiefe', 'Freiheit', 'Fürsorge', 'Präsenz', 'Verletzlichkeit', 'Stabilität', 'Abenteuer', 'Spiritualität', 'Humor', 'Stille']
const INTEREST_OPTIONS = ['Yoga', 'Meditation', 'Musik', 'Kunst', 'Natur', 'Reisen', 'Lesen', 'Kochen', 'Sport', 'Film', 'Tanzen', 'Schreiben', 'Philosophie', 'Psychologie']
const MY_WORLD_OPTIONS = ['Hochsensibel', 'Empath', 'Introvertiert', 'Extrovertiert', 'Nomadisch', 'Vegan', 'Elternteil', 'Unternehmer', 'Kreativer', 'Heilpraktiker', 'Therapeut']

function Phase2Overlay({ userId, onComplete, onDismiss }: { userId: string; onComplete: () => void; onDismiss: () => void }) {
  const supabase = createClient()
  const [step, setStep] = useState<'intro' | 1 | 2 | 3 | 4 | 5 | 6>('intro')
  const [saving, setSaving] = useState(false)
  const [werte, setWerte] = useState<string[]>([])
  const [bio, setBio] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [myWorld, setMyWorld] = useState<string[]>([])
  const [introvert, setIntrovert] = useState(50)
  const [spontan, setSpontan] = useState(50)
  const [rational, setRational] = useState(50)
  const [prompts, setPrompts] = useState<Array<{ question: string; answer: string }>>([
    { question: 'Was ich suche um wirklich anzukommen', answer: '' },
    { question: 'Wie ich merke dass jemand wirklich da ist', answer: '' },
  ])

  async function save() {
    setSaving(true)
    await supabase.from('profiles').update({
      werte,
      bio: bio.trim() || null,
      interests,
      my_world: myWorld,
      introvert_extrovert: introvert,
      spontan_strukturiert: spontan,
      rational_emotional: rational,
      prompts: prompts.filter(p => p.answer.trim()),
      onboarding_phase: 2,
    }).eq('user_id', userId)
    setSaving(false)
    onComplete()
  }

  const totalSteps = 6

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#EAE0D5' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        {step !== 'intro' && (
          <button onClick={() => setStep(step === 1 ? 'intro' : (step as number) - 1 as any)} className="text-[rgba(44,26,14,0.50)] hover:text-[#2C1A0E] transition-colors">
            ← Zurück
          </button>
        )}
        {step === 'intro' && <div />}
        <button onClick={onDismiss} className="text-[rgba(44,26,14,0.30)] hover:text-[rgba(44,26,14,0.60)] transition-colors text-sm">
          Später
        </button>
      </div>

      {/* Progress */}
      {step !== 'intro' && (
        <div className="px-5 mb-4">
          <div className="h-0.5 bg-[rgba(44,26,14,0.12)] rounded-full overflow-hidden">
            <div className="h-full bg-[#6B7B5A] rounded-full transition-all duration-500" style={{ width: `${((step as number) / totalSteps) * 100}%` }} />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-5 pb-32">
        {/* Intro */}
        {step === 'intro' && (
          <div className="flex flex-col items-center justify-center min-h-full text-center py-16">
            <div className="text-4xl mb-6" style={{ color: '#B5522A' }}>✦</div>
            <h2 className="font-heading text-[36px] font-light text-[#2C1A0E] leading-tight mb-4">
              Vervollständige dein Profil um diese Person wirklich zu sehen.
            </h2>
            <p className="font-body font-light text-[#9A8A7A] text-base leading-relaxed max-w-sm mb-10">
              Ein paar Minuten mehr — und du wirst sichtbar für Menschen die wirklich zu dir passen.
            </p>
            <button onClick={() => setStep(1)} className="btn-primary px-10 py-4">
              Weiter →
            </button>
          </div>
        )}

        {/* Step 1: Werte */}
        {step === 1 && (
          <div className="pt-6">
            <h2 className="font-heading text-[32px] font-light text-[#2C1A0E] mb-2">Deine Werte.</h2>
            <p className="text-[#9A8A7A] text-sm font-body mb-6">Wähle 2–5 Werte die dich wirklich beschreiben.</p>
            <div className="flex flex-wrap gap-2">
              {WERTE_OPTIONS.map((w) => (
                <button key={w} onClick={() => setWerte(prev => prev.includes(w) ? prev.filter(x => x !== w) : prev.length < 5 ? [...prev, w] : prev)}
                  className={cn('px-4 py-2 rounded-full text-sm font-body border transition-all',
                    werte.includes(w) ? 'bg-[#6B7B5A] text-[#F2EBE2] border-[#6B7B5A]' : 'border-[rgba(44,26,14,0.20)] text-[rgba(44,26,14,0.70)]'
                  )}>
                  {w}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Bio */}
        {step === 2 && (
          <div className="pt-6">
            <h2 className="font-heading text-[32px] font-light text-[#2C1A0E] mb-2">Über dich.</h2>
            <p className="text-[#9A8A7A] text-sm font-body mb-6">Was sollen Menschen über dich wissen? (optional)</p>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 400))}
              placeholder="Erzähl in eigenen Worten..."
              rows={5}
              className="input resize-none"
            />
            <span className="text-[rgba(44,26,14,0.30)] text-xs block text-right mt-1">{bio.length}/400</span>
          </div>
        )}

        {/* Step 3: Interessen */}
        {step === 3 && (
          <div className="pt-6">
            <h2 className="font-heading text-[32px] font-light text-[#2C1A0E] mb-2">Deine Interessen.</h2>
            <p className="text-[#9A8A7A] text-sm font-body mb-6">Was beschäftigt dich?</p>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((i) => (
                <button key={i} onClick={() => setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])}
                  className={cn('px-4 py-2 rounded-full text-sm font-body border transition-all',
                    interests.includes(i) ? 'bg-[#6B7B5A] text-[#F2EBE2] border-[#6B7B5A]' : 'border-[rgba(44,26,14,0.20)] text-[rgba(44,26,14,0.70)]'
                  )}>
                  {i}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Meine Welt */}
        {step === 4 && (
          <div className="pt-6">
            <h2 className="font-heading text-[32px] font-light text-[#2C1A0E] mb-2">Meine Welt.</h2>
            <p className="text-[#9A8A7A] text-sm font-body mb-6">Was gehört zu deiner Welt?</p>
            <div className="flex flex-wrap gap-2">
              {MY_WORLD_OPTIONS.map((w) => (
                <button key={w} onClick={() => setMyWorld(prev => prev.includes(w) ? prev.filter(x => x !== w) : [...prev, w])}
                  className={cn('px-4 py-2 rounded-full text-sm font-body border transition-all',
                    myWorld.includes(w) ? 'bg-[#6B7B5A] text-[#F2EBE2] border-[#6B7B5A]' : 'border-[rgba(44,26,14,0.20)] text-[rgba(44,26,14,0.70)]'
                  )}>
                  {w}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Persönlichkeit */}
        {step === 5 && (
          <div className="pt-6 space-y-8">
            <div>
              <h2 className="font-heading text-[32px] font-light text-[#2C1A0E] mb-2">Persönlichkeit.</h2>
              <p className="text-[#9A8A7A] text-sm font-body mb-6">Wo siehst du dich auf diesen Spektren?</p>
            </div>
            {[
              { label1: 'Introvertiert', label2: 'Extrovertiert', val: introvert, set: setIntrovert },
              { label1: 'Spontan', label2: 'Strukturiert', val: spontan, set: setSpontan },
              { label1: 'Rational', label2: 'Emotional', val: rational, set: setRational },
            ].map((slider) => (
              <div key={slider.label1} className="space-y-2">
                <div className="flex justify-between text-xs text-[#9A8A7A] font-body">
                  <span>{slider.label1}</span>
                  <span>{slider.label2}</span>
                </div>
                <input type="range" min={0} max={100} value={slider.val} onChange={(e) => slider.set(Number(e.target.value))}
                  className="w-full" style={{ accentColor: '#6B7B5A' }} />
              </div>
            ))}
          </div>
        )}

        {/* Step 6: Prompts */}
        {step === 6 && (
          <div className="pt-6 space-y-5">
            <div>
              <h2 className="font-heading text-[32px] font-light text-[#2C1A0E] mb-2">Deine Antworten.</h2>
              <p className="text-[#9A8A7A] text-sm font-body mb-6">Beantworte mindestens 2 Fragen in deinen eigenen Worten.</p>
            </div>
            {prompts.map((p, i) => (
              <div key={i} className="bg-[#F2EBE2] rounded-2xl p-4 border border-[rgba(44,26,14,0.10)]">
                <p className="text-[#9A8A7A] text-xs uppercase tracking-widest font-body mb-2">{p.question}</p>
                <textarea
                  value={p.answer}
                  onChange={(e) => setPrompts(prev => prev.map((x, j) => j === i ? { ...x, answer: e.target.value.slice(0, 200) } : x))}
                  placeholder="Deine Antwort..."
                  rows={3}
                  className="w-full bg-transparent text-[#2C1A0E] text-sm font-body font-light resize-none focus:outline-none placeholder:text-[#9A8A7A]"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-4 bg-gradient-to-t from-[#EAE0D5] to-transparent">
        {step === 'intro' ? null : (
          <button
            onClick={() => {
              if (step < 6) setStep((step as number + 1) as any)
              else save()
            }}
            disabled={saving}
            className="btn-primary w-full py-4 disabled:opacity-40"
          >
            {step === 6 ? (saving ? 'Speichern…' : 'Profil vervollständigen ✦') : 'Weiter →'}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function DiscoverClient({
  initialProfiles,
  currentUserId,
  isInConnection,
  connectionId,
  tier,
  viewerSexualityVisible,
  viewerProfile,
  onboardingPhase = 3,
  serendipityIds = [],
  trialActive = true,
  trialDaysLeft = 14,
  receivedLights = [],
}: Props) {
  const supabase = createClient()

  // Filter state
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [showFilters, setShowFilters] = useState(false)

  // Navigation state
  const [current, setCurrent] = useState(0)
  const [history, setHistory] = useState<number[]>([])

  // Match animation
  const [showMatchAnim, setShowMatchAnim] = useState(false)

  // Daily limit
  const todayStr = new Date().toISOString().split('T')[0]
  const initCount = (viewerProfile?.daily_discover_date === todayStr)
    ? (viewerProfile?.daily_discover_count ?? 0)
    : 0
  const [dailyCount, setDailyCount] = useState(initCount)
  const [showDailyLimit, setShowDailyLimit] = useState(false)

  // Revisit mode
  const [revisitIds, setRevisitIds]           = useState<string[]>(viewerProfile?.revisit_profiles ?? [])
  const [showRevisit, setShowRevisit]         = useState(false)
  const [revisitProfiles, setRevisitProfiles] = useState<Profile[]>([])
  const [revisitIdx, setRevisitIdx]           = useState(0)
  const [loadingRevisit, setLoadingRevisit]   = useState(false)

  // Pause state (if the viewer's own profile is paused)
  const [isPaused, setIsPaused] = useState(viewerProfile?.profile_paused ?? false)

  // Burnout hint
  const [showBurnout, setShowBurnout] = useState(false)

  // Phase 2 onboarding overlay (triggers when phase < 2 and user tries to like)
  const [showPhase2Overlay, setShowPhase2Overlay] = useState(false)

  // ── Stilles Zeichen ───────────────────────────────────────────────────────
  const todayLightKey = `light_count_${todayStr}`
  const [lightSentCount, setLightSentCount] = useState<number>(() => {
    if (typeof window === 'undefined') return 0
    return parseInt(localStorage.getItem(todayLightKey) ?? '0', 10)
  })
  const [lightAnim, setLightAnim]               = useState(false)
  const [lightLimitToast, setLightLimitToast]   = useState(false)
  const [localReceivedLights, setLocalReceivedLights] = useState<Light[]>(
    receivedLights.filter(l => !l.dismissed && !l.returned)
  )
  const [lightReturned, setLightReturned]       = useState(false)

  // Profile card expansion
  const [profileExpanded, setProfileExpanded] = useState(false)

  // Scroll-hide header
  const [headerHidden, setHeaderHidden] = useState(false)
  const lastScrollY = useRef(0)
  useEffect(() => {
    const handler = () => {
      const y = window.scrollY
      if (y > lastScrollY.current && y > 60) {
        setHeaderHidden(true)
      } else {
        setHeaderHidden(false)
      }
      lastScrollY.current = y
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Swipe motion values
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-18, 18])
  const likeOpacity = useTransform(x, [20, 100], [0, 1])
  const nopeOpacity = useTransform(x, [-20, -100], [0, 1])

  // Filtered profiles
  const profiles = useMemo(() => {
    const filtered = initialProfiles.filter((p) => {
      if (p.age !== null) {
        if (p.age < filters.ageMin || p.age > filters.ageMax) return false
      }
      if (filters.locationQuery.trim()) {
        const q = filters.locationQuery.trim().toLowerCase()
        if (!p.location?.toLowerCase().includes(q)) return false
      }
      if (filters.intentions.length && p.intention && !filters.intentions.includes(p.intention))
        return false
      if (
        filters.relationshipModels.length &&
        p.relationship_model &&
        !filters.relationshipModels.includes(p.relationship_model)
      )
        return false
      if (filters.hasChildren.length && p.has_children && !filters.hasChildren.includes(p.has_children))
        return false
      if (filters.smoking.length && p.smoking && !filters.smoking.includes(p.smoking))
        return false
      if (filters.drugs.length && p.drugs && !filters.drugs.includes(p.drugs))
        return false
      return true
    })
    // Sort by compatibility score if viewer profile available
    if (viewerProfile) {
      return [...filtered].sort((a, b) => scoreProfile(b, viewerProfile) - scoreProfile(a, viewerProfile))
    }
    return filtered
  }, [initialProfiles, filters, viewerProfile])

  const profile = profiles[current] ?? null
  const activeFilterCount = countActiveFilters(filters)
  const hasProfile = profile !== null && current < profiles.length

  // ── Daily count helper ────────────────────────────────────────────────────

  async function incrementDailyCount() {
    const newCount = dailyCount + 1
    setDailyCount(newCount)
    await supabase.from('profiles').update({
      daily_discover_count: newCount,
      daily_discover_date: todayStr,
    }).eq('user_id', currentUserId)
    if (newCount >= 10) setShowDailyLimit(true)
  }

  // ── Revisit helpers ───────────────────────────────────────────────────────

  async function addToRevisit(profileUserId: string) {
    const updated = [...revisitIds.filter(id => id !== profileUserId), profileUserId]
    setRevisitIds(updated)
    await supabase.from('profiles').update({ revisit_profiles: updated }).eq('user_id', currentUserId)
  }

  async function removeFromRevisit(profileUserId: string) {
    const updated = revisitIds.filter(id => id !== profileUserId)
    setRevisitIds(updated)
    setRevisitProfiles(prev => prev.filter(p => p.user_id !== profileUserId))
    await supabase.from('profiles').update({ revisit_profiles: updated }).eq('user_id', currentUserId)
  }

  async function openRevisitMode() {
    setLoadingRevisit(true)
    if (revisitIds.length > 0) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', revisitIds)
      setRevisitProfiles(data ?? [])
    }
    setRevisitIdx(0)
    setShowRevisit(true)
    setLoadingRevisit(false)
  }

  // ── End pause ─────────────────────────────────────────────────────────────

  async function endPause() {
    setIsPaused(false)
    await supabase.from('profiles').update({ profile_paused: false, paused_since: null }).eq('user_id', currentUserId)
    toast.success('Pause beendet — willkommen zurück.')
  }

  // ── Actions ──────────────────────────────────────────────────────────────

  function next() {
    setHistory((h) => [...h, current])
    setCurrent((c) => c + 1)
    setProfileExpanded(false)
    x.set(0)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleLike() {
    if (!profile) return
    // Phase 2 gate: user must complete Phase 2 before liking
    if (onboardingPhase < 2) {
      setShowPhase2Overlay(true)
      return
    }
    // Trial gate: if trial expired and not paid
    if (!trialActive) {
      toast('Dein Testzugang ist abgelaufen. Jetzt Mitglied werden →')
      return
    }
    await incrementDailyCount()
    // Remove from revisit if it was there
    if (revisitIds.includes(profile.user_id)) await removeFromRevisit(profile.user_id)
    const { error } = await supabase.from('likes').insert({
      from_user_id: currentUserId,
      to_user_id: profile.user_id,
    })
    if (!error) {
      const { data: theirLike } = await supabase
        .from('likes')
        .select('id')
        .eq('from_user_id', profile.user_id)
        .eq('to_user_id', currentUserId)
        .maybeSingle()
      if (theirLike) {
        await supabase
          .from('matches')
          .insert({ user1_id: currentUserId, user2_id: profile.user_id, status: 'open' })
        next()
        setShowMatchAnim(true)
        return
      } else {
        toast('Interesse gesendet!')
      }
    }
    next()
  }

  async function handlePass() {
    if (profile) await addToRevisit(profile.user_id)
    await incrementDailyCount()
    next()
  }

  function handleUndo() {
    if (history.length === 0) return
    const prev = history[history.length - 1]
    setHistory((h) => h.slice(0, -1))
    setCurrent(prev)
    x.set(0)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Stilles Zeichen ───────────────────────────────────────────────────────

  async function handleSendLight() {
    if (!profile) return
    const DAILY_LIMIT = 3
    if (lightSentCount >= DAILY_LIMIT) {
      setLightLimitToast(true)
      setTimeout(() => setLightLimitToast(false), 4000)
      return
    }
    // Animate glow
    setLightAnim(true)
    setTimeout(() => setLightAnim(false), 1200)
    // Persist in DB
    await supabase.from('lights').upsert({
      sender_id: currentUserId,
      receiver_id: profile.user_id,
      returned: false,
      dismissed: false,
    }, { onConflict: 'sender_id,receiver_id', ignoreDuplicates: true })
    // Update daily count
    const newCount = lightSentCount + 1
    setLightSentCount(newCount)
    localStorage.setItem(todayLightKey, String(newCount))
  }

  async function handleReturnLight(lightId: string) {
    // Mark as returned
    await supabase.from('lights').update({ returned: true }).eq('id', lightId)
    setLocalReceivedLights(prev => prev.filter(l => l.id !== lightId))
    setLightReturned(true)
    toast('✦ Zeichen zurückgeschickt — anonym und mit Wärme.')
  }

  async function handleDismissLight(lightId: string) {
    await supabase.from('lights').update({ dismissed: true }).eq('id', lightId)
    setLocalReceivedLights(prev => prev.filter(l => l.id !== lightId))
  }

  // ── Pause screen ──────────────────────────────────────────────────────────

  if (isPaused) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center" style={{ background: '#EAE0D5' }}>
        <div className="text-5xl mb-6">🌙</div>
        <h2 className="font-heading text-4xl text-[#2C1A0E] mb-4">Du bist gerade in der Stille.</h2>
        <p className="text-[#9A8A7A] leading-relaxed mb-8 max-w-sm font-body font-light">
          Dein Profil ist pausiert. Niemand sieht dich gerade im Entdecken.
          Komm zurück wenn es sich richtig anfühlt.
        </p>
        <button onClick={endPause} className="btn-primary px-8">
          Pause beenden
        </button>
      </div>
    )
  }

  // ── Daily limit screen ────────────────────────────────────────────────────

  if (showDailyLimit) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center" style={{ background: '#EAE0D5' }}>
        <div className="w-16 h-16 bg-[rgba(44,26,14,0.06)] rounded-full flex items-center justify-center mx-auto mb-6">
          <Search className="w-8 h-8 text-[#9A8A7A]" />
        </div>
        <h2 className="font-heading text-4xl text-[#2C1A0E] mb-4">Du hast heute bewusst geschaut.</h2>
        <p className="text-[#9A8A7A] leading-relaxed mb-8 max-w-sm font-body font-light">
          10 Begegnungen für heute. Morgen gibt es neue Menschen zu entdecken.
          Nimm dir Zeit mit dem was du gesehen hast.
        </p>
        <button
          onClick={() => { setShowDailyLimit(false); openRevisitMode() }}
          className="btn-primary px-8 mb-3"
        >
          Zum Revisit-Modus →
        </button>
        <Link href="/profile" className="text-[#9A8A7A] text-sm font-body hover:text-[#2C1A0E] transition-colors">
          Zum Profil
        </Link>
      </div>
    )
  }

  // ── Locked screen ──────────────────────────────────────────────────────────

  if (tier === 'free') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center" style={{ background: '#EAE0D5' }}>
        <div className="w-20 h-20 bg-[rgba(44,26,14,0.06)] rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-9 h-9 text-[#9A8A7A]" />
        </div>
        <h2 className="font-heading text-4xl text-[#2C1A0E] mb-3">Entdecken ist gesperrt</h2>
        <p className="text-[#9A8A7A] leading-relaxed mb-8 max-w-sm">
          Mit der Mitgliedschaft (29&nbsp;€/Monat) kannst du Profile entdecken, swipen und Matches
          aufbauen.
        </p>
        <Link href="/pricing" className="btn-primary px-8">
          Mitgliedschaft ansehen
        </Link>
        <p className="text-xs text-[#9A8A7A] mt-4">14 Tage Geld-zurück-Garantie</p>
      </div>
    )
  }

  // ── In connection screen ───────────────────────────────────────────────────

  if (isInConnection) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center" style={{ background: '#EAE0D5' }}>
        <p className="font-heading text-[42px] mb-3 leading-none" style={{ color: 'rgba(44,26,14,0.15)' }}>✦</p>
        <h2 className="font-heading text-4xl text-[#2C1A0E] mb-4">Du bist gerade in einer Begegnung.</h2>
        <p className="text-[#9A8A7A] max-w-xs leading-relaxed mb-10 font-body font-light text-sm">
          Volle Präsenz.
        </p>
        <Link href={`/connection/${connectionId}`} className="btn-primary px-8">
          Zur Begegnung
        </Link>
      </div>
    )
  }

  // ── Main UI ───────────────────────────────────────────────────────────────

  return (
    <>
      <SajaCircleAnimation variant="match" visible={showMatchAnim} navigateTo="/matches" />

      {/* ── Trial expired banner ── */}
      {!trialActive && (
        <div className="sticky top-0 z-30 px-4 py-2 flex items-center justify-between" style={{ background: '#F2EBE2', borderBottom: '0.5px solid rgba(44,26,14,0.10)' }}>
          <p className="text-[#2C1A0E] text-xs font-body">Dein Zugang ist abgelaufen.</p>
          <Link href="/pricing" className="text-[#6B7B5A] text-xs font-body font-medium underline underline-offset-2">
            Jetzt Mitglied werden →
          </Link>
        </div>
      )}

      {/* ── Trial active hint ── */}
      {trialActive && trialDaysLeft <= 3 && trialDaysLeft > 0 && (
        <div className="sticky top-0 z-30 px-4 py-2 flex items-center justify-between" style={{ background: '#F2EBE2', borderBottom: '0.5px solid rgba(44,26,14,0.10)' }}>
          <p className="text-[#2C1A0E] text-xs font-body">✦ Du bist im Vollzugang — noch {trialDaysLeft} {trialDaysLeft === 1 ? 'Tag' : 'Tage'}</p>
          <Link href="/pricing" className="text-[#6B7B5A] text-xs font-body font-medium underline underline-offset-2">
            Mitglied werden
          </Link>
        </div>
      )}

      {/* ── Phase 2 overlay ── */}
      {showPhase2Overlay && (
        <Phase2Overlay
          userId={currentUserId}
          onComplete={() => {
            setShowPhase2Overlay(false)
            // Refresh the page to update onboardingPhase
            window.location.reload()
          }}
          onDismiss={() => setShowPhase2Overlay(false)}
        />
      )}

      {/* ── Filter Drawer ── */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 bg-black/30 z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed top-0 right-0 h-full w-full max-w-sm bg-[#F2EBE2] z-50 shadow-2xl flex flex-col"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-[rgba(44,26,14,0.12)]">
                <h2 className="font-heading text-2xl text-[#2C1A0E]">Filter</h2>
                <div className="flex items-center gap-3">
                  {activeFilterCount > 0 && (
                    <button
                      onClick={() => {
                        setFilters(DEFAULT_FILTERS)
                        setCurrent(0)
                        setHistory([])
                      }}
                      className="flex items-center gap-1.5 text-sm text-[#6B6058] hover:text-[#232323] transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Zurücksetzen
                    </button>
                  )}
                  <button
                    onClick={() => setShowFilters(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[rgba(47,74,60,0.07)] transition-colors"
                  >
                    <X className="w-5 h-5 text-[#6B6058]" />
                  </button>
                </div>
              </div>

              {/* Drawer body */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
                {/* Age */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium text-[#6B6058] uppercase tracking-wider">
                      Alter
                    </p>
                    <span className="text-sm font-medium text-[#232323]">
                      {filters.ageMin} – {filters.ageMax === 100 ? '100+' : filters.ageMax}
                    </span>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs text-[#6B6058] mb-1">
                        <span>Von</span>
                        <span>{filters.ageMin}</span>
                      </div>
                      <input
                        type="range"
                        min={18}
                        max={99}
                        value={filters.ageMin}
                        onChange={(e) => {
                          const v = Number(e.target.value)
                          setFilters((f) => ({ ...f, ageMin: Math.min(v, f.ageMax - 1) }))
                          setCurrent(0)
                          setHistory([])
                        }}
                        className="w-full accent-[#6B7B5A]"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-[#6B6058] mb-1">
                        <span>Bis</span>
                        <span>{filters.ageMax === 100 ? '100+' : filters.ageMax}</span>
                      </div>
                      <input
                        type="range"
                        min={19}
                        max={100}
                        value={filters.ageMax}
                        onChange={(e) => {
                          const v = Number(e.target.value)
                          setFilters((f) => ({ ...f, ageMax: Math.max(v, f.ageMin + 1) }))
                          setCurrent(0)
                          setHistory([])
                        }}
                        className="w-full accent-[#6B7B5A]"
                      />
                    </div>
                  </div>
                </div>

                {/* Distance */}
                <div>
                  <p className="text-xs font-medium text-[#6B6058] uppercase tracking-wider mb-3">
                    Entfernung
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {DISTANCE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setFilters((f) => ({ ...f, distanceKm: opt.value }))
                          setCurrent(0)
                          setHistory([])
                        }}
                        className={cn(
                          'px-3 py-1.5 rounded-full text-sm border transition-all',
                          filters.distanceKm === opt.value
                            ? 'bg-[#6B7B5A] border-[#6B7B5A] text-[#F2EBE2]'
                            : 'bg-[#F2EBE2] border-[rgba(44,26,14,0.12)] text-[#9A8A7A] hover:border-[rgba(44,26,14,0.30)]',
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6058]" />
                    <input
                      type="text"
                      placeholder="Stadt eingeben …"
                      value={filters.locationQuery}
                      onChange={(e) => {
                        setFilters((f) => ({ ...f, locationQuery: e.target.value }))
                        setCurrent(0)
                        setHistory([])
                      }}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[rgba(44,26,14,0.12)] bg-[#F2EBE2] text-sm text-[#2C1A0E] placeholder:text-[#9A8A7A] focus:outline-none focus:border-[#6B7B5A]"
                    />
                  </div>
                  <p className="text-xs text-[#6B6058] mt-1.5">Filtert nach Stadtname im Profil</p>
                </div>

                <ChipGroup
                  label="Intention"
                  options={INTENTION_OPTIONS}
                  selected={filters.intentions}
                  onChange={(v) => {
                    setFilters((f) => ({ ...f, intentions: v }))
                    setCurrent(0)
                    setHistory([])
                  }}
                />
                <ChipGroup
                  label="Beziehungsmodell"
                  options={RELATIONSHIP_OPTIONS}
                  selected={filters.relationshipModels}
                  onChange={(v) => {
                    setFilters((f) => ({ ...f, relationshipModels: v }))
                    setCurrent(0)
                    setHistory([])
                  }}
                />
                <ChipGroup
                  label="Kinder"
                  options={['Keine', 'Ja', 'Offen']}
                  selected={filters.hasChildren}
                  onChange={(v) => {
                    setFilters((f) => ({ ...f, hasChildren: v }))
                    setCurrent(0)
                    setHistory([])
                  }}
                />
                <ChipGroup
                  label="Raucher"
                  options={['Nein', 'Gelegentlich', 'Ja']}
                  selected={filters.smoking}
                  onChange={(v) => {
                    setFilters((f) => ({ ...f, smoking: v }))
                    setCurrent(0)
                    setHistory([])
                  }}
                />
                <ChipGroup
                  label="Drogen"
                  options={['Nein', 'Gelegentlich', 'Ja']}
                  selected={filters.drugs}
                  onChange={(v) => {
                    setFilters((f) => ({ ...f, drugs: v }))
                    setCurrent(0)
                    setHistory([])
                  }}
                />
              </div>

              {/* Drawer footer */}
              <div className="px-6 py-5 border-t border-[rgba(44,26,14,0.12)]">
                <button onClick={() => setShowFilters(false)} className="w-full btn-primary py-3.5">
                  {profiles.length} {profiles.length === 1 ? 'Profil' : 'Profile'} anzeigen
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Page header ── */}
      <div
        className={cn(
          'sticky top-0 z-20 bg-transparent transition-transform duration-300',
          headerHidden ? '-translate-y-full' : 'translate-y-0',
        )}
      >
        <div className="flex items-center justify-between px-4 pt-5 pb-4 max-w-lg mx-auto">
          <SajaLogo size="md" onDark={false} />
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(true)}
              className={cn(
                'relative flex items-center gap-2 px-4 py-2 rounded-2xl border text-sm font-medium transition-all',
                activeFilterCount > 0
                  ? 'border-[#6B7B5A] bg-[#6B7B5A] text-[#F2EBE2]'
                  : 'border-[rgba(44,26,14,0.25)] text-[#2C1A0E] hover:border-[#6B7B5A]',
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filter
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#F2EBE2] text-[#2C1A0E] text-xs flex items-center justify-center font-semibold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Received light card ── */}
      <AnimatePresence>
        {localReceivedLights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="max-w-lg mx-auto px-4 mb-4"
          >
            <div
              className="rounded-2xl p-5 text-center"
              style={{ background: '#F2EBE2', border: '0.5px solid rgba(44,26,14,0.10)' }}
            >
              <p className="text-[#B5522A] text-xl mb-2">✦</p>
              <p className="font-heading text-[20px] italic text-[#2C1A0E] leading-snug mb-1">
                &ldquo;Jemand hat dir heute ein stilles Zeichen geschickt.&rdquo;
              </p>
              <p className="text-[#9A8A7A] font-body text-xs mb-4">Anonym — kein Name, keine Erwartung.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleReturnLight(localReceivedLights[0].id)}
                  className="flex-1 py-2.5 rounded-xl font-body text-[13px] text-[#2C1A0E] transition-all active:scale-[0.97]"
                  style={{ background: 'rgba(44,26,14,0.08)' }}
                >
                  Ein Zeichen zurückschicken ✦
                </button>
                <button
                  onClick={() => handleDismissLight(localReceivedLights[0].id)}
                  className="px-4 py-2.5 rounded-xl font-body text-[13px] text-[#9A8A7A] transition-all active:scale-[0.97]"
                  style={{ background: 'rgba(44,26,14,0.04)' }}
                >
                  In Stille annehmen
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Light sent glow animation ── */}
      <AnimatePresence>
        {lightAnim && (
          <motion.div
            key="light-glow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.6, opacity: 0.9 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ duration: 1.0, ease: 'easeOut' }}
              className="w-40 h-40 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(191,155,48,0.55) 0%, rgba(47,74,60,0.18) 60%, transparent 100%)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Light limit toast ── */}
      <AnimatePresence>
        {lightLimitToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-32 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none"
          >
            <div
              className="rounded-2xl px-5 py-3.5 max-w-sm text-center"
              style={{ background: '#F2EBE2', border: '0.5px solid rgba(44,26,14,0.12)', backdropFilter: 'blur(12px)' }}
            >
              <p className="text-[#2C1A0E] font-body text-sm leading-relaxed">
                Du hast heute 3 Zeichen verschickt.<br />
                <span className="text-[#9A8A7A]">Morgen kannst du wieder jemandem eine Freude machen. ✦</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Empty state ── */}
      {!hasProfile ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <Heart className="w-16 h-16 mb-6" style={{ color: 'rgba(44,26,14,0.20)' }} />
          {activeFilterCount > 0 ? (
            <>
              <h2 className="font-heading text-4xl text-[#2C1A0E] mb-3">Keine Treffer</h2>
              <p className="text-[#9A8A7A] max-w-sm mb-6">
                Passe die Filter an oder setze sie zurück.
              </p>
              <button
                onClick={() => {
                  setFilters(DEFAULT_FILTERS)
                  setCurrent(0)
                  setHistory([])
                }}
                className="btn-secondary px-6 py-3"
              >
                Filter zurücksetzen
              </button>
            </>
          ) : (
            <>
              <h2 className="font-heading text-4xl text-[#2C1A0E] mb-3">Das war's erstmal</h2>
              <p className="text-[#9A8A7A] max-w-sm">
                Schau später wieder vorbei — neue Menschen kommen täglich dazu.
              </p>
            </>
          )}
        </div>
      ) : (
        /* ── Profile feed ── */
        <AnimatePresence mode="wait">
          <motion.div
            key={profile.user_id}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="max-w-lg mx-auto pb-32"
          >
            {/* ── Unified swipeable card (photo + body) ── */}
            <motion.div
              style={{ x, rotate, touchAction: 'pan-y' } as any}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.7}
              onDragEnd={(_, info) => {
                if (info.offset.x > 100 || info.velocity.x > 500) {
                  handleLike()
                } else if (info.offset.x < -100 || info.velocity.x < -500) {
                  handlePass()
                } else {
                  x.set(0)
                }
              }}
              className="mx-3 cursor-grab active:cursor-grabbing select-none rounded-3xl shadow-lg overflow-hidden"
            >
              {/* Photo area */}
              <div className="relative" style={{ aspectRatio: '4/5' }}>
                {photoUrl(profile.photos?.[0]) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoUrl(profile.photos[0])}
                    alt={profile.name}
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    style={{ objectPosition: 'center 20%' }}
                    draggable={false}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ background: '#EAE0D5' }}>
                    <span className="font-heading text-8xl text-[#9A8A7A]">
                      {profile.name?.[0]}
                    </span>
                  </div>
                )}

                {/* LIKE stamp */}
                <motion.div
                  style={{ opacity: likeOpacity }}
                  className="absolute top-12 left-6 border-4 border-emerald-400 text-emerald-400 font-heading text-3xl px-5 py-2 rounded-xl rotate-[-15deg] pointer-events-none z-20 select-none"
                >
                  LIKE
                </motion.div>

                {/* NOPE stamp */}
                <motion.div
                  style={{ opacity: nopeOpacity }}
                  className="absolute top-12 right-6 border-4 border-red-400 text-red-400 font-heading text-3xl px-5 py-2 rounded-xl rotate-[15deg] pointer-events-none z-20 select-none"
                >
                  NOPE
                </motion.div>

                {/* Bottom-only gradient */}
                <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none" style={{ height: '55%', background: 'linear-gradient(to top, rgba(20,34,26,0.82) 0%, rgba(20,34,26,0.18) 55%, transparent 100%)' }} />

                {/* ✦ Stilles Zeichen button — top right, quiet */}
                <button
                  onClick={handleSendLight}
                  className="absolute top-4 right-4 z-20 flex items-center justify-center rounded-full px-3 py-1 text-xs"
                  style={{
                    background: 'rgba(242,235,226,0.12)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '0.5px solid rgba(242,235,226,0.18)',
                    color: 'rgba(242,235,226,0.70)',
                    letterSpacing: '0.06em',
                    opacity: lightSentCount >= 3 ? 0.35 : 1,
                  }}
                  aria-label="Ein stilles Zeichen schicken"
                >
                  ✦
                </button>

                {/* Serendipity badge */}
                {serendipityIds.includes(profile.user_id) && (
                  <div className="absolute top-4 left-4 z-20 bg-[rgba(30,48,40,0.75)] backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <span className="text-[#F2EBE2] text-xs font-body">✦ Überraschung</span>
                  </div>
                )}

                {/* Name + location — bottom left, serif large */}
                <div className="absolute bottom-0 left-0 right-0 z-20 px-6 pb-7 pointer-events-none">
                  <h2 className="font-heading text-[42px] font-normal text-[#F2EBE2] leading-[1.05] tracking-[-0.5px] mb-1">
                    {profile.name}
                    {!profile.hide_age && profile.birth_date ? `, ${calculateAge(profile.birth_date)}` : !profile.hide_age && profile.age ? `, ${profile.age}` : ''}
                  </h2>
                  {!profile.hide_location && profile.location && (
                    <p className="text-[#F2EBE2]/50 text-[13px] font-light">{profile.location}</p>
                  )}
                </div>
              </div>

              {/* ── Card body — unified below photo ── */}
              <div
                className="bg-[#F2EBE2] cursor-pointer"
                onClick={() => setProfileExpanded(e => !e)}
              >
              <div className="px-6 pt-5 pb-6">

                {/* Intention as plain text */}
                {profile.intention && (
                  <p className="text-[#6B7B5A] text-sm font-medium mb-3">{profile.intention}</p>
                )}

                {/* Bio — snippet when collapsed, full when expanded */}
                {profile.bio && (
                  <p className="text-[#6B6058] text-sm font-light leading-relaxed mb-4">
                    {profileExpanded ? profile.bio : (profile.bio.length > 120 ? profile.bio.slice(0, 120) + '…' : profile.bio)}
                  </p>
                )}

                {/* Chips */}
                <div className="flex flex-wrap gap-2">
                  {(profile.werte ?? []).slice(0, profileExpanded ? 999 : 2).map((w) => (
                    <span key={w} className="rounded-full px-3 py-1 text-xs" style={{ background: 'rgba(44,26,14,0.06)', color: '#9A8A7A' }}>{w}</span>
                  ))}
                  {profile.sun_sign && (
                    <span className="rounded-full px-3 py-1 text-xs" style={{ background: 'rgba(181,82,42,0.08)', color: '#B5522A' }}>{profile.sun_sign}</span>
                  )}
                </div>

                {/* Expanded: full profile details */}
                {profileExpanded && (
                  <div className="mt-5 pt-5 border-t border-[rgba(47,74,60,0.08)] space-y-4">

                    {/* Relationship model */}
                    {profile.relationship_model && (
                      <div>
                        <p className="text-[#9A8E84] text-[10px] uppercase tracking-widest mb-1">Beziehungsmodell</p>
                        <p className="text-[#6B6058] text-sm font-light">{profile.relationship_model}</p>
                      </div>
                    )}

                    {/* Life facts */}
                    {(profile.has_children || profile.smoking || profile.drugs) && (
                      <div>
                        <p className="text-[#9A8E84] text-[10px] uppercase tracking-widest mb-2">Lebensstil</p>
                        <div className="flex flex-wrap gap-2">
                          {profile.has_children && (
                            <span className="bg-[rgba(47,74,60,0.07)] text-[#6B6058] rounded-full px-3 py-1 text-xs">Kinder: {profile.has_children}</span>
                          )}
                          {profile.smoking && (
                            <span className="bg-[rgba(47,74,60,0.07)] text-[#6B6058] rounded-full px-3 py-1 text-xs">Raucher: {profile.smoking}</span>
                          )}
                          {profile.drugs && (
                            <span className="bg-[rgba(47,74,60,0.07)] text-[#6B6058] rounded-full px-3 py-1 text-xs">Drogen: {profile.drugs}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Prompts */}
                    {(profile.prompts ?? []).filter(p => p.answer).map((pr, i) => (
                      <div key={i}>
                        <p className="text-[#9A8E84] text-[10px] uppercase tracking-widest mb-1">{pr.question}</p>
                        <p className="text-[#6B6058] text-sm font-light leading-relaxed">{pr.answer}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Expand indicator */}
                <div className="flex justify-center mt-4">
                  <span className="text-[#9A8E84] text-xs flex items-center gap-1">
                    {profileExpanded ? '↑ Weniger' : '↓ Mehr sehen'}
                  </span>
                </div>
              </div>
            </div>
            </motion.div>

          {/* ── Action buttons — Heart LEFT, ✦ CENTER (big), X RIGHT ── */}
          <div className="flex items-center justify-center gap-5 mt-6 mb-2">
            {/* Heart — left, secondary */}
            <button
              className="w-[54px] h-[54px] rounded-full flex items-center justify-center shadow-sm text-xl transition-all active:scale-95"
              style={{ background: '#F2EBE2', border: '1px solid rgba(44,26,14,0.12)', color: '#2C1A0E' }}
              onClick={handleLike}
            >♡</button>
            {/* ✦ — center, primary Sage (biggest) */}
            <button
              className="w-[66px] h-[66px] rounded-full flex items-center justify-center text-[#F2EBE2] text-xl transition-all active:scale-95"
              style={{ background: '#6B7B5A', boxShadow: '0 8px 28px rgba(107,123,90,0.30)', opacity: lightSentCount >= 3 ? 0.35 : 1 }}
              onClick={handleSendLight}
            >✦</button>
            {/* X — right, secondary */}
            <button
              className="w-[54px] h-[54px] rounded-full flex items-center justify-center shadow-sm text-xl transition-all active:scale-95"
              style={{ background: '#F2EBE2', border: '1px solid rgba(44,26,14,0.12)', color: '#9A8A7A' }}
              onClick={handlePass}
            >✕</button>
          </div>

          {/* Undo */}
          {history.length > 0 && (
            <div className="flex justify-center mt-3 mb-1">
              <button
                onClick={handleUndo}
                className="flex items-center gap-1.5 text-xs text-[#6B6058] hover:text-[#2F4A3C] font-body transition-colors bg-[rgba(47,74,60,0.07)] hover:bg-[rgba(47,74,60,0.12)] rounded-full px-4 py-2"
              >
                ↩ Rückgängig
              </button>
            </div>
          )}

          {/* Revisit-Mode Button */}
          {revisitIds.length >= 3 && (
            <div className="flex justify-center pt-1.5">
              <button
                onClick={openRevisitMode}
                disabled={loadingRevisit}
                className="text-xs text-[#6B6058]/70 hover:text-[#6B6058] font-body transition-colors"
              >
                {loadingRevisit ? '…' : `↩ Nochmal anschauen (${revisitIds.length})`}
              </button>
            </div>
          )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* ── Fixed Action Bar placeholder so the old one below doesn't render ── */}
      {false && (
        <div
          className="fixed left-0 right-0 z-30"
          style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom))' }}
        >
          <div className="max-w-sm mx-auto px-4 pb-3">
            <div
              className="flex items-center gap-1.5 rounded-2xl p-1.5"
              style={{
                background: 'rgba(30,48,40,0.78)',
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
                border: '0.5px solid rgba(242,235,226,0.14)',
              }}
            >
              <button
                onClick={handlePass}
                className="flex-1 py-3.5 rounded-xl font-body font-light text-[13px] text-[#F2EBE2]/70 transition-all active:scale-[0.97]"
                style={{ background: 'rgba(242,235,226,0.08)' }}
              >
                Gerade nicht
              </button>

              <button
                onClick={handleSendLight}
                className="w-10 h-[50px] rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-95"
                style={{
                  background: 'transparent',
                  border: `1px solid rgba(242,235,226,${lightSentCount >= 3 ? '0.10' : '0.22'})`,
                  opacity: lightSentCount >= 3 ? 0.35 : 1,
                }}
                aria-label="Ein stilles Zeichen schicken"
                title="Ein stilles Zeichen schicken — anonym und ohne Erwartung"
              >
                <span className="text-[#BFA76A] text-base leading-none">✦</span>
              </button>

              {/* Undo — square, same height as buttons */}
              <button
                onClick={handleUndo}
                disabled={history.length === 0}
                className="w-12 h-[50px] rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-20 active:scale-95"
                style={{ background: 'rgba(242,235,226,0.10)' }}
                aria-label="Rückgängig"
              >
                <CornerUpLeft className="w-5 h-5 text-[#F2EBE2]/80" />
              </button>

              {/* Fühlt sich stimmig an */}
              <button
                onClick={handleLike}
                className="flex-[1.6] py-3.5 rounded-xl font-body font-normal text-[13px] text-[#F2EBE2] transition-all active:scale-[0.97] hover:opacity-90"
                style={{ background: 'rgba(242,235,226,0.22)', letterSpacing: '0.01em' }}
              >
                Stimmig an ✦
              </button>
            </div>

            {/* Revisit-Mode Button */}
            {revisitIds.length >= 3 && (
              <div className="flex justify-center pt-1.5">
                <button
                  onClick={openRevisitMode}
                  disabled={loadingRevisit}
                  className="text-xs text-[#F2EBE2]/40 hover:text-[#F2EBE2]/60 font-body transition-colors"
                >
                  {loadingRevisit ? '…' : `↩ Nochmal anschauen (${revisitIds.length})`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Revisit Modal ── */}
      {showRevisit && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#EAE0D5' }}>
          <div className="flex items-center justify-between px-5 pt-6 pb-4">
            <div>
              <h2 className="font-heading text-3xl text-[#2C1A0E]">Nochmal anschauen</h2>
              <p className="text-xs text-[#9A8A7A] font-body mt-0.5">{revisitProfiles.length} Profile</p>
            </div>
            <button onClick={() => setShowRevisit(false)} className="w-8 h-8 flex items-center justify-center text-[#9A8A7A] hover:text-[#2C1A0E]">
              <X className="w-5 h-5" />
            </button>
          </div>

          {revisitProfiles.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-[#9A8A7A] text-center px-8">
              <p className="font-heading text-2xl">Keine Profile mehr in der Liste.</p>
            </div>
          ) : revisitIdx >= revisitProfiles.length ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
              <p className="font-heading text-3xl text-[#2C1A0E] mb-4">Das war's.</p>
              <p className="text-[#9A8A7A] font-body mb-6">Du hast alle Revisit-Profile gesehen.</p>
              <button onClick={() => setShowRevisit(false)} className="btn-primary px-8">Zurück zum Entdecken</button>
            </div>
          ) : (() => {
            const rp = revisitProfiles[revisitIdx]
            return (
              <div className="flex-1 overflow-y-auto pb-32">
                <div className="mx-3 rounded-3xl overflow-hidden relative" style={{ height: '70vh' }}>
                  {photoUrl(rp.photos?.[0]) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoUrl(rp.photos[0])} alt={rp.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: '#EAE0D5' }}>
                      <span className="font-heading text-8xl text-[#9A8A7A]">{rp.name?.[0]}</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 h-48" style={{ background: 'linear-gradient(to top, rgba(20,12,6,0.75) 0%, transparent 100%)' }} />
                  <div className="absolute bottom-5 left-5">
                    <h3 className="font-heading text-3xl text-[#F2EBE2]">{rp.name}{rp.age ? `, ${rp.age}` : ''}</h3>
                    {rp.location && !rp.hide_location && <p className="text-[rgba(242,235,226,0.70)] text-sm">{rp.location}</p>}
                  </div>
                </div>
                <div className="mt-2 mx-3 bg-[#F2EBE2] rounded-3xl p-5" style={{ border: '0.5px solid rgba(44,26,14,0.08)' }}>
                  {rp.bio && <p className="text-[#2C1A0E] text-sm leading-relaxed">{rp.bio}</p>}
                  {rp.intention && <p className="mt-3 text-xs text-[#9A8A7A] uppercase tracking-wider">{rp.intention}</p>}
                </div>
              </div>
            )
          })()}

          {/* Revisit Action Bar */}
          {revisitProfiles.length > 0 && revisitIdx < revisitProfiles.length && (
            <div className="fixed bottom-0 left-0 right-0 px-5 pb-6 pt-3" style={{ background: 'rgba(234,224,213,0.95)', backdropFilter: 'blur(16px)', borderTop: '0.5px solid rgba(44,26,14,0.08)' }}>
              <div className="flex gap-3 max-w-sm mx-auto">
                <button
                  onClick={async () => {
                    const rp = revisitProfiles[revisitIdx]
                    await supabase.from('likes').insert({ from_user_id: currentUserId, to_user_id: rp.user_id }).maybeSingle()
                    await removeFromRevisit(rp.user_id)
                    setRevisitIdx(i => i + 1)
                  }}
                  className="flex-1 py-3.5 rounded-full font-body text-sm transition-all"
                  style={{ background: 'transparent', border: '1px solid rgba(44,26,14,0.20)', color: 'rgba(44,26,14,0.50)' }}
                >
                  Nicht mein Weg
                </button>
                <button
                  onClick={async () => {
                    const rp = revisitProfiles[revisitIdx]
                    await removeFromRevisit(rp.user_id)
                    await supabase.from('likes').insert({ from_user_id: currentUserId, to_user_id: rp.user_id })
                    toast('Interesse gesendet!')
                    setRevisitIdx(i => i + 1)
                  }}
                  className="flex-1 py-3.5 rounded-full font-body text-sm font-normal active:scale-95 transition-all"
                  style={{ background: '#6B7B5A', color: '#F2EBE2' }}
                >
                  Fühlt sich stimmig an ✦
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Burnout Hint ── */}
      {showBurnout && (
        <div className="fixed bottom-24 left-4 right-4 z-40 md:left-auto md:right-6 md:max-w-sm">
          <div className="rounded-2xl p-5" style={{ background: '#F2EBE2', border: '0.5px solid rgba(44,26,14,0.12)' }}>
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">🌙</span>
              <div className="flex-1">
                <h4 className="font-heading text-lg text-[#2C1A0E] mb-1">Eine kurze Beobachtung</h4>
                <p className="text-xs text-[#9A8A7A] font-body font-light leading-relaxed mb-3">
                  Du scheinst gerade viel Energie ins Dating zu stecken. Manchmal ist eine Pause das Bewussteste was man tun kann.
                </p>
                <div className="flex gap-2">
                  <Link href="/profile" className="flex-1 py-2 text-center rounded-full text-xs font-body bg-[#6B7B5A] text-[#F2EBE2]">
                    Pause einlegen
                  </Link>
                  <button onClick={() => setShowBurnout(false)} className="flex-1 py-2 text-center rounded-full text-xs font-body text-[#9A8A7A]" style={{ border: '0.5px solid rgba(44,26,14,0.20)' }}>
                    Alles gut, danke
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}


