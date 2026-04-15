'use client'

import { useState, useMemo } from 'react'
import {
  Heart, X, MapPin, Briefcase, Sparkles, SlidersHorizontal, RotateCcw,
  Search, ChevronDown, Lock, Mic, Ruler,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import type { Profile } from '@/types'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { SajaCircleAnimation } from '@/components/ui/SajaCircleAnimation'

interface Props {
  initialProfiles: Profile[]
  currentUserId: string
  isInConnection: boolean
  connectionId?: string
  tier: 'free' | 'membership' | 'premium'
}

const DISTANCE_OPTIONS = [
  { label: 'Egal', value: 0 },
  { label: '< 25 km', value: 25 },
  { label: '< 50 km', value: 50 },
  { label: '< 100 km', value: 100 },
  { label: '< 200 km', value: 200 },
]

interface Filters {
  ageMin: number
  ageMax: number
  distanceKm: number
  locationQuery: string
  intentions: string[]
  relationshipModels: string[]
}

const DEFAULT_FILTERS: Filters = {
  ageMin: 18,
  ageMax: 100,
  distanceKm: 0,
  locationQuery: '',
  intentions: [],
  relationshipModels: [],
}

const INTENTION_OPTIONS = ['Ernsthafte Beziehung', 'Freundschaft & mehr', 'Bewusstes Dating', 'Offenes Erkunden']
const RELATIONSHIP_OPTIONS = ['Monogam', 'Polyamorös', 'Solo-Poly', 'Offen', 'Noch unsicher']

function countActiveFilters(f: Filters): number {
  let n = 0
  if (f.ageMin !== DEFAULT_FILTERS.ageMin || f.ageMax !== DEFAULT_FILTERS.ageMax) n++
  if (f.distanceKm !== 0 || f.locationQuery.trim()) n++
  if (f.intentions.length) n++
  if (f.relationshipModels.length) n++
  return n
}

function toggle(arr: string[], val: string) {
  return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]
}

function ChipGroup({ label, options, selected, onChange }: {
  label: string; options: string[]; selected: string[]; onChange: (val: string[]) => void
}) {
  return (
    <div>
      <p className="text-xs font-medium text-text/50 uppercase tracking-wider mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button key={opt} onClick={() => onChange(toggle(selected, opt))}
            className={cn('px-3 py-1.5 rounded-full text-sm border transition-all',
              selected.includes(opt) ? 'bg-primary border-primary text-white' : 'bg-white border-sand text-text/60 hover:border-primary/50'
            )}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

/** Read-only personality slider displayed as a progress bar */
function PersonalityBar({ leftLabel, rightLabel, value }: { leftLabel: string; rightLabel: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-text/50">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
      <div className="h-2 bg-sand rounded-full overflow-hidden">
        <div className="h-full bg-primary/60 rounded-full transition-all" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

export function DiscoverClient({ initialProfiles, currentUserId, isInConnection, connectionId, tier }: Props) {
  const supabase = createClient()
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [showFilters, setShowFilters] = useState(false)
  const [current, setCurrent] = useState(0)
  const [showMatchAnim, setShowMatchAnim] = useState(false)

  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-18, 18])
  const likeOpacity = useTransform(x, [20, 100], [0, 1])
  const nopeOpacity = useTransform(x, [-20, -100], [0, 1])

  const profiles = useMemo(() => {
    return initialProfiles.filter((p) => {
      if (p.age !== null) {
        if (p.age < filters.ageMin || p.age > filters.ageMax) return false
      }
      if (filters.locationQuery.trim()) {
        const q = filters.locationQuery.trim().toLowerCase()
        if (!p.location?.toLowerCase().includes(q)) return false
      }
      if (filters.intentions.length && p.intention && !filters.intentions.includes(p.intention)) return false
      if (filters.relationshipModels.length && p.relationship_model && !filters.relationshipModels.includes(p.relationship_model)) return false
      return true
    })
  }, [initialProfiles, filters])

  const profile = profiles[current]
  const activeFilterCount = countActiveFilters(filters)

  async function handleLike() {
    if (!profile) return
    const { error } = await supabase.from('likes').insert({
      from_user_id: currentUserId,
      to_user_id: profile.user_id,
    })
    if (!error) {
      const { data: theirLike } = await supabase
        .from('likes').select('id')
        .eq('from_user_id', profile.user_id)
        .eq('to_user_id', currentUserId)
        .maybeSingle()
      if (theirLike) {
        await supabase.from('matches').insert({ user1_id: currentUserId, user2_id: profile.user_id, status: 'open' })
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
    next()
  }

  function next() {
    setCurrent((c) => c + 1)
    x.set(0)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (tier === 'free') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center max-w-sm mx-auto">
        <div className="w-20 h-20 bg-sand rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-9 h-9 text-text/30" />
        </div>
        <h2 className="font-heading text-4xl text-dark mb-3">Entdecken ist gesperrt</h2>
        <p className="text-text/55 leading-relaxed mb-8">
          Mit der Mitgliedschaft (29 €/Monat) kannst du Profile entdecken, swipen und Matches aufbauen.
        </p>
        <Link href="/pricing" className="btn-primary px-8 py-3.5">Mitgliedschaft ansehen</Link>
        <p className="text-xs text-text/30 mt-4">14 Tage Geld-zurück-Garantie</p>
      </div>
    )
  }

  if (isInConnection) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <div className="w-20 h-20 bg-light rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-10 h-10 text-primary" />
        </div>
        <h2 className="font-heading text-4xl text-dark mb-4">Du bist in einer Begegnung</h2>
        <p className="text-text/60 max-w-md leading-relaxed mb-8">
          Die One Connection Rule bedeutet: volle Aufmerksamkeit für eine Person.
        </p>
        <Link href={`/connection/${connectionId}`} className="btn-primary">Zur Begegnung</Link>
      </div>
    )
  }

  return (
    <>
      <SajaCircleAnimation variant="match" visible={showMatchAnim} navigateTo="/matches" />

      {/* Filter Drawer */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)} className="fixed inset-0 bg-black/30 z-40" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed top-0 right-0 h-full w-full max-w-sm bg-background z-50 shadow-2xl flex flex-col">
              <div className="flex items-center justify-between px-6 py-5 border-b border-sand">
                <h2 className="font-heading text-2xl text-dark">Filter</h2>
                <div className="flex items-center gap-3">
                  {activeFilterCount > 0 && (
                    <button onClick={() => { setFilters(DEFAULT_FILTERS); setCurrent(0) }}
                      className="flex items-center gap-1.5 text-sm text-text/50 hover:text-primary transition-colors">
                      <RotateCcw className="w-3.5 h-3.5" /> Zurücksetzen
                    </button>
                  )}
                  <button onClick={() => setShowFilters(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-sand transition-colors">
                    <X className="w-5 h-5 text-text/50" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
                {/* Age */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium text-text/50 uppercase tracking-wider">Alter</p>
                    <span className="text-sm font-medium text-dark">{filters.ageMin} – {filters.ageMax === 100 ? '100+' : filters.ageMax}</span>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs text-text/40 mb-1"><span>Von</span><span>{filters.ageMin}</span></div>
                      <input type="range" min={18} max={99} value={filters.ageMin}
                        onChange={(e) => { const v = Number(e.target.value); setFilters(f => ({ ...f, ageMin: Math.min(v, f.ageMax - 1) })); setCurrent(0) }}
                        className="w-full accent-primary" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-text/40 mb-1"><span>Bis</span><span>{filters.ageMax === 100 ? '100+' : filters.ageMax}</span></div>
                      <input type="range" min={19} max={100} value={filters.ageMax}
                        onChange={(e) => { const v = Number(e.target.value); setFilters(f => ({ ...f, ageMax: Math.max(v, f.ageMin + 1) })); setCurrent(0) }}
                        className="w-full accent-primary" />
                    </div>
                  </div>
                </div>
                {/* Distance */}
                <div>
                  <p className="text-xs font-medium text-text/50 uppercase tracking-wider mb-3">Entfernung</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {DISTANCE_OPTIONS.map(opt => (
                      <button key={opt.value} onClick={() => { setFilters(f => ({ ...f, distanceKm: opt.value })); setCurrent(0) }}
                        className={cn('px-3 py-1.5 rounded-full text-sm border transition-all',
                          filters.distanceKm === opt.value ? 'bg-primary border-primary text-white' : 'bg-white border-sand text-text/60 hover:border-primary/50')}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text/30" />
                    <input type="text" placeholder="Stadt eingeben …" value={filters.locationQuery}
                      onChange={(e) => { setFilters(f => ({ ...f, locationQuery: e.target.value })); setCurrent(0) }}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-sand bg-white text-sm text-dark placeholder:text-text/30 focus:outline-none focus:border-primary/50" />
                  </div>
                  <p className="text-xs text-text/30 mt-1.5">Filtert nach Stadtname im Profil</p>
                </div>
                <ChipGroup label="Intention" options={INTENTION_OPTIONS} selected={filters.intentions}
                  onChange={(v) => { setFilters(f => ({ ...f, intentions: v })); setCurrent(0) }} />
                <ChipGroup label="Beziehungsmodell" options={RELATIONSHIP_OPTIONS} selected={filters.relationshipModels}
                  onChange={(v) => { setFilters(f => ({ ...f, relationshipModels: v })); setCurrent(0) }} />
              </div>
              <div className="px-6 py-5 border-t border-sand">
                <button onClick={() => setShowFilters(false)} className="w-full btn-primary py-3.5">
                  {profiles.length} {profiles.length === 1 ? 'Profil' : 'Profile'} anzeigen
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-6 pb-3 max-w-lg mx-auto">
        <h1 className="font-heading text-3xl text-dark">Entdecken</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-text/40">
            {!profile || current >= profiles.length ? 0 : profiles.length - current} Profile
          </span>
          <button onClick={() => setShowFilters(true)}
            className={cn('relative flex items-center gap-2 px-4 py-2 rounded-2xl border-2 text-sm font-medium transition-all',
              activeFilterCount > 0 ? 'border-primary bg-primary/5 text-primary' : 'border-sand text-text/50 hover:border-primary/50')}>
            <SlidersHorizontal className="w-4 h-4" />
            Filter
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">{activeFilterCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* No profiles */}
      {(!profile || current >= profiles.length) ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <Heart className="w-16 h-16 text-primary/30 mb-6" />
          {activeFilterCount > 0 ? (
            <>
              <h2 className="font-heading text-4xl text-dark mb-3">Keine Treffer</h2>
              <p className="text-text/50 max-w-sm mb-6">Passe die Filter an oder setze sie zurück.</p>
              <button onClick={() => { setFilters(DEFAULT_FILTERS); setCurrent(0) }} className="btn-secondary px-6 py-3">Filter zurücksetzen</button>
            </>
          ) : (
            <>
              <h2 className="font-heading text-4xl text-dark mb-3">Das war's erstmal</h2>
              <p className="text-text/50 max-w-sm">Schau später wieder vorbei — neue Menschen kommen täglich dazu.</p>
            </>
          )}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={profile.user_id}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="max-w-lg mx-auto pb-36"
          >
            {/* ── Photo area (swipeable) ── */}
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
              className="relative mx-3 rounded-3xl overflow-hidden shadow-lg cursor-grab active:cursor-grabbing"
            >
              {/* Foto 1 — nur erstes Bild, kein Karussell */}
              {profile.photos?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.photos[0]}
                  alt={profile.name}
                  className="w-full h-full object-cover pointer-events-none"
                />
              ) : (
                <div className="w-full h-full bg-sand flex items-center justify-center">
                  <span className="font-heading text-8xl text-primary/30">{profile.name?.[0]}</span>
                </div>
              )}

              {/* LIKE overlay */}
              <motion.div style={{ opacity: likeOpacity }}
                className="absolute top-12 left-6 border-4 border-accent text-accent font-heading text-3xl px-5 py-2 rounded-xl rotate-[-15deg] pointer-events-none z-20">
                LIKE
              </motion.div>
              {/* NOPE overlay */}
              <motion.div style={{ opacity: nopeOpacity }}
                className="absolute top-12 right-6 border-4 border-red-400 text-red-400 font-heading text-3xl px-5 py-2 rounded-xl rotate-[15deg] pointer-events-none z-20">
                NOPE
              </motion.div>

              {/* Name / location gradient overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-black/75 to-transparent pointer-events-none z-10" />
              <div className="absolute bottom-5 left-5 text-white pointer-events-none z-10">
                <h2 className="font-heading text-4xl drop-shadow">
                  {profile.name}{!profile.hide_age && profile.age ? `, ${profile.age}` : ''}
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

            {/* ── Hinge-Style: fließendes Profil mit verteilten Fotos ── */}
            <div className="mt-2">

              {/* Kurzinfos als Chips */}
              <div className="px-5 pt-4 pb-1 flex flex-wrap gap-2">
                {profile.height_cm && (
                  <span className="flex items-center gap-1.5 text-sm text-text/60 bg-sand px-3 py-1.5 rounded-full">
                    <Ruler className="w-3.5 h-3.5" />{profile.height_cm} cm
                  </span>
                )}
                {profile.occupation && (
                  <span className="flex items-center gap-1.5 text-sm text-text/60 bg-sand px-3 py-1.5 rounded-full">
                    <Briefcase className="w-3.5 h-3.5" />{profile.occupation}
                  </span>
                )}
                {profile.intention && (
                  <span className="flex items-center gap-1.5 text-sm text-primary bg-light px-3 py-1.5 rounded-full">
                    <Sparkles className="w-3.5 h-3.5" />{profile.intention}
                  </span>
                )}
                {profile.has_children && (
                  <span className="text-sm text-text/60 bg-sand px-3 py-1.5 rounded-full">{profile.has_children}</span>
                )}
              </div>

              {/* Foto 2 */}
              {profile.photos?.[1] && (
                <div className="mx-3 mt-4 rounded-3xl overflow-hidden" style={{ height: '62vh' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={profile.photos[1]} alt={profile.name} className="w-full h-full object-cover" />
                </div>
              )}

              {/* Zitat */}
              {profile.profile_quote && (
                <div className="px-5 pt-6 pb-4">
                  <p className="font-heading text-2xl text-dark italic leading-snug">
                    &ldquo;{profile.profile_quote}&rdquo;
                  </p>
                </div>
              )}

              {/* Sprach-Intro */}
              <div className="px-5 py-5 border-t border-sand/70 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-light flex items-center justify-center flex-shrink-0">
                  <Mic className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-dark mb-1.5">Sprach-Intro</p>
                  <div className="flex items-center gap-0.5 h-5">
                    {Array.from({ length: 26 }).map((_, i) => (
                      <div key={i} className="w-1 bg-primary/25 rounded-full animate-pulse"
                        style={{ height: `${30 + Math.sin(i * 0.9) * 50 + Math.cos(i * 1.4) * 20}%`, animationDelay: `${i * 55}ms` }} />
                    ))}
                  </div>
                </div>
                <span className="text-xs text-text/35 flex-shrink-0">Bald verfügbar</span>
              </div>

              {/* Foto 3 */}
              {profile.photos?.[2] && (
                <div className="mx-3 rounded-3xl overflow-hidden" style={{ height: '62vh' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={profile.photos[2]} alt={profile.name} className="w-full h-full object-cover" />
                </div>
              )}

              {/* Über mich */}
              {profile.bio && (
                <div className="px-5 py-5 border-t border-sand/70">
                  <p className="text-[11px] text-text/35 uppercase tracking-widest mb-3">Über mich</p>
                  <p className="text-text/70 text-sm leading-relaxed">{profile.bio}</p>
                </div>
              )}

              {/* Interessen */}
              {profile.interests?.length > 0 && (
                <div className="px-5 py-5 border-t border-sand/70">
                  <p className="text-[11px] text-text/35 uppercase tracking-widest mb-3">Interessen</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((item) => (
                      <span key={item} className="text-sm text-text/60 bg-sand px-3 py-1.5 rounded-full">{item}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Werte */}
              {profile.werte?.length > 0 && (
                <div className="px-5 py-5 border-t border-sand/70">
                  <p className="text-[11px] text-text/35 uppercase tracking-widest mb-3">Werte</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.werte.map((w) => (
                      <span key={w} className="text-sm text-primary bg-light px-3 py-1.5 rounded-full">{w}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Beziehung & Bindung */}
              {(profile.relationship_model || profile.bindungstyp || profile.love_language) && (
                <div className="px-5 py-5 border-t border-sand/70 space-y-4">
                  {profile.relationship_model && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-text/40">Beziehungsmodell</span>
                      <span className="text-sm text-dark font-medium">{profile.relationship_model}</span>
                    </div>
                  )}
                  {profile.bindungstyp && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-text/40">Bindungstyp</span>
                      <span className="text-sm text-dark font-medium">{profile.bindungstyp}</span>
                    </div>
                  )}
                  {profile.love_language && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-text/40">Love Language</span>
                      <span className="text-sm text-dark font-medium">{profile.love_language}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Persönlichkeit */}
              {(profile.introvert_extrovert != null || profile.spontan_strukturiert != null || profile.rational_emotional != null) && (
                <div className="px-5 py-5 border-t border-sand/70 space-y-4">
                  <p className="text-[11px] text-text/35 uppercase tracking-widest">Persönlichkeit</p>
                  {profile.introvert_extrovert != null && (
                    <PersonalityBar leftLabel="Introvertiert" rightLabel="Extravertiert" value={profile.introvert_extrovert} />
                  )}
                  {profile.spontan_strukturiert != null && (
                    <PersonalityBar leftLabel="Spontan" rightLabel="Strukturiert" value={profile.spontan_strukturiert} />
                  )}
                  {profile.rational_emotional != null && (
                    <PersonalityBar leftLabel="Rational" rightLabel="Emotional" value={profile.rational_emotional} />
                  )}
                </div>
              )}

            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* ── Sticky Like / Pass buttons ── */}
      {profile && current < profiles.length && (
        <div
          className="fixed left-0 right-0 flex items-center justify-center gap-8 z-30 pb-2"
          style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom))' }}
        >
          <button onClick={handlePass}
            className="w-16 h-16 rounded-full bg-white border-2 border-sand shadow-lg hover:border-red-300 active:scale-95 transition-all flex items-center justify-center">
            <X className="w-7 h-7 text-text/40" />
          </button>
          <button onClick={handleLike}
            className="w-20 h-20 rounded-full bg-primary shadow-xl hover:bg-dark active:scale-95 transition-all flex items-center justify-center">
            <Heart className="w-9 h-9 text-white fill-white" />
          </button>
        </div>
      )}
    </>
  )
}
