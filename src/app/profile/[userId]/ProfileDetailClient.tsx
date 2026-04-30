'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, MapPin, Briefcase, Sparkles, Mic, Ruler, Heart, Play, Pause } from 'lucide-react'
import type { Profile } from '@/types'
import { photoUrl, calculateAge } from '@/lib/utils'

// ── Sub-components ────────────────────────────────────────────────────────────

function PersonalityBar({ leftLabel, rightLabel, value }: { leftLabel: string; rightLabel: string; value: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-[#A09888]">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
      <div className="h-1.5 bg-[#EDE8E0] rounded-full overflow-hidden">
        <div className="h-full bg-primary/50 rounded-full" style={{ width: `${value}%` }} />
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
        className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow flex-shrink-0 hover:bg-[#120850] transition-colors active:scale-95"
      >
        {playing ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white translate-x-0.5" />}
      </button>
      <div className="flex-1">
        <p className="text-sm font-medium text-[#1A1410] mb-1">Sprach-Intro anhören</p>
        <div className="flex items-end gap-0.5 h-4">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i}
              className={`w-0.5 rounded-full transition-all ${playing ? 'bg-primary animate-pulse' : 'bg-primary/30'}`}
              style={{ height: `${28 + Math.sin(i * 0.85) * 48 + Math.cos(i * 1.3) * 18}%`, animationDelay: `${i * 50}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function PhotoWithCaption({ photo, name, height }: { photo: { url: string; path: string; caption?: string }; name: string; height: string }) {
  const url = photoUrl(photo)
  if (!url) return null
  return (
    <div className="mt-3">
      <div className="mx-3 rounded-3xl overflow-hidden shadow-sm" style={{ height }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={name} className="w-full h-full object-cover" />
      </div>
      {photo.caption && (
        <p className="px-5 pt-2.5 text-sm text-[#1A1410]/55 italic leading-relaxed text-justify">{photo.caption}</p>
      )}
    </div>
  )
}

function PromptBlock({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="px-4 py-4 border-t border-[rgba(34,16,128,0.10)]">
      <div className="bg-[#FDF8F2] rounded-xl px-4 py-4 border-l-[3px] border-primary">
        <p className="text-[11px] text-[#A09888] uppercase tracking-widest mb-2">{question}</p>
        <p className="font-heading text-xl italic text-[#120850] leading-snug text-justify">{answer}</p>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function ProfileDetailClient({
  profile,
  viewerSexualityVisible = false,
  isMatched = false,
  viewerPhase3Complete = false,
  profilePhase3Complete = false,
}: {
  profile: Profile
  viewerSexualityVisible?: boolean
  isMatched?: boolean
  viewerPhase3Complete?: boolean
  profilePhase3Complete?: boolean
}) {
  const router = useRouter()
  const photos = profile.photos ?? []

  // Layer visibility
  const layer2Visible = isMatched
  const layer3Visible = isMatched && viewerPhase3Complete && profilePhase3Complete

  return (
    <div className="max-w-lg mx-auto pb-36">

      {/* Back button */}
      <div className="sticky top-0 z-20 bg-[#221080] px-4 pt-5 pb-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#FDF8F2]/70 hover:text-[#FDF8F2] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Zurück</span>
        </button>
      </div>

      {/* ── Foto 1 — groß, mit Name-Overlay ── */}
      <div className="mx-3 rounded-3xl overflow-hidden shadow-md relative" style={{ height: '78vh' }}>
        {photoUrl(photos[0]) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl(photos[0])} alt={profile.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-[#EDE8E0] flex items-center justify-center">
            <span className="font-heading text-8xl text-[#6B6058]">{profile.name?.[0]}</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-52 bg-gradient-to-t from-[rgba(18,8,80,0.88)] to-transparent pointer-events-none" />
        <div className="absolute bottom-5 left-5 text-white">
          <h1 className="font-heading text-4xl drop-shadow">
            {profile.name}{!profile.hide_age && profile.birth_date ? `, ${calculateAge(profile.birth_date)}` : !profile.hide_age && profile.age ? `, ${profile.age}` : ''}
          </h1>
          {!profile.hide_location && profile.location && (
            <div className="flex items-center gap-1.5 text-white/75 text-sm mt-1">
              <MapPin className="w-3.5 h-3.5" />
              {profile.location}
            </div>
          )}
        </div>
      </div>

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
          <p className="font-heading text-xl italic text-[#1A1410]/65 leading-snug">&ldquo;{profile.current_moment}&rdquo;</p>
        </div>
      )}

      {/* ── Quick-info pills ── */}
      <div className="px-5 pt-5 pb-1 flex flex-wrap gap-2">
        {profile.height_cm && (
          <span className="flex items-center gap-1.5 text-sm text-[#6B6058] bg-[#EDE8E0] px-3 py-1.5 rounded-full">
            <Ruler className="w-3.5 h-3.5" />{profile.height_cm} cm
          </span>
        )}
        {profile.occupation && (
          <span className="flex items-center gap-1.5 text-sm text-[#6B6058] bg-[#EDE8E0] px-3 py-1.5 rounded-full">
            <Briefcase className="w-3.5 h-3.5" />{profile.occupation}
          </span>
        )}
        {profile.intention && (
          <span className="flex items-center gap-1.5 text-sm text-[#1A1410] bg-[#FDF8F2] px-3 py-1.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />{profile.intention}
          </span>
        )}
        {profile.has_children && (
          <span className="text-sm text-[#6B6058] bg-[#EDE8E0] px-3 py-1.5 rounded-full">{profile.has_children}</span>
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
          <div className="w-10 h-10 rounded-full bg-[#FDF8F2] flex items-center justify-center flex-shrink-0">
            <Mic className="w-5 h-5 text-[#1A1410]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-[#1A1410] mb-1.5">Sprachmemo</p>
            <div className="flex items-center gap-0.5 h-5">
              {Array.from({ length: 26 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-primary/25 rounded-full"
                  style={{ height: `${30 + Math.sin(i * 0.9) * 50 + Math.cos(i * 1.4) * 20}%` }}
                />
              ))}
            </div>
          </div>
          <span className="text-xs text-[#6B6058] flex-shrink-0">Noch nicht aufgenommen</span>
        </div>
      )}

      {/* ── LAYER 2 CONTENT (after match) ── */}
      {!layer2Visible && (
        <div className="mx-5 my-4 px-4 py-3 rounded-xl bg-[rgba(34,16,128,0.05)] border border-[rgba(34,16,128,0.1)] text-center">
          <p className="text-[#A09888] text-xs font-body leading-relaxed">
            Weitere Details werden nach einem gegenseitigen Like sichtbar.
          </p>
        </div>
      )}

      {/* ── Interessen ── */}
      {layer2Visible && profile.interests?.length > 0 && (
        <div className="px-5 py-5 border-t border-[rgba(34,16,128,0.10)]">
          <p className="text-[11px] text-[#6B6058] uppercase tracking-widest mb-3">Interessen</p>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((item) => (
              <span key={item} className="text-sm text-[#6B6058] bg-[#EDE8E0] px-3 py-1.5 rounded-full">{item}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── Werte ── */}
      {layer2Visible && profile.werte?.length > 0 && (
        <div className="px-5 py-5 border-t border-[rgba(34,16,128,0.10)]">
          <p className="text-[11px] text-[#6B6058] uppercase tracking-widest mb-3">Werte</p>
          <div className="flex flex-wrap gap-2">
            {profile.werte.map((w) => (
              <span key={w} className="text-sm text-[#1A1410] bg-[#FDF8F2] px-3 py-1.5 rounded-full">{w}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── Meine Welt ── */}
      {layer2Visible && (profile.my_world?.length ?? 0) > 0 && (
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
      {layer2Visible && (profile.communities?.length ?? 0) > 0 && (
        <div className="px-5 py-5 border-t border-[rgba(34,16,128,0.10)]">
          <p className="text-[11px] text-[#6B6058] uppercase tracking-widest mb-3">Meine Communities</p>
          <div className="flex flex-wrap gap-2">
            {profile.communities!.map((c) => (
              <span key={c} className="text-[12px] font-body px-3 py-1.5 rounded-full border border-[rgba(34,16,128,0.30)] text-[#1A1410] bg-[rgba(34,16,128,0.08)]">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── LAYER 3 CONTENT (both phase 3 complete) ── */}
      {layer2Visible && !layer3Visible && (
        <div className="mx-5 my-4 px-4 py-3 rounded-xl bg-[rgba(34,16,128,0.05)] border border-[rgba(34,16,128,0.1)] text-center">
          <p className="text-[#A09888] text-xs font-body leading-relaxed">
            {!profilePhase3Complete
              ? 'Diese Person vervollständigt noch ihr Profil.'
              : 'Vervollständige dein Profil um noch mehr zu erfahren.'}
          </p>
        </div>
      )}

      {/* ── Beziehung & Bindung ── */}
      {layer3Visible && (profile.relationship_model || profile.bindungstyp || profile.love_language) && (
        <div className="px-5 py-5 border-t border-[rgba(34,16,128,0.10)] space-y-4">
          <p className="text-[11px] text-[#6B6058] uppercase tracking-widest">Beziehung &amp; Bindung</p>
          {profile.relationship_model && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#A09888]">Beziehungsmodell</span>
              <span className="text-sm text-[#1A1410] font-medium">{profile.relationship_model}</span>
            </div>
          )}
          {profile.bindungstyp && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#A09888]">Bindungstyp</span>
              <span className="text-sm text-[#1A1410] font-medium">{profile.bindungstyp}</span>
            </div>
          )}
          {profile.love_language && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#A09888]">Love Language</span>
              <span className="text-sm text-[#1A1410] font-medium flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-[#1A1410]" />{profile.love_language}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Persönlichkeit (Layer 2) ── */}
      {layer2Visible && (profile.introvert_extrovert != null || profile.spontan_strukturiert != null || profile.rational_emotional != null) && (
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

      {/* ── Horoskop (Layer 3) ── */}
      {layer3Visible && (profile.sun_sign || profile.ascendant || profile.chinese_zodiac) && (
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
              <span className="rounded-full text-[11px] px-3 py-1.5 font-body font-light" style={{ background: 'rgba(34,16,128,0.10)', color: '#3D1F9E' }}>
                {profile.chinese_zodiac}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Dealbreakers (Layer 3) ── */}
      {layer3Visible && profile.dealbreakers?.length > 0 && (
        <div className="px-5 py-5 border-t border-[rgba(34,16,128,0.10)]">
          <p className="text-[11px] text-[#6B6058] uppercase tracking-widest mb-3">Dealbreaker</p>
          <div className="flex flex-wrap gap-2">
            {profile.dealbreakers.map((d) => (
              <span key={d} className="text-sm text-red-700/80 bg-red-50 border border-red-200/60 px-3 py-1.5 rounded-full">{d}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── Intimität (Layer 3) ── */}
      {layer3Visible && profile.sexuality_visible && viewerSexualityVisible && (profile.sexuality_interests?.length ?? 0) > 0 && (
        <div className="px-5 py-5 border-t border-[rgba(34,16,128,0.10)]">
          <p className="text-[11px] text-[#6B6058] uppercase tracking-widest mb-3">Intimität</p>
          <div className="flex flex-wrap gap-2">
            {profile.sexuality_interests!.map((item) => (
              <span key={item} className="text-sm text-[#6B6058] bg-[rgba(34,16,128,0.07)] px-3 py-1.5 rounded-full">{item}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── Interleaved: Foto 2–6 + Prompts (Layer 2) ── */}
      {photos[1] && <PhotoWithCaption photo={photos[1]} name={profile.name} height="62vh" />}
      {layer2Visible && profile.prompts?.[0]?.answer && (
        <PromptBlock question={profile.prompts[0].question} answer={profile.prompts[0].answer} />
      )}

      {photos[2] && <PhotoWithCaption photo={photos[2]} name={profile.name} height="62vh" />}
      {layer2Visible && profile.prompts?.[1]?.answer && (
        <PromptBlock question={profile.prompts[1].question} answer={profile.prompts[1].answer} />
      )}

      {photos[3] && <PhotoWithCaption photo={photos[3]} name={profile.name} height="62vh" />}
      {layer2Visible && profile.prompts?.[2]?.answer && (
        <PromptBlock question={profile.prompts[2].question} answer={profile.prompts[2].answer} />
      )}

      {photos[4] && <PhotoWithCaption photo={photos[4]} name={profile.name} height="62vh" />}
      {photos[5] && <PhotoWithCaption photo={photos[5]} name={profile.name} height="62vh" />}

    </div>
  )
}
