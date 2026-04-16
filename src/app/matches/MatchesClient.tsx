'use client'

import { useState } from 'react'
import { Heart, MapPin, Sparkles, Clock, CheckCircle, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { cn, photoUrl } from '@/lib/utils'
import type { Profile } from '@/types'
import { SajaCircleAnimation } from '@/components/ui/SajaCircleAnimation'

interface MatchWithProfile {
  id: string
  user1_id: string
  user2_id: string
  status: string
  created_at: string
  other_profile: Profile | null
  connections: Array<{
    id: string
    status: string
    requested_by: string
    started_at: string | null
    expires_at: string | null
  }>
}

interface Props {
  matches: MatchWithProfile[]
  currentUserId: string
  activeMatchId?: string
  tier: 'free' | 'membership' | 'premium'
}

export function MatchesClient({ matches, currentUserId, activeMatchId, tier }: Props) {
  const supabase = createClient()
  const [loading, setLoading] = useState<string | null>(null)
  const [showBegegnungAnim, setShowBegegnungAnim] = useState(false)

  async function requestConnection(matchId: string) {
    if (activeMatchId) {
      toast.error('Du bist bereits in einer Begegnung (One Connection Rule).')
      return
    }
    setLoading(matchId)
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
    const { error } = await supabase.from('connections').insert({
      match_id: matchId,
      requested_by: currentUserId,
      status: 'requested',
      expires_at: expiresAt,
    })
    if (error) {
      toast.error('Fehler: ' + error.message)
    } else {
      toast.success('Anfrage gesendet! Die andere Person hat 48 Stunden Zeit.')
      await supabase.from('matches').update({ status: 'requested' }).eq('id', matchId)
      window.location.reload()
    }
    setLoading(null)
  }

  async function acceptConnection(connectionId: string, matchId: string) {
    if (activeMatchId && activeMatchId !== matchId) {
      toast.error('Du bist bereits in einer Begegnung (One Connection Rule).')
      return
    }
    setLoading(connectionId)
    const { error } = await supabase
      .from('connections')
      .update({ status: 'active', started_at: new Date().toISOString() })
      .eq('id', connectionId)
    if (!error) {
      await supabase.from('matches').update({ status: 'active' }).eq('id', matchId)
      setShowBegegnungAnim(true)
    } else {
      toast.error('Fehler: ' + error.message)
    }
    setLoading(null)
  }

  if (tier === 'free') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center max-w-sm mx-auto">
        <div className="w-20 h-20 bg-[#F6F2EC] rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-9 h-9 text-[#1A1410]/30" />
        </div>
        <h2 className="font-heading text-4xl text-[#1A1410] font-light mb-3">Matches sind gesperrt</h2>
        <p className="text-[#A89888] leading-relaxed mb-8">
          Mit der Mitgliedschaft (29 €/Monat) siehst du gegenseitige Interessen und kannst Begegnungen anfragen.
        </p>
        <Link href="/pricing" className="btn-primary px-8 py-3.5">
          Mitgliedschaft ansehen
        </Link>
        <p className="text-xs text-[#1A1410]/30 mt-4">14 Tage Geld-zurück-Garantie</p>
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <Heart className="w-16 h-16 text-[#9E6B47]/20 mb-6" />
        <h2 className="font-heading text-4xl text-[#1A1410] font-light mb-3">Noch keine Matches</h2>
        <p className="text-[#A89888] max-w-sm mb-8">
          Wenn du jemanden likest und diese Person dich ebenfalls geliked hat, erscheint sie hier.
        </p>
        <Link href="/discover" className="btn-primary">Entdecken starten</Link>
      </div>
    )
  }

  return (
    <>
      <SajaCircleAnimation
        variant="begegnung"
        visible={showBegegnungAnim}
        navigateTo="/begegnung"
      />
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-32">
        <h1 className="font-heading text-4xl font-light text-[#1A1410] mb-1">Matches</h1>
        <p className="font-body text-sm text-[#A89888] mb-8">
          {activeMatchId ? (
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#9E6B47]" />
              Du bist aktuell in einer Begegnung (One Connection Rule aktiv)
            </span>
          ) : (
            `${matches.length} gegenseitige Interessen`
          )}
        </p>

        <div className="space-y-4">
          {matches.map((match) => {
            const profile = match.other_profile
            if (!profile) return null

            const connection = match.connections?.[0]
            const isRequester = connection?.requested_by === currentUserId
            const isActive = connection?.status === 'active'
            const isRequested = connection?.status === 'requested'
            const isThisActiveMatch = match.id === activeMatchId
            const photo = photoUrl(profile.photos?.[0])

            return (
              <div
                key={match.id}
                className={cn(
                  'bg-white rounded-2xl overflow-hidden border border-[#E2DAD0] active:scale-[0.98] transition-transform duration-150',
                  isThisActiveMatch && 'border-2 border-[#9E6B47]'
                )}
              >
                {/* Photo area */}
                <Link href={`/profile/${profile.user_id}`} className="block relative h-[200px] overflow-hidden">
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photo}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#F6F2EC] flex items-center justify-center">
                      <span className="font-heading text-5xl text-[#9E6B47]/30">
                        {profile.name?.[0]}
                      </span>
                    </div>
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/55 to-transparent" />

                  {/* Name + city on gradient */}
                  <div className="absolute bottom-3 left-4 right-14">
                    <p className="font-heading text-xl font-normal text-white leading-tight">
                      {profile.name}{!profile.hide_age && profile.age ? `, ${profile.age}` : ''}
                    </p>
                    {!profile.hide_location && profile.location && (
                      <div className="flex items-center gap-1 text-white/70 font-body text-xs mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {profile.location}
                      </div>
                    )}
                  </div>

                  {/* Bindungstyp badge */}
                  {profile.bindungstyp && (
                    <span className="absolute bottom-2 right-2 bg-white/85 text-[#9E6B47] font-body text-[10px] px-2 py-0.5 rounded-full">
                      {profile.bindungstyp}
                    </span>
                  )}

                  {/* Active badge */}
                  {isThisActiveMatch && (
                    <span className="absolute top-2 right-2 flex items-center gap-1 text-xs text-[#9E6B47] bg-white/90 px-2 py-1 rounded-full">
                      <CheckCircle className="w-3 h-3" /> Aktiv
                    </span>
                  )}
                </Link>

                {/* Below photo */}
                <div className="px-4 pt-3 pb-4">
                  {/* Prompt preview */}
                  {profile.prompts?.[0]?.question && (
                    <p className="font-heading italic text-sm text-[#9E6B47] truncate mb-3">
                      „{profile.prompts[0].question}"
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap">
                    {isActive ? (
                      <Link href={`/connection/${match.id}`} className="btn-primary text-xs py-2 px-4">
                        Zum Chat
                      </Link>
                    ) : isRequested && !isRequester ? (
                      <button
                        onClick={() => acceptConnection(connection.id, match.id)}
                        disabled={loading === connection.id}
                        className="btn-primary text-xs py-2 px-4"
                      >
                        {loading === connection.id ? '...' : 'Anfrage annehmen'}
                      </button>
                    ) : isRequested && isRequester ? (
                      <span className="flex items-center gap-1.5 text-xs text-[#A89888]">
                        <Clock className="w-3.5 h-3.5" /> Anfrage gesendet
                      </span>
                    ) : (
                      <button
                        onClick={() => requestConnection(match.id)}
                        disabled={loading === match.id || (!!activeMatchId && !isThisActiveMatch)}
                        className={cn(
                          'border border-[#9E6B47] text-[#9E6B47] bg-transparent hover:bg-[#9E6B47]/5 rounded-full text-xs py-2 px-4 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed font-body font-medium'
                        )}
                      >
                        {loading === match.id ? '...' : 'Begegnung anfragen'}
                      </button>
                    )}
                  </div>

                  {isRequested && !isRequester && connection?.expires_at && (
                    <p className="text-xs text-[#A89888]/60 mt-1.5">
                      Läuft ab am {new Date(connection.expires_at).toLocaleDateString('de-DE')}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
