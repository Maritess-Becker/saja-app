'use client'

import { useState, useMemo, useRef } from 'react'
import {
  Heart, X, MapPin, Briefcase, Sparkles, SlidersHorizontal, RotateCcw,
  Search, ChevronDown, Lock, Mic, Ruler, CornerUpLeft, Play, Pause,
} from 'lucide-react'
import { photoUrl, calculateAge } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import type { Profile } from '@/types'
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
  zodiacSigns: string[]
  communities: string[]
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
  zodiacSigns: [],
  communities: [],
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function countActiveFilters(f: Filters): number {
  let n = 0
  if (f.ageMin !== DEFAULT_FILTERS.ageMin || f.ageMax !== DEFAULT_FILTERS.ageMax) n++
  if (f.distanceKm !== 0 || f.locationQuery.trim()) n++
  if (f.intentions.length) n++
  if (f.relationshipModels.length) n++
  if (f.zodiacSigns.length) n++
  if (f.communities.length) n++
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
                ? 'bg-primary border-primary text-white'
                : 'bg-white border-[rgba(34,16,128,0.12)] text-[#6B6058] hover:border-[#221080]/50',
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
      <div className="h-2 bg-[rgba(34,16,128,0.07)] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#221080]/60 rounded-full transition-all"
          style={{ width: `${value}%` }}
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
    <div className="flex items-center gap-3 px-5 py-4 border-t border-[rgba(34,16,128,0.10)]">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio
        ref={audioRef}
        src={url}
        onEnded={() => setPlaying(false)}
        preload="none"
      />
      <button
        onClick={handleToggle}
        className="w-10 h-10 rounded-full bg-[#221080] flex items-center justify-center shadow flex-shrink-0 hover:bg-[#120850] transition-colors active:scale-95"
      >
        {playing ? (
          <Pause className="w-4 h-4 text-white" />
        ) : (
          <Play className="w-4 h-4 text-white translate-x-0.5" />
        )}
      </button>
      <div className="flex-1">
        <p className="text-sm font-medium text-[#1A1410] mb-1">Sprach-Intro anhören</p>
        <div className="flex items-end gap-0.5 h-4">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'w-0.5 rounded-full transition-all',
                playing ? 'bg-[#221080] animate-pulse' : 'bg-[#221080]/30',
              )}
              style={{
                height: `${28 + Math.sin(i * 0.85) * 48 + Math.cos(i * 1.3) * 18}%`,
                animationDelay: `${i * 50}ms`,
              }}
            />
          ))}
        </div>
      </div>
      <Mic className="w-4 h-4 text-[#6B6058] flex-shrink-0" />
    </div>
  )
}

/** Single prompt block */
function PromptBlock({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="px-4 py-4 border-t border-[rgba(34,16,128,0.10)]">
      <div className="bg-[rgba(34,16,128,0.07)] rounded-xl px-4 py-4 border-l-[3px] border-[#221080]">
        <p className="text-[11px] text-[#6B6058] uppercase tracking-widest mb-2">{question}</p>
        <p className="font-heading text-xl italic text-[#120850] leading-snug text-justify">{answer}</p>
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
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'var(--bg-indigo)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        {step !== 'intro' && (
          <button onClick={() => setStep(step === 1 ? 'intro' : (step as number) - 1 as any)} className="text-[#FDF8F2]/50 hover:text-[#FDF8F2] transition-colors">
            ← Zurück
          </button>
        )}
        {step === 'intro' && <div />}
        <button onClick={onDismiss} className="text-[#FDF8F2]/30 hover:text-[#FDF8F2]/60 transition-colors text-sm">
          Später
        </button>
      </div>

      {/* Progress */}
      {step !== 'intro' && (
        <div className="px-5 mb-4">
          <div className="h-0.5 bg-[rgba(253,248,242,0.12)] rounded-full overflow-hidden">
            <div className="h-full bg-[#FDF8F2] rounded-full transition-all duration-500" style={{ width: `${((step as number) / totalSteps) * 100}%` }} />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-5 pb-32">
        {/* Intro */}
        {step === 'intro' && (
          <div className="flex flex-col items-center justify-center min-h-full text-center py-16">
            <div className="text-4xl mb-6">✦</div>
            <h2 className="font-heading text-[36px] font-light text-[#FDF8F2] leading-tight mb-4">
              Vervollständige dein Profil um diese Person wirklich zu sehen.
            </h2>
            <p className="font-body font-light text-[#FDF8F2]/60 text-base leading-relaxed max-w-sm mb-10">
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
            <h2 className="font-heading text-[32px] font-light text-[#FDF8F2] mb-2">Deine Werte.</h2>
            <p className="text-[#FDF8F2]/50 text-sm font-body mb-6">Wähle 2–5 Werte die dich wirklich beschreiben.</p>
            <div className="flex flex-wrap gap-2">
              {WERTE_OPTIONS.map((w) => (
                <button key={w} onClick={() => setWerte(prev => prev.includes(w) ? prev.filter(x => x !== w) : prev.length < 5 ? [...prev, w] : prev)}
                  className={cn('px-4 py-2 rounded-full text-sm font-body border transition-all',
                    werte.includes(w) ? 'bg-[#FDF8F2] text-[#221080] border-[#FDF8F2]' : 'border-[rgba(253,248,242,0.2)] text-[#FDF8F2]/70'
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
            <h2 className="font-heading text-[32px] font-light text-[#FDF8F2] mb-2">Über dich.</h2>
            <p className="text-[#FDF8F2]/50 text-sm font-body mb-6">Was sollen Menschen über dich wissen? (optional)</p>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 400))}
              placeholder="Erzähl in eigenen Worten..."
              rows={5}
              className="input resize-none"
            />
            <span className="text-[#FDF8F2]/30 text-xs block text-right mt-1">{bio.length}/400</span>
          </div>
        )}

        {/* Step 3: Interessen */}
        {step === 3 && (
          <div className="pt-6">
            <h2 className="font-heading text-[32px] font-light text-[#FDF8F2] mb-2">Deine Interessen.</h2>
            <p className="text-[#FDF8F2]/50 text-sm font-body mb-6">Was beschäftigt dich?</p>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((i) => (
                <button key={i} onClick={() => setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])}
                  className={cn('px-4 py-2 rounded-full text-sm font-body border transition-all',
                    interests.includes(i) ? 'bg-[#FDF8F2] text-[#221080] border-[#FDF8F2]' : 'border-[rgba(253,248,242,0.2)] text-[#FDF8F2]/70'
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
            <h2 className="font-heading text-[32px] font-light text-[#FDF8F2] mb-2">Meine Welt.</h2>
            <p className="text-[#FDF8F2]/50 text-sm font-body mb-6">Was gehört zu deiner Welt?</p>
            <div className="flex flex-wrap gap-2">
              {MY_WORLD_OPTIONS.map((w) => (
                <button key={w} onClick={() => setMyWorld(prev => prev.includes(w) ? prev.filter(x => x !== w) : [...prev, w])}
                  className={cn('px-4 py-2 rounded-full text-sm font-body border transition-all',
                    myWorld.includes(w) ? 'bg-[#FDF8F2] text-[#221080] border-[#FDF8F2]' : 'border-[rgba(253,248,242,0.2)] text-[#FDF8F2]/70'
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
              <h2 className="font-heading text-[32px] font-light text-[#FDF8F2] mb-2">Persönlichkeit.</h2>
              <p className="text-[#FDF8F2]/50 text-sm font-body mb-6">Wo siehst du dich auf diesen Spektren?</p>
            </div>
            {[
              { label1: 'Introvertiert', label2: 'Extrovertiert', val: introvert, set: setIntrovert },
              { label1: 'Spontan', label2: 'Strukturiert', val: spontan, set: setSpontan },
              { label1: 'Rational', label2: 'Emotional', val: rational, set: setRational },
            ].map((slider) => (
              <div key={slider.label1} className="space-y-2">
                <div className="flex justify-between text-xs text-[#FDF8F2]/50 font-body">
                  <span>{slider.label1}</span>
                  <span>{slider.label2}</span>
                </div>
                <input type="range" min={0} max={100} value={slider.val} onChange={(e) => slider.set(Number(e.target.value))}
                  className="w-full" style={{ accentColor: '#FDF8F2' }} />
              </div>
            ))}
          </div>
        )}

        {/* Step 6: Prompts */}
        {step === 6 && (
          <div className="pt-6 space-y-5">
            <div>
              <h2 className="font-heading text-[32px] font-light text-[#FDF8F2] mb-2">Deine Antworten.</h2>
              <p className="text-[#FDF8F2]/50 text-sm font-body mb-6">Beantworte mindestens 2 Fragen in deinen eigenen Worten.</p>
            </div>
            {prompts.map((p, i) => (
              <div key={i} className="bg-[rgba(253,248,242,0.06)] rounded-2xl p-4 border border-[rgba(253,248,242,0.1)]">
                <p className="text-[#FDF8F2]/60 text-xs uppercase tracking-widest font-body mb-2">{p.question}</p>
                <textarea
                  value={p.answer}
                  onChange={(e) => setPrompts(prev => prev.map((x, j) => j === i ? { ...x, answer: e.target.value.slice(0, 200) } : x))}
                  placeholder="Deine Antwort..."
                  rows={3}
                  className="w-full bg-transparent text-[#FDF8F2] text-sm font-body font-light resize-none focus:outline-none placeholder:text-[#FDF8F2]/25"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-4 bg-gradient-to-t from-[#221080] to-transparent">
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
      if (filters.zodiacSigns.length && p.sun_sign && !filters.zodiacSigns.includes(p.sun_sign))
        return false
      if (filters.communities.length && !filters.communities.some(c => p.communities?.includes(c)))
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

  // ── Pause screen ──────────────────────────────────────────────────────────

  if (isPaused) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <div className="text-5xl mb-6">🌙</div>
        <h2 className="font-heading text-4xl text-[#FDF8F2] mb-4">Du bist gerade in der Stille.</h2>
        <p className="text-[#FDF8F2]/60 leading-relaxed mb-8 max-w-sm font-body font-light">
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
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <div className="w-16 h-16 bg-[rgba(253,248,242,0.12)] rounded-full flex items-center justify-center mx-auto mb-6">
          <Search className="w-8 h-8 text-[#FDF8F2]/50" />
        </div>
        <h2 className="font-heading text-4xl text-[#FDF8F2] mb-4">Du hast heute bewusst geschaut.</h2>
        <p className="text-[#FDF8F2]/60 leading-relaxed mb-8 max-w-sm font-body font-light">
          10 Begegnungen für heute. Morgen gibt es neue Menschen zu entdecken.
          Nimm dir Zeit mit dem was du gesehen hast.
        </p>
        <button
          onClick={() => { setShowDailyLimit(false); openRevisitMode() }}
          className="btn-primary px-8 mb-3"
        >
          Zum Revisit-Modus →
        </button>
        <Link href="/profile" className="text-[#FDF8F2]/50 text-sm font-body hover:text-[#FDF8F2] transition-colors">
          Zum Profil
        </Link>
      </div>
    )
  }

  // ── Locked screen ──────────────────────────────────────────────────────────

  if (tier === 'free') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center bg-[#221080]">
        <div className="w-20 h-20 bg-[rgba(253,248,242,0.12)] rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-9 h-9 text-[#FDF8F2]/50" />
        </div>
        <h2 className="font-heading text-4xl text-[#FDF8F2] mb-3">Entdecken ist gesperrt</h2>
        <p className="text-[#FDF8F2]/60 leading-relaxed mb-8 max-w-sm">
          Mit der Mitgliedschaft (29&nbsp;€/Monat) kannst du Profile entdecken, swipen und Matches
          aufbauen.
        </p>
        <Link href="/pricing" className="bg-[#FDF8F2] text-[#1A1410] px-8 py-3.5 rounded-full font-body font-semibold hover:bg-white transition-colors">
          Mitgliedschaft ansehen
        </Link>
        <p className="text-xs text-[#FDF8F2]/30 mt-4">14 Tage Geld-zurück-Garantie</p>
      </div>
    )
  }

  // ── In connection screen ───────────────────────────────────────────────────

  if (isInConnection) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-[#221080]">
        <div className="w-20 h-20 bg-[rgba(253,248,242,0.12)] rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-10 h-10 text-[#FDF8F2]" />
        </div>
        <h2 className="font-heading text-4xl text-[#FDF8F2] mb-4">Du bist in einer Begegnung</h2>
        <p className="text-[#FDF8F2]/60 max-w-md leading-relaxed mb-8">
          Die One Connection Rule bedeutet: volle Aufmerksamkeit für eine Person.
        </p>
        <Link href={`/connection/${connectionId}`} className="bg-[#FDF8F2] text-[#1A1410] px-8 py-3.5 rounded-full font-body font-semibold hover:bg-white transition-colors">
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
        <div className="sticky top-0 z-30 bg-[#221080] px-4 py-2 flex items-center justify-between">
          <p className="text-[#FDF8F2]/80 text-xs font-body">Dein Zugang ist abgelaufen.</p>
          <Link href="/pricing" className="text-[#FDF8F2] text-xs font-body font-medium underline underline-offset-2">
            Jetzt Mitglied werden →
          </Link>
        </div>
      )}

      {/* ── Trial active hint ── */}
      {trialActive && trialDaysLeft <= 3 && trialDaysLeft > 0 && (
        <div className="sticky top-0 z-30 bg-[rgba(34,16,128,0.85)] backdrop-blur-sm px-4 py-2 flex items-center justify-between">
          <p className="text-[#FDF8F2]/80 text-xs font-body">✦ Du bist im Vollzugang — noch {trialDaysLeft} {trialDaysLeft === 1 ? 'Tag' : 'Tage'}</p>
          <Link href="/pricing" className="text-[#FDF8F2] text-xs font-body font-medium underline underline-offset-2">
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
              className="fixed top-0 right-0 h-full w-full max-w-sm bg-[#FDF8F2] z-50 shadow-2xl flex flex-col"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-[rgba(34,16,128,0.12)]">
                <h2 className="font-heading text-2xl text-[#120850]">Filter</h2>
                <div className="flex items-center gap-3">
                  {activeFilterCount > 0 && (
                    <button
                      onClick={() => {
                        setFilters(DEFAULT_FILTERS)
                        setCurrent(0)
                        setHistory([])
                      }}
                      className="flex items-center gap-1.5 text-sm text-[#6B6058] hover:text-[#1A1410] transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Zurücksetzen
                    </button>
                  )}
                  <button
                    onClick={() => setShowFilters(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[rgba(34,16,128,0.07)] transition-colors"
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
                    <span className="text-sm font-medium text-[#1A1410]">
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
                        className="w-full accent-[#221080]"
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
                        className="w-full accent-[#221080]"
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
                            ? 'bg-[#221080] border-[#221080] text-white'
                            : 'bg-white border-[rgba(34,16,128,0.12)] text-[#6B6058] hover:border-[#221080]/50',
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
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[rgba(34,16,128,0.12)] bg-white text-sm text-[#1A1410] placeholder:text-[#6B6058] focus:outline-none focus:border-[#221080]/50"
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
                  label="Sternzeichen"
                  options={['♈ Widder', '♉ Stier', '♊ Zwillinge', '♋ Krebs', '♌ Löwe', '♍ Jungfrau', '♎ Waage', '♏ Skorpion', '♐ Schütze', '♑ Steinbock', '♒ Wassermann', '♓ Fische']}
                  selected={filters.zodiacSigns}
                  onChange={(v) => {
                    setFilters((f) => ({ ...f, zodiacSigns: v }))
                    setCurrent(0)
                    setHistory([])
                  }}
                />
                <ChipGroup
                  label="Community"
                  options={['Bindungstypen', 'Bewusste Sexualität', 'Tantric Dating', 'Beziehungsmodelle', 'Selbstliebe & Heilung', 'Spiritualität & Partnerschaft']}
                  selected={filters.communities}
                  onChange={(v) => {
                    setFilters((f) => ({ ...f, communities: v }))
                    setCurrent(0)
                    setHistory([])
                  }}
                />
              </div>

              {/* Drawer footer */}
              <div className="px-6 py-5 border-t border-[rgba(34,16,128,0.12)]">
                <button onClick={() => setShowFilters(false)} className="w-full btn-primary py-3.5">
                  {profiles.length} {profiles.length === 1 ? 'Profil' : 'Profile'} anzeigen
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Page header ── */}
      <div className="sticky top-0 z-20 bg-transparent">
        <div className="flex items-center justify-between px-4 pt-5 pb-4 max-w-lg mx-auto">
          <SajaLogo size="md" onDark={false} />
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(true)}
              className={cn(
                'relative flex items-center gap-2 px-4 py-2 rounded-2xl border-2 text-sm font-medium transition-all',
                activeFilterCount > 0
                  ? 'border-[#FDF8F2] bg-[rgba(253,248,242,0.15)] text-[#FDF8F2]'
                  : 'border-[rgba(253,248,242,0.35)] text-[rgba(253,248,242,0.6)] hover:border-[rgba(253,248,242,0.6)]',
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filter
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#FDF8F2] text-[#1A1410] text-xs flex items-center justify-center font-semibold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Empty state ── */}
      {!hasProfile ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <Heart className="w-16 h-16 text-[#6B6058] mb-6" />
          {activeFilterCount > 0 ? (
            <>
              <h2 className="font-heading text-4xl text-[#120850] mb-3">Keine Treffer</h2>
              <p className="text-[#6B6058] max-w-sm mb-6">
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
              <h2 className="font-heading text-4xl text-[#120850] mb-3">Das war's erstmal</h2>
              <p className="text-[#6B6058] max-w-sm">
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
            {/* ── Photo 1 — swipeable ── */}
            <motion.div
              style={{ x, rotate, height: '80vh', touchAction: 'pan-y' } as any}
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
              className="relative mx-3 rounded-3xl overflow-hidden shadow-lg cursor-grab active:cursor-grabbing select-none"
            >
              {photoUrl(profile.photos?.[0]) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoUrl(profile.photos[0])}
                  alt={profile.name}
                  className="w-full h-full object-cover pointer-events-none"
                  style={{ objectPosition: 'center 20%' }}
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full bg-[rgba(34,16,128,0.07)] flex items-center justify-center">
                  <span className="font-heading text-8xl text-[#6B6058]">
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

              {/* Name / location gradient overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-[rgba(18,8,80,0.88)] to-transparent pointer-events-none z-10" />
              <div className="absolute bottom-5 left-5 text-white pointer-events-none z-10">
                <h2 className="font-heading text-4xl drop-shadow">
                  {profile.name}
                  {!profile.hide_age && profile.birth_date ? `, ${calculateAge(profile.birth_date)}` : !profile.hide_age && profile.age ? `, ${profile.age}` : ''}
                </h2>
                {!profile.hide_location && profile.location && (
                  <div className="flex items-center gap-1.5 text-white/80 text-sm mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {profile.location}
                  </div>
                )}
              </div>

              {/* Serendipity badge */}
              {serendipityIds.includes(profile.user_id) && (
                <div className="absolute top-4 right-4 z-20 bg-[rgba(18,8,80,0.75)] backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <span className="text-[#FDF8F2] text-xs font-body">✦ Überraschung</span>
                </div>
              )}

              {/* Scroll hint */}
              <div className="absolute bottom-5 right-5 text-white/60 pointer-events-none z-10 flex flex-col items-center gap-1">
                <ChevronDown className="w-5 h-5 animate-bounce" />
                <span className="text-xs">Profil</span>
              </div>
            </motion.div>

            {/* ── Below-photo content ── */}
            <div className="mt-2 mx-3 bg-[#FDF8F2] rounded-3xl overflow-hidden">

              {/* ── Emotionale Kapazität ── */}
              {profile.emotional_capacity && (() => {
                const CAP = { open: { dot: '#22C55E', label: 'Offen für Tiefe & Nähe' }, selective: { dot: '#EAB308', label: 'Selektiv & vorsichtig' }, light: { dot: '#3B82F6', label: 'Gerade eher leicht & locker' }, slow: { dot: '#9CA3AF', label: 'Slow Mode' } }
                const c = CAP[profile.emotional_capacity as keyof typeof CAP]
                return c ? (
                  <div className="px-5 pt-4 pb-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.dot }} />
                    <span className="text-xs text-[#6B6058] font-body">{c.label}</span>
                  </div>
                ) : null
              })()}

              {/* ── Was mich gerade bewegt ── */}
              {profile.current_moment && (
                <div className="px-5 pt-3 pb-1">
                  <p className="font-heading text-lg italic text-[#1A1410] leading-snug">&ldquo;{profile.current_moment}&rdquo;</p>
                </div>
              )}

              {/* ── Quick-info pills ── */}
              <div className="px-5 pt-5 pb-1 flex flex-wrap gap-2">
                {profile.height_cm && (
                  <span className="flex items-center gap-1.5 text-sm text-[#6B6058] bg-[rgba(34,16,128,0.07)] px-3 py-1.5 rounded-full">
                    <Ruler className="w-3.5 h-3.5" />{profile.height_cm} cm
                  </span>
                )}
                {profile.occupation && (
                  <span className="flex items-center gap-1.5 text-sm text-[#6B6058] bg-[rgba(34,16,128,0.07)] px-3 py-1.5 rounded-full">
                    <Briefcase className="w-3.5 h-3.5" />{profile.occupation}
                  </span>
                )}
                {profile.intention && (
                  <span className="flex items-center gap-1.5 text-sm text-[#1A1410] bg-[rgba(34,16,128,0.07)] px-3 py-1.5 rounded-full">
                    <Sparkles className="w-3.5 h-3.5" />{profile.intention}
                  </span>
                )}
                {profile.has_children && (
                  <span className="text-sm text-[#6B6058] bg-[rgba(34,16,128,0.07)] px-3 py-1.5 rounded-full">{profile.has_children}</span>
                )}
              </div>

              {/* ── Über mich ── */}
              {profile.bio && (
                <div className="px-5 py-5 border-t border-[rgba(34,16,128,0.10)]">
                  <p className="text-[11px] text-[#6B6058] uppercase tracking-widest mb-3">Über mich</p>
                  <p className="text-[#1A1410] text-sm leading-relaxed text-justify">{profile.bio}</p>
                </div>
              )}

              {/* ── Sprachmemo ── */}
              {profile.audio_prompt_url ? (
                <div className="px-5 py-5 border-t border-[rgba(34,16,128,0.10)]">
                  <p className="text-[11px] text-[#6B6058] uppercase tracking-widest mb-3">Sprachmemo</p>
                  <AudioPlayer url={profile.audio_prompt_url} />
                </div>
              ) : (
                <div className="px-5 py-5 border-t border-[rgba(34,16,128,0.10)] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[rgba(34,16,128,0.07)] flex items-center justify-center flex-shrink-0">
                    <Mic className="w-5 h-5 text-[#1A1410]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#1A1410] mb-1.5">Sprachmemo</p>
                    <div className="flex items-center gap-0.5 h-5">
                      {Array.from({ length: 26 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-[#221080]/25 rounded-full"
                          style={{ height: `${30 + Math.sin(i * 0.9) * 50 + Math.cos(i * 1.4) * 20}%` }}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-[#6B6058] flex-shrink-0">Noch nicht aufgenommen</span>
                </div>
              )}

              {/* ── Interessen ── */}
              {profile.interests?.length > 0 && (
                <div className="px-5 py-5 border-t border-[rgba(34,16,128,0.10)]">
                  <p className="text-[11px] text-[#6B6058] uppercase tracking-widest mb-3">Interessen</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((item) => (
                      <span key={item} className="text-sm text-[#6B6058] bg-[rgba(34,16,128,0.07)] px-3 py-1.5 rounded-full">{item}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Werte ── */}
              {profile.werte?.length > 0 && (
                <div className="px-5 py-5 border-t border-[rgba(34,16,128,0.10)]">
                  <p className="text-[11px] text-[#6B6058] uppercase tracking-widest mb-3">Werte</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.werte.map((w) => (
                      <span key={w} className="text-sm text-[#1A1410] bg-[rgba(34,16,128,0.07)] px-3 py-1.5 rounded-full">{w}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Meine Welt ── */}
              {(profile.my_world?.length ?? 0) > 0 && (
                <div className="px-5 py-5 border-t border-[rgba(34,16,128,0.10)]">
                  <p className="text-[11px] text-[#6B6058] uppercase tracking-widest mb-3">Meine Welt</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.my_world!.map((item) => (
                      <span
                        key={item}
                        className="text-[11px] font-body font-light px-3 py-1.5 rounded-full"
                        style={{ background: 'rgba(34,16,128,0.08)', color: '#1A1410' }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Meine Communities ── */}
              {(profile.communities?.length ?? 0) > 0 && (
                <div className="px-5 py-5 border-t border-[rgba(34,16,128,0.10)]">
                  <p className="text-[11px] text-[#6B6058] uppercase tracking-widest mb-3">Meine Communities</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.communities!.map((c) => (
                      <span key={c} className="text-[12px] font-body px-3 py-1.5 rounded-full border border-[#221080]/30 text-[#1A1410] bg-[#221080]/8">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Beziehung & Bindung ── */}
              {(profile.relationship_model || profile.bindungstyp || profile.love_language) && (
                <div className="px-5 py-5 border-t border-[rgba(34,16,128,0.10)] space-y-4">
                  <p className="text-[11px] text-[#6B6058] uppercase tracking-widest">Beziehung &amp; Bindung</p>
                  {profile.relationship_model && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#6B6058]">Beziehungsmodell</span>
                      <span className="text-sm text-[#1A1410] font-medium">{profile.relationship_model}</span>
                    </div>
                  )}
                  {profile.bindungstyp && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#6B6058]">Bindungstyp</span>
                      <span className="text-sm text-[#1A1410] font-medium">{profile.bindungstyp}</span>
                    </div>
                  )}
                  {profile.love_language && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#6B6058]">Love Language</span>
                      <span className="text-sm text-[#1A1410] font-medium flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 text-[#1A1410]" />{profile.love_language}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* ── Persönlichkeit ── */}
              {(profile.introvert_extrovert != null ||
                profile.spontan_strukturiert != null ||
                profile.rational_emotional != null) && (
                <div className="px-5 py-5 border-t border-[rgba(34,16,128,0.10)] space-y-4">
                  <p className="text-[11px] text-[#6B6058] uppercase tracking-widest">Persönlichkeit</p>
                  {profile.introvert_extrovert != null && (
                    <PersonalityBar leftLabel="Introvertiert" rightLabel="Extrovertiert" value={profile.introvert_extrovert} />
                  )}
                  {profile.spontan_strukturiert != null && (
                    <PersonalityBar leftLabel="Spontan" rightLabel="Strukturiert" value={profile.spontan_strukturiert} />
                  )}
                  {profile.rational_emotional != null && (
                    <PersonalityBar leftLabel="Rational" rightLabel="Emotional" value={profile.rational_emotional} />
                  )}
                </div>
              )}

              {/* ── Horoskop ── */}
              {(profile.sun_sign || profile.ascendant || profile.chinese_zodiac) && (
                <div className="px-5 py-5 border-t border-[rgba(34,16,128,0.10)] space-y-3">
                  <p className="text-[11px] text-[#6B6058] uppercase tracking-widest">Horoskop</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.sun_sign && (
                      <span className="rounded-full text-[11px] px-3 py-1.5 font-body font-light" style={{ background: 'rgba(34,16,128,0.08)', color: '#1A1410' }}>
                        {profile.sun_sign}
                      </span>
                    )}
                    {profile.ascendant && (
                      <span className="rounded-full text-[11px] px-3 py-1.5 font-body font-light" style={{ background: 'rgba(34,16,128,0.08)', color: '#1A1410' }}>
                        ↑ {profile.ascendant.replace(/^[♈♉♊♋♌♍♎♏♐♑♒♓]\s*/, '')}
                      </span>
                    )}
                    {profile.chinese_zodiac && (
                      <span className="rounded-full text-[11px] px-3 py-1.5 font-body font-light" style={{ background: 'rgba(34,16,128,0.10)', color: '#1A1410' }}>
                        {profile.chinese_zodiac}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* ── Dealbreakers ── */}
              {profile.dealbreakers?.length > 0 && (
                <div className="px-5 py-5 border-t border-[rgba(34,16,128,0.10)]">
                  <p className="text-[11px] text-[#6B6058] uppercase tracking-widest mb-3">Dealbreaker</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.dealbreakers.map((d) => (
                      <span key={d} className="text-sm text-red-700/80 bg-red-50 border border-red-200/60 px-3 py-1.5 rounded-full">{d}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Intimität ── */}
              {profile.sexuality_visible && viewerSexualityVisible && (profile.sexuality_interests?.length ?? 0) > 0 ? (
                <div className="px-5 py-5 border-t border-[rgba(34,16,128,0.10)]">
                  <p className="text-[11px] text-[#6B6058] uppercase tracking-widest mb-3">Intimität</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.sexuality_interests!.map((item) => (
                      <span key={item} className="text-sm text-[#6B6058] bg-[rgba(34,16,128,0.07)] px-3 py-1.5 rounded-full">{item}</span>
                    ))}
                  </div>
                </div>
              ) : (!viewerSexualityVisible && profile.sexuality_visible) ? (
                <div className="px-5 py-5 border-t border-[rgba(34,16,128,0.10)]">
                  <p className="text-[11px] text-[#6B6058] uppercase tracking-widest mb-3">Intimität</p>
                  <p className="text-sm text-[#6B6058] italic">Teile deine Interessen im Profil um diese Informationen zu sehen.</p>
                </div>
              ) : null}

              {/* ── Interleaved: Foto 2–6 + Prompts ── */}
              {photoUrl(profile.photos?.[1]) && (
                <PhotoWithCaption photo={profile.photos[1]} alt={profile.name} />
              )}
              {profile.prompts?.[0]?.answer && (
                <PromptBlock question={profile.prompts[0].question} answer={profile.prompts[0].answer} />
              )}

              {photoUrl(profile.photos?.[2]) && (
                <PhotoWithCaption photo={profile.photos[2]} alt={profile.name} />
              )}
              {profile.prompts?.[1]?.answer && (
                <PromptBlock question={profile.prompts[1].question} answer={profile.prompts[1].answer} />
              )}

              {photoUrl(profile.photos?.[3]) && (
                <PhotoWithCaption photo={profile.photos[3]} alt={profile.name} />
              )}
              {profile.prompts?.[2]?.answer && (
                <PromptBlock question={profile.prompts[2].question} answer={profile.prompts[2].answer} />
              )}

              {photoUrl(profile.photos?.[4]) && (
                <PhotoWithCaption photo={profile.photos[4]} alt={profile.name} />
              )}

              {photoUrl(profile.photos?.[5]) && (
                <PhotoWithCaption photo={profile.photos[5]} alt={profile.name} />
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* ── Fixed Action Bar ── */}
      {hasProfile && (
        <div
          className="fixed left-0 right-0 z-30"
          style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom))' }}
        >
          <div className="flex items-center gap-2 max-w-sm mx-auto px-5 pb-3">
            {/* Gerade nicht (Pass) — ~30% width */}
            <button
              onClick={handlePass}
              className="py-3 rounded-full font-body font-light text-[13px] transition-all active:scale-95"
              style={{
                flex: '0 0 30%',
                background: 'transparent',
                border: '1.5px solid rgba(34,16,128,0.3)',
                color: '#6B6058',
              }}
            >
              Gerade nicht
            </button>

            {/* Undo */}
            <button
              onClick={handleUndo}
              disabled={history.length === 0}
              className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center transition-all flex-shrink-0',
                history.length === 0
                  ? 'text-[#1A1410]/15 cursor-not-allowed'
                  : 'text-[#6B6058] hover:bg-[rgba(34,16,128,0.06)] active:scale-95',
              )}
              aria-label="Rückgängig"
            >
              <CornerUpLeft className="w-4 h-4" />
            </button>

            {/* Fühlt sich stimmig an — ~65% width */}
            <button
              onClick={handleLike}
              className="py-3 rounded-full font-body font-normal text-[13px] bg-[#221080] text-[#FDF8F2] active:scale-95 transition-all hover:bg-[#120850]"
              style={{ flex: '1', letterSpacing: '0.02em' }}
            >
              Fühlt sich stimmig an ✦
            </button>
          </div>

          {/* Revisit-Mode Button */}
          {revisitIds.length >= 3 && (
            <div className="flex justify-center pb-1">
              <button
                onClick={openRevisitMode}
                disabled={loadingRevisit}
                className="text-xs text-[#6B6058] hover:text-[#1A1410] font-body transition-colors"
              >
                {loadingRevisit ? '…' : `↩ Nochmal anschauen (${revisitIds.length})`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Revisit Modal ── */}
      {showRevisit && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'var(--bg-indigo)', backgroundAttachment: 'fixed' }}>
          <div className="flex items-center justify-between px-5 pt-6 pb-4">
            <div>
              <h2 className="font-heading text-3xl text-[#FDF8F2]">Nochmal anschauen</h2>
              <p className="text-xs text-[#FDF8F2]/40 font-body mt-0.5">{revisitProfiles.length} Profile</p>
            </div>
            <button onClick={() => setShowRevisit(false)} className="w-8 h-8 flex items-center justify-center text-[#FDF8F2]/50 hover:text-[#FDF8F2]">
              <X className="w-5 h-5" />
            </button>
          </div>

          {revisitProfiles.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-[#FDF8F2]/40 text-center px-8">
              <p className="font-heading text-2xl">Keine Profile mehr in der Liste.</p>
            </div>
          ) : revisitIdx >= revisitProfiles.length ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
              <p className="font-heading text-3xl text-[#FDF8F2] mb-4">Das war's.</p>
              <p className="text-[#FDF8F2]/50 font-body mb-6">Du hast alle Revisit-Profile gesehen.</p>
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
                    <div className="w-full h-full bg-[rgba(253,248,242,0.08)] flex items-center justify-center">
                      <span className="font-heading text-8xl text-[#FDF8F2]/20">{rp.name?.[0]}</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[rgba(18,8,80,0.88)] to-transparent" />
                  <div className="absolute bottom-5 left-5 text-white">
                    <h3 className="font-heading text-3xl">{rp.name}{rp.age ? `, ${rp.age}` : ''}</h3>
                    {rp.location && !rp.hide_location && <p className="text-white/70 text-sm">{rp.location}</p>}
                  </div>
                </div>
                <div className="mt-2 mx-3 bg-[#FDF8F2] rounded-3xl p-5">
                  {rp.bio && <p className="text-[#1A1410] text-sm leading-relaxed">{rp.bio}</p>}
                  {rp.intention && <p className="mt-3 text-xs text-[#6B6058] uppercase tracking-wider">{rp.intention}</p>}
                </div>
              </div>
            )
          })()}

          {/* Revisit Action Bar */}
          {revisitProfiles.length > 0 && revisitIdx < revisitProfiles.length && (
            <div className="fixed bottom-0 left-0 right-0 px-5 pb-6 pt-3" style={{ background: 'rgba(34,16,128,0.9)', backdropFilter: 'blur(16px)' }}>
              <div className="flex gap-3 max-w-sm mx-auto">
                <button
                  onClick={async () => {
                    const rp = revisitProfiles[revisitIdx]
                    // Permanent pass — add to likes table, remove from revisit
                    await supabase.from('likes').insert({ from_user_id: currentUserId, to_user_id: rp.user_id }).maybeSingle()
                    await removeFromRevisit(rp.user_id)
                    setRevisitIdx(i => i + 1)
                  }}
                  className="flex-1 py-3.5 rounded-full font-body text-sm transition-all"
                  style={{ background: 'transparent', border: '0.5px solid rgba(253,248,242,0.3)', color: 'rgba(253,248,242,0.5)' }}
                >
                  Nicht mein Weg
                </button>
                <button
                  onClick={async () => {
                    const rp = revisitProfiles[revisitIdx]
                    await removeFromRevisit(rp.user_id)
                    // Like this profile
                    await supabase.from('likes').insert({ from_user_id: currentUserId, to_user_id: rp.user_id })
                    toast('Interesse gesendet!')
                    setRevisitIdx(i => i + 1)
                  }}
                  className="flex-1 py-3.5 rounded-full font-body text-sm bg-[#FDF8F2] text-[#1A1410] font-normal active:scale-95 transition-all"
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
          <div className="rounded-2xl p-5" style={{ background: 'rgba(18,8,80,0.95)', border: '0.5px solid rgba(253,248,242,0.12)', backdropFilter: 'blur(20px)' }}>
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">🌙</span>
              <div className="flex-1">
                <h4 className="font-heading text-lg text-[#FDF8F2] mb-1">Eine kurze Beobachtung</h4>
                <p className="text-xs text-[#FDF8F2]/55 font-body font-light leading-relaxed mb-3">
                  Du scheinst gerade viel Energie ins Dating zu stecken. Manchmal ist eine Pause das Bewussteste was man tun kann.
                </p>
                <div className="flex gap-2">
                  <Link href="/profile" className="flex-1 py-2 text-center rounded-full text-xs font-body bg-[#FDF8F2] text-[#1A1410]">
                    Pause einlegen
                  </Link>
                  <button onClick={() => setShowBurnout(false)} className="flex-1 py-2 text-center rounded-full text-xs font-body text-[#FDF8F2]/50" style={{ border: '0.5px solid rgba(253,248,242,0.2)' }}>
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


