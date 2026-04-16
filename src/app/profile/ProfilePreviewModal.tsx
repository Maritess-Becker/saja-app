'use client'

import { useState, useRef } from 'react'
import { X, MapPin, Briefcase, Ruler, Sparkles, Mic, Play, Pause, Heart } from 'lucide-react'
import type { Profile } from '@/types'
import { photoUrl, cn } from '@/lib/utils'

// ── Shared sub-components ────────────────────────────────────────────────────

function PersonalityBar({ leftLabel, rightLabel, value }: { leftLabel: string; rightLabel: string; value: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-[#1A1410]/40">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
      <div className="h-1.5 bg-[#F6F2EC] rounded-full overflow-hidden">
        <div className="h-full bg-[#9E6B47]/50 rounded-full" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function AudioPlayer({ url }: { url: string }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)

  function handleToggle() {
    const el = audioRef.current
    if (!el) return
    if (playing) { el.pause(); setPlaying(false) }
    else { el.play().catch(() => {}); setPlaying(true) }
  }

  return (
    <div className="flex items-center gap-3">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} src={url} onEnded={() => setPlaying(false)} preload="none" />
      <button
        onClick={handleToggle}
        className="w-10 h-10 rounded-full bg-[#9E6B47] flex items-center justify-center shadow flex-shrink-0 hover:bg-[#7A4E30] transition-colors active:scale-95"
      >
        {playing ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white translate-x-0.5" />}
      </button>
      <div className="flex-1">
        <p className="text-sm font-medium text-[#1A1410] mb-1">Sprach-Intro anhören</p>
        <div className="flex items-end gap-0.5 h-4">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i}
              className={cn('w-0.5 rounded-full transition-all', playing ? 'bg-[#9E6B47] animate-pulse' : 'bg-[#9E6B47]/30')}
              style={{ height: `${28 + Math.sin(i * 0.85) * 48 + Math.cos(i * 1.3) * 18}%`, animationDelay: `${i * 50}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function PhotoWithCaption({ photo, alt }: { photo: { url: string; path: string; caption?: string }; alt: string }) {
  const url = photoUrl(photo)
  if (!url) return null
  return (
    <div className="mt-3">
      <div className="mx-3 rounded-3xl overflow-hidden shadow-sm" style={{ height: '60vh' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={alt} className="w-full h-full object-cover" />
      </div>
      {photo.caption && (
        <p className="px-5 pt-2.5 text-sm text-[#1A1410]/55 italic leading-relaxed text-justify">{photo.caption}</p>
      )}
    </div>
  )
}

function PromptBlock({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="px-4 py-4 border-t border-[#E2DAD0]/70">
      <div className="bg-[#F6F2EC] rounded-xl px-4 py-4 border-l-[3px] border-[#9E6B47]">
        <p className="text-[11px] text-[#1A1410]/40 uppercase tracking-widest mb-2">{question}</p>
        <p className="font-heading text-xl italic text-[#7A4E30] leading-snug text-justify">{answer}</p>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  profile: Profile | null
  children: React.ReactNode
}

export function ProfilePreviewModal({ profile, children }: Props) {
  const [open, setOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  if (!profile) return <>{children}</>

  const photos = profile.photos ?? []

  return (
    <>
      {/* Trigger — wraps the avatar or any other element */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="cursor-pointer focus:outline-none"
        aria-label="Profilvorschau öffnen"
      >
        {children}
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[100] flex flex-col" aria-modal="true" role="dialog">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setOpen(false)}
          />

          {/* Sheet — slides up from bottom, full height, max-width centred */}
          <div
            ref={scrollRef}
            className="relative z-10 mt-12 mx-auto w-full max-w-lg flex-1 overflow-y-auto bg-[#FAF8F4] rounded-t-3xl shadow-2xl"
            style={{ maxHeight: 'calc(100dvh - 3rem)' }}
          >
            {/* Sticky top bar */}
            <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-[#FAF8F4]/90 backdrop-blur-sm border-b border-[#E2DAD0]/60">
              <p className="text-xs font-body font-medium text-[#9E6B47] uppercase tracking-widest">
                So sieht dein Profil aus
              </p>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F6F2EC] hover:bg-[#E2DAD0] transition-colors"
                aria-label="Schließen"
              >
                <X className="w-4 h-4 text-[#1A1410]/60" />
              </button>
            </div>

            {/* ── Foto 1 — hero mit Name-Overlay ── */}
            <div className="relative mx-3 mt-3 rounded-3xl overflow-hidden" style={{ height: '80vh' }}>
              {photoUrl(photos[0]) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoUrl(photos[0])}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                  style={{ objectPosition: 'center 20%' }}
                />
              ) : (
                <div className="w-full h-full bg-[#F6F2EC] flex items-center justify-center">
                  <span className="font-heading text-8xl text-[#9E6B47]/30">{profile.name?.[0]}</span>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-black/75 to-transparent pointer-events-none" />
              <div className="absolute bottom-5 left-5 text-white pointer-events-none">
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
            </div>

            {/* ── Quick-info pills ── */}
            <div className="px-5 pt-5 pb-1 flex flex-wrap gap-2">
              {profile.height_cm && (
                <span className="flex items-center gap-1.5 text-sm text-[#1A1410]/60 bg-[#F6F2EC] px-3 py-1.5 rounded-full">
                  <Ruler className="w-3.5 h-3.5" />{profile.height_cm} cm
                </span>
              )}
              {profile.occupation && (
                <span className="flex items-center gap-1.5 text-sm text-[#1A1410]/60 bg-[#F6F2EC] px-3 py-1.5 rounded-full">
                  <Briefcase className="w-3.5 h-3.5" />{profile.occupation}
                </span>
              )}
              {profile.intention && (
                <span className="flex items-center gap-1.5 text-sm text-[#9E6B47] bg-[#F6F2EC] px-3 py-1.5 rounded-full">
                  <Sparkles className="w-3.5 h-3.5" />{profile.intention}
                </span>
              )}
              {profile.has_children && (
                <span className="text-sm text-[#1A1410]/60 bg-[#F6F2EC] px-3 py-1.5 rounded-full">{profile.has_children}</span>
              )}
            </div>

            {/* ── Über mich ── */}
            {profile.bio && (
              <div className="px-5 py-5 border-t border-[#E2DAD0]/70">
                <p className="text-[11px] text-[#1A1410]/35 uppercase tracking-widest mb-3">Über mich</p>
                <p className="text-[#1A1410]/70 text-sm leading-relaxed text-justify">{profile.bio}</p>
              </div>
            )}

            {/* ── Sprachmemo ── */}
            {profile.audio_prompt_url ? (
              <div className="px-5 py-5 border-t border-[#E2DAD0]/70">
                <p className="text-[11px] text-[#1A1410]/35 uppercase tracking-widest mb-3">Sprachmemo</p>
                <AudioPlayer url={profile.audio_prompt_url} />
              </div>
            ) : (
              <div className="px-5 py-5 border-t border-[#E2DAD0]/70 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F6F2EC] flex items-center justify-center flex-shrink-0">
                  <Mic className="w-5 h-5 text-[#9E6B47]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#1A1410] mb-1.5">Sprachmemo</p>
                  <div className="flex items-center gap-0.5 h-5">
                    {Array.from({ length: 26 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-[#9E6B47]/25 rounded-full"
                        style={{ height: `${30 + Math.sin(i * 0.9) * 50 + Math.cos(i * 1.4) * 20}%` }}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-xs text-[#1A1410]/35 flex-shrink-0">Noch nicht aufgenommen</span>
              </div>
            )}

            {/* ── Interessen ── */}
            {profile.interests?.length > 0 && (
              <div className="px-5 py-5 border-t border-[#E2DAD0]/70">
                <p className="text-[11px] text-[#1A1410]/35 uppercase tracking-widest mb-3">Interessen</p>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((item) => (
                    <span key={item} className="text-sm text-[#1A1410]/60 bg-[#F6F2EC] px-3 py-1.5 rounded-full">{item}</span>
                  ))}
                </div>
              </div>
            )}

            {/* ── Werte ── */}
            {profile.werte?.length > 0 && (
              <div className="px-5 py-5 border-t border-[#E2DAD0]/70">
                <p className="text-[11px] text-[#1A1410]/35 uppercase tracking-widest mb-3">Werte</p>
                <div className="flex flex-wrap gap-2">
                  {profile.werte.map((w) => (
                    <span key={w} className="text-sm text-[#9E6B47] bg-[#F6F2EC] px-3 py-1.5 rounded-full">{w}</span>
                  ))}
                </div>
              </div>
            )}

            {/* ── Beziehung & Bindung ── */}
            {(profile.relationship_model || profile.bindungstyp || profile.love_language) && (
              <div className="px-5 py-5 border-t border-[#E2DAD0]/70 space-y-4">
                <p className="text-[11px] text-[#1A1410]/35 uppercase tracking-widest">Beziehung &amp; Bindung</p>
                {profile.relationship_model && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#1A1410]/40">Beziehungsmodell</span>
                    <span className="text-sm text-[#1A1410] font-medium">{profile.relationship_model}</span>
                  </div>
                )}
                {profile.bindungstyp && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#1A1410]/40">Bindungstyp</span>
                    <span className="text-sm text-[#1A1410] font-medium">{profile.bindungstyp}</span>
                  </div>
                )}
                {profile.love_language && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#1A1410]/40">Love Language</span>
                    <span className="text-sm text-[#1A1410] font-medium flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-[#9E6B47]" />{profile.love_language}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* ── Persönlichkeit ── */}
            {(profile.introvert_extrovert != null || profile.spontan_strukturiert != null || profile.rational_emotional != null) && (
              <div className="px-5 py-5 border-t border-[#E2DAD0]/70 space-y-4">
                <p className="text-[11px] text-[#1A1410]/35 uppercase tracking-widest">Persönlichkeit</p>
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

            {/* ── Horoskop ── */}
            {(profile.sun_sign || profile.ascendant || profile.chinese_zodiac) && (
              <div className="px-5 py-5 border-t border-[#E2DAD0]/70 space-y-3">
                <p className="text-[11px] text-[#1A1410]/35 uppercase tracking-widest">Horoskop</p>
                <div className="flex flex-wrap gap-2">
                  {profile.sun_sign && (
                    <span className="rounded-full text-[11px] px-3 py-1.5 font-body font-light" style={{ background: 'rgba(180,140,110,0.14)', color: '#8B6040' }}>
                      {profile.sun_sign}
                    </span>
                  )}
                  {profile.ascendant && (
                    <span className="rounded-full text-[11px] px-3 py-1.5 font-body font-light" style={{ background: 'rgba(180,140,110,0.14)', color: '#8B6040' }}>
                      ↑ {profile.ascendant.replace(/^[♈♉♊♋♌♍♎♏♐♑♒♓]\s*/, '')}
                    </span>
                  )}
                  {profile.chinese_zodiac && (
                    <span className="rounded-full text-[11px] px-3 py-1.5 font-body font-light" style={{ background: 'rgba(120,100,160,0.12)', color: '#7864A0' }}>
                      {profile.chinese_zodiac}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* ── Dealbreakers ── */}
            {profile.dealbreakers?.length > 0 && (
              <div className="px-5 py-5 border-t border-[#E2DAD0]/70">
                <p className="text-[11px] text-[#1A1410]/35 uppercase tracking-widest mb-3">Dealbreaker</p>
                <div className="flex flex-wrap gap-2">
                  {profile.dealbreakers.map((d) => (
                    <span key={d} className="text-sm text-red-700/80 bg-red-50 border border-red-200/60 px-3 py-1.5 rounded-full">{d}</span>
                  ))}
                </div>
              </div>
            )}

            {/* ── Interleaved: Foto 2–6 + Prompts ── */}
            {photos[1] && <PhotoWithCaption photo={photos[1]} alt={profile.name} />}
            {profile.prompts?.[0]?.answer && (
              <PromptBlock question={profile.prompts[0].question} answer={profile.prompts[0].answer} />
            )}

            {photos[2] && <PhotoWithCaption photo={photos[2]} alt={profile.name} />}
            {profile.prompts?.[1]?.answer && (
              <PromptBlock question={profile.prompts[1].question} answer={profile.prompts[1].answer} />
            )}

            {photos[3] && <PhotoWithCaption photo={photos[3]} alt={profile.name} />}
            {profile.prompts?.[2]?.answer && (
              <PromptBlock question={profile.prompts[2].question} answer={profile.prompts[2].answer} />
            )}

            {photos[4] && <PhotoWithCaption photo={photos[4]} alt={profile.name} />}
            {photos[5] && <PhotoWithCaption photo={photos[5]} alt={profile.name} />}

            {/* Bottom padding */}
            <div className="h-10" />
          </div>
        </div>
      )}
    </>
  )
}
