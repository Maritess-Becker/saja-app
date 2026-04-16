'use client'

import { useState, useRef } from 'react'
import { X, MapPin, Briefcase, Ruler, Mic, Play, Pause } from 'lucide-react'
import type { Profile } from '@/types'
import { photoUrl, cn } from '@/lib/utils'

// ── Shared sub-components ────────────────────────────────────────────────────

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
    <div className="flex items-center gap-3 px-5 py-4 border-t border-[#F6F2EC]/70">
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
            <div
              key={i}
              className={cn('w-0.5 rounded-full transition-all', playing ? 'bg-[#9E6B47] animate-pulse' : 'bg-[#9E6B47]/30')}
              style={{ height: `${28 + Math.sin(i * 0.85) * 48 + Math.cos(i * 1.3) * 18}%`, animationDelay: `${i * 50}ms` }}
            />
          ))}
        </div>
      </div>
      <Mic className="w-4 h-4 text-[#1A1410]/30 flex-shrink-0" />
    </div>
  )
}

function PromptBlock({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="px-4 py-4 border-t border-[#F6F2EC]/70">
      <div className="bg-[#F6F2EC] rounded-xl px-4 py-4 border-l-[3px] border-[#9E6B47]">
        <p className="text-[11px] text-[#1A1410]/40 uppercase tracking-widest mb-2">{question}</p>
        <p className="font-heading text-xl italic text-[#7A4E30] leading-snug">{answer}</p>
      </div>
    </div>
  )
}

function PhotoWithCaption({ photo, alt }: { photo: { url: string; path: string; caption?: string }; alt: string }) {
  const url = photoUrl(photo)
  if (!url) return null
  return (
    <div className="mx-3 mt-3">
      <div className="rounded-3xl overflow-hidden" style={{ height: '60vh' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={alt} className="w-full h-full object-cover" />
      </div>
      {photo.caption && (
        <p className="px-2 pt-2.5 text-sm text-[#1A1410]/60 italic leading-relaxed">{photo.caption}</p>
      )}
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

            {/* ── Photo 1 ── */}
            <div className="relative mx-3 mt-3 rounded-3xl overflow-hidden" style={{ height: '80vh' }}>
              {photoUrl(profile.photos?.[0]) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoUrl(profile.photos[0])}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                  style={{ objectPosition: 'center 20%' }}
                />
              ) : (
                <div className="w-full h-full bg-[#F6F2EC] flex items-center justify-center">
                  <span className="font-heading text-8xl text-[#9E6B47]/30">{profile.name?.[0]}</span>
                </div>
              )}
              {/* Gradient + name overlay */}
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

            {/* ── Info block — directly after hero photo ── */}
            <div className="px-5 pt-5 space-y-4 pb-2">
              {/* Psychological badges */}
              {(profile.bindungstyp || profile.love_language) && (
                <div className="flex flex-wrap gap-2">
                  {profile.bindungstyp && (
                    <span className="rounded-full bg-[#EDE8E0] text-[#7A4E30] text-sm px-3 py-1.5">{profile.bindungstyp}</span>
                  )}
                  {profile.love_language && (
                    <span className="rounded-full bg-[#E8EDE0] text-[#3D6B50] text-sm px-3 py-1.5">{profile.love_language}</span>
                  )}
                </div>
              )}

              {/* Quick-fact pills */}
              {(profile.occupation || profile.height_cm || profile.has_children || profile.relationship_model || profile.intention) && (
                <div className="flex flex-wrap gap-2">
                  {profile.occupation && (
                    <span className="flex items-center gap-1.5 bg-[#F6F2EC] rounded-full px-3.5 py-2 text-sm text-[#1A1410]/70">
                      <Briefcase className="w-3.5 h-3.5 text-[#1A1410]/30 flex-shrink-0" />{profile.occupation}
                    </span>
                  )}
                  {profile.height_cm && (
                    <span className="flex items-center gap-1.5 bg-[#F6F2EC] rounded-full px-3.5 py-2 text-sm text-[#1A1410]/70">
                      <Ruler className="w-3.5 h-3.5 text-[#1A1410]/30 flex-shrink-0" />{profile.height_cm} cm
                    </span>
                  )}
                  {profile.has_children && (
                    <span className="bg-[#F6F2EC] rounded-full px-3.5 py-2 text-sm text-[#1A1410]/70">{profile.has_children}</span>
                  )}
                  {profile.relationship_model && (
                    <span className="bg-[#F6F2EC] rounded-full px-3.5 py-2 text-sm text-[#1A1410]/70">{profile.relationship_model}</span>
                  )}
                  {profile.intention && (
                    <span className="bg-[#F6F2EC] rounded-full px-3.5 py-2 text-sm text-[#1A1410]/70">{profile.intention}</span>
                  )}
                </div>
              )}

              {/* Werte */}
              {profile.werte?.length > 0 && (
                <div>
                  <p className="text-[11px] text-[#1A1410]/35 uppercase tracking-widest mb-2">Werte</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.werte.map((w, i) => (
                      <span key={w} className={cn('text-sm px-3 py-1.5 rounded-full', i % 2 === 0 ? 'bg-[#EDE8E0] text-[#8B6040]' : 'bg-[#E8EDE0] text-[#3D6B50]')}>
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Zodiac */}
              {(profile.sun_sign || profile.ascendant || profile.chinese_zodiac) && (
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
              )}

              {/* Bio */}
              {profile.bio && (
                <p className="text-sm text-[#1A1410]/65 leading-relaxed">{profile.bio}</p>
              )}
            </div>

            {/* ── Interleaved: additional photos (with captions) + prompts ── */}
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

            {/* Audio prompt */}
            {profile.audio_prompt_url && <AudioPlayer url={profile.audio_prompt_url} />}

            {/* Bottom padding */}
            <div className="h-10" />
          </div>
        </div>
      )}
    </>
  )
}
