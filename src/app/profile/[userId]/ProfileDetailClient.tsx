'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, MapPin, Briefcase, Sparkles, Mic, Ruler, Heart } from 'lucide-react'
import type { Profile } from '@/types'

function PersonalityBar({ leftLabel, rightLabel, value }: { leftLabel: string; rightLabel: string; value: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-text/40">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
      <div className="h-1.5 bg-sand rounded-full overflow-hidden">
        <div className="h-full bg-primary/50 rounded-full" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function ProfilePhoto({ src, name, height }: { src?: string; name: string; height: string }) {
  return (
    <div className="mx-3 rounded-3xl overflow-hidden shadow-sm" style={{ height }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-sand flex items-center justify-center">
          <span className="font-heading text-8xl text-primary/20">{name?.[0]}</span>
        </div>
      )}
    </div>
  )
}

export function ProfileDetailClient({ profile }: { profile: Profile }) {
  const router = useRouter()
  const photos = profile.photos ?? []

  return (
    <div className="max-w-lg mx-auto pb-36">

      {/* Back button */}
      <div className="px-4 pt-5 pb-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-text/50 hover:text-text transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Zurück</span>
        </button>
      </div>

      {/* ── Foto 1 — groß, mit Name-Overlay ── */}
      <div className="mx-3 rounded-3xl overflow-hidden shadow-md relative" style={{ height: '78vh' }}>
        {photos[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photos[0]} alt={profile.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-sand flex items-center justify-center">
            <span className="font-heading text-8xl text-primary/20">{profile.name?.[0]}</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-52 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
        <div className="absolute bottom-5 left-5 text-white">
          <h1 className="font-heading text-4xl drop-shadow">
            {profile.name}{!profile.hide_age && profile.age ? `, ${profile.age}` : ''}
          </h1>
          {!profile.hide_location && profile.location && (
            <div className="flex items-center gap-1.5 text-white/75 text-sm mt-1">
              <MapPin className="w-3.5 h-3.5" />
              {profile.location}
            </div>
          )}
        </div>
      </div>

      {/* ── Kurzinfos ── */}
      <div className="px-5 pt-5 pb-1 flex flex-wrap gap-2">
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

      {/* ── Foto 2 ── */}
      {photos[1] && (
        <div className="mt-5">
          <ProfilePhoto src={photos[1]} name={profile.name} height="62vh" />
        </div>
      )}

      {/* ── Zitat ── */}
      {profile.profile_quote && (
        <div className="px-5 pt-6 pb-4">
          <p className="font-heading text-2xl text-dark italic leading-snug">
            &ldquo;{profile.profile_quote}&rdquo;
          </p>
        </div>
      )}

      {/* ── Sprach-Intro ── */}
      <div className="px-5 py-5 border-t border-sand/70 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-light flex items-center justify-center flex-shrink-0">
          <Mic className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-dark mb-1.5">Sprach-Intro</p>
          <div className="flex items-center gap-0.5 h-5">
            {Array.from({ length: 26 }).map((_, i) => (
              <div
                key={i}
                className="w-1 bg-primary/25 rounded-full animate-pulse"
                style={{
                  height: `${30 + Math.sin(i * 0.9) * 50 + Math.cos(i * 1.4) * 20}%`,
                  animationDelay: `${i * 55}ms`,
                }}
              />
            ))}
          </div>
        </div>
        <span className="text-xs text-text/35 flex-shrink-0">Bald verfügbar</span>
      </div>

      {/* ── Foto 3 ── */}
      {photos[2] && (
        <ProfilePhoto src={photos[2]} name={profile.name} height="62vh" />
      )}

      {/* ── Über mich ── */}
      {profile.bio && (
        <div className="px-5 py-5 border-t border-sand/70">
          <p className="text-[11px] text-text/35 uppercase tracking-widest mb-3">Über mich</p>
          <p className="text-text/70 text-sm leading-relaxed">{profile.bio}</p>
        </div>
      )}

      {/* ── Interessen ── */}
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

      {/* ── Werte ── */}
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

      {/* ── Beziehung & Bindung ── */}
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
              <span className="text-sm text-dark font-medium flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-primary" />{profile.love_language}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Persönlichkeit ── */}
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
  )
}
