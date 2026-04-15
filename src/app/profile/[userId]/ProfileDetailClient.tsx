'use client'

import { useState } from 'react'
import { ArrowLeft, MapPin, Briefcase, Sparkles, Mic, Ruler } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { Profile } from '@/types'

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

export function ProfileDetailClient({ profile }: { profile: Profile }) {
  const router = useRouter()
  const [photoIndex, setPhotoIndex] = useState(0)
  const photoCount = profile.photos?.length ?? 0

  function handlePhotoTap(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const tapX = e.clientX - rect.left
    const width = rect.width
    if (tapX < width * 0.35) {
      setPhotoIndex((i) => Math.max(0, i - 1))
    } else if (tapX > width * 0.65) {
      setPhotoIndex((i) => Math.min((photoCount || 1) - 1, i + 1))
    }
  }

  return (
    <div className="max-w-lg mx-auto pb-36">
      {/* Back button */}
      <div className="flex items-center px-4 pt-5 pb-2">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-text/50 hover:text-text transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Zurück</span>
        </button>
      </div>

      {/* Photo area */}
      <div
        className="relative mx-3 rounded-3xl overflow-hidden shadow-lg"
        style={{ height: '80vh' }}
        onClick={handlePhotoTap}
      >
        {/* Progress bars */}
        {photoCount > 1 && (
          <div className="absolute top-3 left-3 right-3 z-10 flex gap-1">
            {Array.from({ length: photoCount }).map((_, i) => (
              <div key={i} className="flex-1 h-0.5 rounded-full overflow-hidden bg-white/30">
                <div className={cn('h-full rounded-full', i <= photoIndex ? 'bg-white' : 'bg-transparent')} />
              </div>
            ))}
          </div>
        )}

        {/* Photo */}
        {profile.photos?.[photoIndex] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.photos[photoIndex]}
            alt={profile.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-sand flex items-center justify-center">
            <span className="font-heading text-8xl text-primary/30">{profile.name?.[0]}</span>
          </div>
        )}

        {/* Name gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-black/75 to-transparent pointer-events-none z-10" />
        <div className="absolute bottom-5 left-5 text-white pointer-events-none z-10">
          <h1 className="font-heading text-4xl drop-shadow">
            {profile.name}{!profile.hide_age && profile.age ? `, ${profile.age}` : ''}
          </h1>
          {!profile.hide_location && profile.location && (
            <div className="flex items-center gap-1.5 text-white/80 text-sm mt-1">
              <MapPin className="w-3.5 h-3.5" />
              {profile.location}
            </div>
          )}
        </div>
      </div>

      {/* Profile sections */}
      <div className="mx-3 mt-3 space-y-3">

        {/* Basics */}
        <div className="bg-white rounded-2xl border border-sand shadow-sm px-5 py-4 space-y-2">
          {profile.height_cm && (
            <div className="flex items-center gap-2 text-sm text-dark">
              <Ruler className="w-4 h-4 text-text/40 flex-shrink-0" />
              <span>{profile.height_cm} cm</span>
            </div>
          )}
          {profile.occupation && (
            <div className="flex items-center gap-2 text-sm text-text/70">
              <Briefcase className="w-4 h-4 text-text/40 flex-shrink-0" />
              <span>{profile.occupation}</span>
            </div>
          )}
          {!profile.hide_location && profile.location && (
            <div className="flex items-center gap-2 text-sm text-text/70">
              <MapPin className="w-4 h-4 text-text/40 flex-shrink-0" />
              <span>{profile.location}</span>
            </div>
          )}
          {profile.intention && (
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-sm bg-light text-primary px-2.5 py-0.5 rounded-full">{profile.intention}</span>
            </div>
          )}
          {profile.has_children && (
            <div className="text-sm text-text/60">{profile.has_children}</div>
          )}
        </div>

        {/* Quote */}
        {profile.profile_quote && (
          <div className="bg-white rounded-2xl border border-sand shadow-sm px-5 py-4">
            <p className="font-heading text-xl text-dark italic leading-snug">
              &ldquo;{profile.profile_quote}&rdquo;
            </p>
          </div>
        )}

        {/* Voice intro placeholder */}
        <div className="bg-white rounded-2xl border border-sand shadow-sm px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-light flex items-center justify-center flex-shrink-0">
              <Mic className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-dark">Sprach-Intro</p>
              <div className="flex items-center gap-0.5 mt-1.5 h-6">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-primary/30 rounded-full animate-pulse"
                    style={{
                      height: `${20 + Math.sin(i * 0.8) * 14 + Math.cos(i * 1.3) * 6}%`,
                      animationDelay: `${i * 60}ms`,
                    }}
                  />
                ))}
              </div>
            </div>
            <span className="text-xs bg-sand text-text/50 px-2.5 py-1 rounded-full flex-shrink-0">Bald verfügbar</span>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="bg-white rounded-2xl border border-sand shadow-sm px-5 py-4">
            <p className="text-xs text-text/40 uppercase tracking-wider mb-2">Über mich</p>
            <p className="text-text/70 text-sm leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Interests */}
        {profile.interests?.length > 0 && (
          <div className="bg-white rounded-2xl border border-sand shadow-sm px-5 py-4">
            <p className="text-xs text-text/40 uppercase tracking-wider mb-2">Interessen</p>
            <div className="flex flex-wrap gap-1.5">
              {profile.interests.map((i) => (
                <span key={i} className="text-xs bg-sand text-text/60 px-3 py-1.5 rounded-full">{i}</span>
              ))}
            </div>
          </div>
        )}

        {/* Werte */}
        {profile.werte?.length > 0 && (
          <div className="bg-white rounded-2xl border border-sand shadow-sm px-5 py-4">
            <p className="text-xs text-text/40 uppercase tracking-wider mb-2">Werte</p>
            <div className="flex flex-wrap gap-1.5">
              {profile.werte.map((w) => (
                <span key={w} className="text-xs bg-light text-primary px-3 py-1.5 rounded-full">{w}</span>
              ))}
            </div>
          </div>
        )}

        {/* Relationship info */}
        {(profile.relationship_model || profile.bindungstyp || profile.love_language) && (
          <div className="bg-white rounded-2xl border border-sand shadow-sm px-5 py-4 space-y-3">
            {profile.relationship_model && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-text/40">Beziehungsmodell</span>
                <span className="text-dark font-medium">{profile.relationship_model}</span>
              </div>
            )}
            {profile.bindungstyp && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-text/40">Bindungstyp</span>
                <span className="text-dark font-medium">{profile.bindungstyp}</span>
              </div>
            )}
            {profile.love_language && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-text/40">Love Language</span>
                <span className="text-dark font-medium">{profile.love_language}</span>
              </div>
            )}
          </div>
        )}

        {/* Personality */}
        {(profile.introvert_extrovert != null || profile.spontan_strukturiert != null || profile.rational_emotional != null) && (
          <div className="bg-white rounded-2xl border border-sand shadow-sm px-5 py-4 space-y-3">
            <p className="text-xs text-text/40 uppercase tracking-wider mb-1">Persönlichkeit</p>
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
    </div>
  )
}
