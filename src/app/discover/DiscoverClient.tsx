'use client'

import { useState, useMemo, useRef } from 'react'
import {
  Heart, X, MapPin, Briefcase, Sparkles, SlidersHorizontal, RotateCcw,
  Search, ChevronDown, Lock, Mic, Ruler, CornerUpLeft, Play, Pause,
} from 'lucide-react'
import { photoUrl } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import type { Profile } from '@/types'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { SajaCircleAnimation } from '@/components/ui/SajaCircleAnimation'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  initialProfiles: Profile[]
  currentUserId: string
  isInConnection: boolean
  connectionId?: string
  tier: 'free' | 'membership' | 'premium'
}

interface Filters {
  ageMin: number
  ageMax: number
  distanceKm: number
  locationQuery: string
  intentions: string[]
  relationshipModels: string[]
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
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function countActiveFilters(f: Filters): number {
  let n = 0
  if (f.ageMin !== DEFAULT_FILTERS.ageMin || f.ageMax !== DEFAULT_FILTERS.ageMax) n++
  if (f.distanceKm !== 0 || f.locationQuery.trim()) n++
  if (f.intentions.length) n++
  if (f.relationshipModels.length) n++
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
      <p className="text-xs font-medium text-text/50 uppercase tracking-wider mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(toggle(selected, opt))}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm border transition-all',
              selected.includes(opt)
                ? 'bg-primary border-primary text-white'
                : 'bg-white border-[#E2DAD0] text-[#1A1410]/60 hover:border-[#9E6B47]/50',
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
      <div className="flex justify-between text-xs text-[#1A1410]/50">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
      <div className="h-2 bg-[#F6F2EC] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#9E6B47]/60 rounded-full transition-all"
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
    <div className="flex items-center gap-3 px-5 py-4 border-t border-[#F6F2EC]/70">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio
        ref={audioRef}
        src={url}
        onEnded={() => setPlaying(false)}
        preload="none"
      />
      <button
        onClick={handleToggle}
        className="w-10 h-10 rounded-full bg-[#9E6B47] flex items-center justify-center shadow flex-shrink-0 hover:bg-[#7A4E30] transition-colors active:scale-95"
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
                playing ? 'bg-[#9E6B47] animate-pulse' : 'bg-[#9E6B47]/30',
              )}
              style={{
                height: `${28 + Math.sin(i * 0.85) * 48 + Math.cos(i * 1.3) * 18}%`,
                animationDelay: `${i * 50}ms`,
              }}
            />
          ))}
        </div>
      </div>
      <Mic className="w-4 h-4 text-[#1A1410]/30 flex-shrink-0" />
    </div>
  )
}

/** Single prompt block */
function PromptBlock({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="px-5 py-5 border-t border-[#F6F2EC]/70">
      <p className="text-[11px] text-[#1A1410]/35 uppercase tracking-widest mb-2">{question}</p>
      <p className="font-heading text-xl italic text-[#7A4E30] leading-snug">{answer}</p>
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

  // Swipe motion values
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-18, 18])
  const likeOpacity = useTransform(x, [20, 100], [0, 1])
  const nopeOpacity = useTransform(x, [-20, -100], [0, 1])

  // Filtered profiles
  const profiles = useMemo(() => {
    return initialProfiles.filter((p) => {
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
      return true
    })
  }, [initialProfiles, filters])

  const profile = profiles[current] ?? null
  const activeFilterCount = countActiveFilters(filters)
  const hasProfile = profile !== null && current < profiles.length

  // ── Actions ──────────────────────────────────────────────────────────────

  function next() {
    setHistory((h) => [...h, current])
    setCurrent((c) => c + 1)
    x.set(0)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleLike() {
    if (!profile) return
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

  function handlePass() {
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

  // ── Locked screen ─────────────────────────────────────────────────────────

  if (tier === 'free') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center max-w-sm mx-auto">
        <div className="w-20 h-20 bg-[#F6F2EC] rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-9 h-9 text-[#1A1410]/30" />
        </div>
        <h2 className="font-heading text-4xl text-[#7A4E30] mb-3">Entdecken ist gesperrt</h2>
        <p className="text-[#1A1410]/55 leading-relaxed mb-8">
          Mit der Mitgliedschaft (29&nbsp;€/Monat) kannst du Profile entdecken, swipen und Matches
          aufbauen.
        </p>
        <Link href="/pricing" className="btn-primary px-8 py-3.5">
          Mitgliedschaft ansehen
        </Link>
        <p className="text-xs text-[#1A1410]/30 mt-4">14 Tage Geld-zurück-Garantie</p>
      </div>
    )
  }

  // ── In connection screen ───────────────────────────────────────────────────

  if (isInConnection) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <div className="w-20 h-20 bg-[#F6F2EC] rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-10 h-10 text-[#9E6B47]" />
        </div>
        <h2 className="font-heading text-4xl text-[#7A4E30] mb-4">Du bist in einer Begegnung</h2>
        <p className="text-[#1A1410]/60 max-w-md leading-relaxed mb-8">
          Die One Connection Rule bedeutet: volle Aufmerksamkeit für eine Person.
        </p>
        <Link href={`/connection/${connectionId}`} className="btn-primary">
          Zur Begegnung
        </Link>
      </div>
    )
  }

  // ── Main UI ───────────────────────────────────────────────────────────────

  return (
    <>
      <SajaCircleAnimation variant="match" visible={showMatchAnim} navigateTo="/matches" />

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
              className="fixed top-0 right-0 h-full w-full max-w-sm bg-[#FAF8F4] z-50 shadow-2xl flex flex-col"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#E2DAD0]">
                <h2 className="font-heading text-2xl text-[#7A4E30]">Filter</h2>
                <div className="flex items-center gap-3">
                  {activeFilterCount > 0 && (
                    <button
                      onClick={() => {
                        setFilters(DEFAULT_FILTERS)
                        setCurrent(0)
                        setHistory([])
                      }}
                      className="flex items-center gap-1.5 text-sm text-[#1A1410]/50 hover:text-[#9E6B47] transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Zurücksetzen
                    </button>
                  )}
                  <button
                    onClick={() => setShowFilters(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F6F2EC] transition-colors"
                  >
                    <X className="w-5 h-5 text-[#1A1410]/50" />
                  </button>
                </div>
              </div>

              {/* Drawer body */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
                {/* Age */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium text-[#1A1410]/50 uppercase tracking-wider">
                      Alter
                    </p>
                    <span className="text-sm font-medium text-[#1A1410]">
                      {filters.ageMin} – {filters.ageMax === 100 ? '100+' : filters.ageMax}
                    </span>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs text-[#1A1410]/40 mb-1">
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
                        className="w-full accent-[#9E6B47]"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-[#1A1410]/40 mb-1">
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
                        className="w-full accent-[#9E6B47]"
                      />
                    </div>
                  </div>
                </div>

                {/* Distance */}
                <div>
                  <p className="text-xs font-medium text-[#1A1410]/50 uppercase tracking-wider mb-3">
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
                            ? 'bg-[#9E6B47] border-[#9E6B47] text-white'
                            : 'bg-white border-[#E2DAD0] text-[#1A1410]/60 hover:border-[#9E6B47]/50',
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1410]/30" />
                    <input
                      type="text"
                      placeholder="Stadt eingeben …"
                      value={filters.locationQuery}
                      onChange={(e) => {
                        setFilters((f) => ({ ...f, locationQuery: e.target.value }))
                        setCurrent(0)
                        setHistory([])
                      }}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E2DAD0] bg-white text-sm text-[#1A1410] placeholder:text-[#1A1410]/30 focus:outline-none focus:border-[#9E6B47]/50"
                    />
                  </div>
                  <p className="text-xs text-[#1A1410]/30 mt-1.5">Filtert nach Stadtname im Profil</p>
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
              </div>

              {/* Drawer footer */}
              <div className="px-6 py-5 border-t border-[#E2DAD0]">
                <button onClick={() => setShowFilters(false)} className="w-full btn-primary py-3.5">
                  {profiles.length} {profiles.length === 1 ? 'Profil' : 'Profile'} anzeigen
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Page header ── */}
      <div className="flex items-center justify-between px-4 pt-6 pb-3 max-w-lg mx-auto">
        <h1 className="font-heading text-3xl text-[#7A4E30]">Entdecken</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#1A1410]/40">
            {hasProfile ? profiles.length - current : 0} Profile
          </span>
          <button
            onClick={() => setShowFilters(true)}
            className={cn(
              'relative flex items-center gap-2 px-4 py-2 rounded-2xl border-2 text-sm font-medium transition-all',
              activeFilterCount > 0
                ? 'border-[#9E6B47] bg-[#9E6B47]/5 text-[#9E6B47]'
                : 'border-[#E2DAD0] text-[#1A1410]/50 hover:border-[#9E6B47]/50',
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filter
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#9E6B47] text-white text-xs flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Empty state ── */}
      {!hasProfile ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <Heart className="w-16 h-16 text-[#9E6B47]/30 mb-6" />
          {activeFilterCount > 0 ? (
            <>
              <h2 className="font-heading text-4xl text-[#7A4E30] mb-3">Keine Treffer</h2>
              <p className="text-[#1A1410]/50 max-w-sm mb-6">
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
              <h2 className="font-heading text-4xl text-[#7A4E30] mb-3">Das war's erstmal</h2>
              <p className="text-[#1A1410]/50 max-w-sm">
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
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full bg-[#F6F2EC] flex items-center justify-center">
                  <span className="font-heading text-8xl text-[#9E6B47]/30">
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
              <div className="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-black/75 to-transparent pointer-events-none z-10" />
              <div className="absolute bottom-5 left-5 text-white pointer-events-none z-10">
                <h2 className="font-heading text-4xl drop-shadow">
                  {profile.name}
                  {!profile.hide_age && profile.age ? `, ${profile.age}` : ''}
                </h2>
                {!profile.hide_location && profile.location && (
                  <div className="flex items-center gap-1.5 text-white/80 text-sm mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {profile.location}
                  </div>
                )}
              </div>

              {/* Scroll hint */}
              <div className="absolute bottom-5 right-5 text-white/60 pointer-events-none z-10 flex flex-col items-center gap-1">
                <ChevronDown className="w-5 h-5 animate-bounce" />
                <span className="text-xs">Profil</span>
              </div>
            </motion.div>

            {/* ── Below-photo content ── */}
            <div className="mt-2">

              {/* Badges row: bindungstyp, love language, location chip */}
              <div className="px-5 pt-4 flex flex-wrap gap-2">
                {profile.bindungstyp && (
                  <span className="rounded-full bg-[#EDE8E0] text-[#7A4E30] text-sm px-3 py-1.5">
                    {profile.bindungstyp}
                  </span>
                )}
                {profile.love_language && (
                  <span className="rounded-full bg-[#EDE8E0] text-[#7A4E30] text-sm px-3 py-1.5">
                    {profile.love_language}
                  </span>
                )}
                {!profile.hide_location && profile.location && (
                  <span className="flex items-center gap-1 rounded-full bg-[#EDE8E0] text-[#7A4E30] text-sm px-3 py-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {profile.location}
                  </span>
                )}
              </div>

              {/* Photo 2 */}
              {photoUrl(profile.photos?.[1]) && (
                <div className="mx-3 mt-4 rounded-3xl overflow-hidden" style={{ height: '60vh' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoUrl(profile.photos[1])}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                </div>
              )}

              {/* Prompt 1 */}
              {profile.prompts?.[0] && (
                <PromptBlock
                  question={profile.prompts[0].question}
                  answer={profile.prompts[0].answer}
                />
              )}

              {/* Werte chips */}
              {profile.werte?.length > 0 && (
                <div className="px-5 py-4 border-t border-[#F6F2EC]/70">
                  <p className="text-[11px] text-[#1A1410]/35 uppercase tracking-widest mb-3">
                    Werte
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {profile.werte.map((w) => (
                      <span
                        key={w}
                        className="bg-[#EDE8E0] text-[#8B6040] text-sm px-3 py-1.5 rounded-full"
                      >
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Photo 3 */}
              {photoUrl(profile.photos?.[2]) && (
                <div className="mx-3 mt-1 rounded-3xl overflow-hidden" style={{ height: '60vh' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoUrl(profile.photos[2])}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                </div>
              )}

              {/* Prompt 2 */}
              {profile.prompts?.[1] && (
                <PromptBlock
                  question={profile.prompts[1].question}
                  answer={profile.prompts[1].answer}
                />
              )}

              {/* Photo 4 */}
              {photoUrl(profile.photos?.[3]) && (
                <div className="mx-3 mt-1 rounded-3xl overflow-hidden" style={{ height: '60vh' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoUrl(profile.photos[3])}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                </div>
              )}

              {/* Prompt 3 */}
              {profile.prompts?.[2] && (
                <PromptBlock
                  question={profile.prompts[2].question}
                  answer={profile.prompts[2].answer}
                />
              )}

              {/* Audio prompt */}
              {profile.audio_prompt_url && (
                <AudioPlayer url={profile.audio_prompt_url} />
              )}

              {/* Bottom info section */}
              <div className="px-5 py-5 border-t border-[#F6F2EC]/70 space-y-3">
                {profile.occupation && (
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="w-4 h-4 text-[#1A1410]/30 flex-shrink-0" />
                    <span className="text-[#1A1410]/70">{profile.occupation}</span>
                  </div>
                )}
                {profile.height_cm && (
                  <div className="flex items-center gap-2 text-sm">
                    <Ruler className="w-4 h-4 text-[#1A1410]/30 flex-shrink-0" />
                    <span className="text-[#1A1410]/70">{profile.height_cm} cm</span>
                  </div>
                )}
                {profile.has_children && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#1A1410]/40">Kinder</span>
                    <span className="text-[#1A1410]/70">{profile.has_children}</span>
                  </div>
                )}
                {profile.relationship_model && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#1A1410]/40">Beziehungsmodell</span>
                    <span className="text-[#1A1410]/70">{profile.relationship_model}</span>
                  </div>
                )}
                {profile.bio && (
                  <p className="text-sm text-[#1A1410]/65 leading-relaxed pt-1">{profile.bio}</p>
                )}
              </div>

              {/* Personality sliders (if any set) */}
              {(profile.introvert_extrovert != null ||
                profile.spontan_strukturiert != null ||
                profile.rational_emotional != null) && (
                <div className="px-5 py-5 border-t border-[#F6F2EC]/70 space-y-4">
                  <p className="text-[11px] text-[#1A1410]/35 uppercase tracking-widest">
                    Persönlichkeit
                  </p>
                  {profile.introvert_extrovert != null && (
                    <PersonalityBar
                      leftLabel="Introvertiert"
                      rightLabel="Extravertiert"
                      value={profile.introvert_extrovert}
                    />
                  )}
                  {profile.spontan_strukturiert != null && (
                    <PersonalityBar
                      leftLabel="Spontan"
                      rightLabel="Strukturiert"
                      value={profile.spontan_strukturiert}
                    />
                  )}
                  {profile.rational_emotional != null && (
                    <PersonalityBar
                      leftLabel="Rational"
                      rightLabel="Emotional"
                      value={profile.rational_emotional}
                    />
                  )}
                </div>
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
          <div className="flex items-center justify-between max-w-sm mx-auto px-6 pb-2">
            {/* Pass / Nope */}
            <button
              onClick={handlePass}
              className="w-14 h-14 rounded-full bg-white border-2 border-[#E2DAD0] shadow flex items-center justify-center hover:border-red-300 active:scale-95 transition-all"
              aria-label="Ablehnen"
            >
              <X className="w-6 h-6 text-[#1A1410]/40" />
            </button>

            {/* Undo */}
            <button
              onClick={handleUndo}
              disabled={history.length === 0}
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                history.length === 0
                  ? 'text-[#1A1410]/20 cursor-not-allowed'
                  : 'text-[#1A1410]/50 hover:bg-[#F6F2EC] active:scale-95',
              )}
              aria-label="Rückgängig"
            >
              <CornerUpLeft className="w-5 h-5" />
            </button>

            {/* Like */}
            <button
              onClick={handleLike}
              className="w-[72px] h-[72px] rounded-full bg-[#9E6B47] shadow-xl flex items-center justify-center hover:bg-[#7A4E30] active:scale-95 transition-all"
              aria-label="Gefällt mir"
            >
              <Heart className="w-8 h-8 text-white fill-white" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
