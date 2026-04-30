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
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center bg-[#221080]">
        <div className="w-20 h-20 bg-[rgba(253,248,242,0.12)] rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-9 h-9 text-[#FDF8F2]/50" />
        </div>
        <h2 className="font-heading text-4xl text-[#FDF8F2] font-light mb-3">Matches sind gesperrt</h2>
        <p className="text-[#FDF8F2]/60 leading-relaxed mb-8 max-w-sm">
          Mit der Mitgliedschaft (29 €/Monat) siehst du gegenseitige Interessen und kannst Begegnungen anfragen.
        </p>
        <Link href="/pricing" className="bg-[#FDF8F2] text-[#FDF8F2] px-8 py-3.5 rounded-full font-body font-semibold hover:bg-white transition-colors">
          Mitgliedschaft ansehen
        </Link>
        <p className="text-xs text-[#FDF8F2]/30 mt-4">14 Tage Geld-zurück-Garantie</p>
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <Heart className="w-16 h-16 text-[#6B6058] mb-6" />
        <h2 className="font-heading text-4xl text-[#FDF8F2] font-light mb-3">Noch keine Matches</h2>
        <p className="text-[#6B6058] max-w-sm mb-8">
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
      <div className="max-w-2xl mx-auto px-4 pb-32">
        <div className="sticky top-0 z-20 bg-[#221080] -mx-4 px-4 pt-5 pb-4 mb-6">
          <h1 className="font-heading text-[52px] font-light text-[#FDF8F2] tracking-[-0.5px] leading-none mb-1">Matches</h1>
          {activeMatchId ? (
            <span className="flex items-center gap-2 text-[#FDF8F2]/70 text-[13px] font-body">
              <Sparkles className="w-4 h-4 text-[#FDF8F2]/70 flex-shrink-0" />
              One Connection Rule aktiv
            </span>
          ) : (
            <p className="font-body text-sm text-[#FDF8F2]/60">{matches.length} gegenseitige Interessen</p>
          )}
        </div>

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
                  'bg-white rounded-2xl overflow-hidden active:scale-[0.98] transition-transform duration-150',
                  isThisActiveMatch ? 'ring-2 ring-[#221080]' : ''
                )}
                style={{ boxShadow: isRequested && !isRequester && !isActive ? '0 2px 12px rgba(26,20,16,0.08), inset 4px 0 0 #221080' : '0 2px 12px rgba(26,20,16,0.08)' }}
              >
                {/* Photo area */}
                <Link href={`/profile/${profile.user_id}`} className="block relative h-[220px] overflow-hidden">
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photo}
                      alt={profile.name}
                      className="absolute inset-0 w-full h-full object-cover object-top"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[rgba(34,16,128,0.07)] flex items-center justify-center">
                      <span className="font-heading text-5xl text-[#6B6058]">
                        {profile.name?.[0]}
                      </span>
                    </div>
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute bottom-0 left-0 right-0 h-[60%] bg-gradient-to-t from-black/70 to-transparent" />

                  {/* Name + city on gradient */}
                  <div className="absolute bottom-3 left-4 right-14">
                    <p className="font-heading text-2xl font-normal text-white leading-tight">
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
                    <span className="absolute bottom-2 right-2 bg-white/90 text-[#221080] font-body text-[10px] px-2 py-0.5 rounded-full">
                      {profile.bindungstyp}
                    </span>
                  )}

                  {/* Active badge */}
                  {isThisActiveMatch && (
                    <span className="absolute top-2 right-2 flex items-center gap-1 text-xs text-[#221080] bg-white px-2 py-1 rounded-full">
                      <CheckCircle className="w-3 h-3" /> Aktiv
                    </span>
                  )}
                </Link>

                {/* Below photo */}
                <div className="px-4 pt-3 pb-4">
                  {/* Prompt preview */}
                  {profile.prompts?.[0]?.question && (
                    <p className="font-heading italic text-sm text-[#6B6058] truncate mb-3">
                      „{profile.prompts[0].question}"
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap">
                    {isActive ? (
                      <Link href={`/connection/${match.id}`} className="btn-primary-dark text-xs py-2 px-4">
                        Zum Chat
                      </Link>
                    ) : isRequested && !isRequester ? (
                      <button
                        onClick={() => acceptConnection(connection.id, match.id)}
                        disabled={loading === connection.id}
                        className="btn-primary-dark text-xs py-2 px-4"
                      >
                        {loading === connection.id ? '...' : 'Anfrage annehmen'}
                      </button>
                    ) : isRequested && isRequester ? (
                      <span className="flex items-center gap-1.5 text-xs text-[#6B6058]">
                        <Clock className="w-3.5 h-3.5" /> Anfrage gesendet
                      </span>
                    ) : (
                      <button
                        onClick={() => requestConnection(match.id)}
                        disabled={loading === match.id || (!!activeMatchId && !isThisActiveMatch)}
                        className={cn(
                          'w-full border-[1.5px] border-[#221080] text-[#221080] bg-transparent hover:bg-[#221080]/5 rounded-xl text-sm py-3 px-4 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed font-body font-medium'
                        )}
                      >
                        {loading === match.id ? '...' : 'Begegnung anfragen'}
                      </button>
                    )}
                  </div>

                  {isRequested && !isRequester && connection?.expires_at && (
                    <p className="text-xs text-[#6B6058]/60 mt-1.5">
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

