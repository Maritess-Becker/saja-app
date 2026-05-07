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
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center bg-[#2F4A3C]">
        <div className="w-20 h-20 bg-[rgba(242,235,226,0.12)] rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-9 h-9 text-[#F2EBE2]/50" />
        </div>
        <h2 className="font-heading text-4xl text-[#F2EBE2] font-light mb-3">Matches sind gesperrt</h2>
        <p className="text-[#F2EBE2]/60 leading-relaxed mb-8 max-w-sm">
          Mit der Mitgliedschaft (29 €/Monat) siehst du gegenseitige Interessen und kannst Begegnungen anfragen.
        </p>
        <Link href="/pricing" className="bg-[#F2EBE2] text-[#232323] px-8 py-3.5 rounded-full font-body font-semibold hover:bg-white transition-colors">
          Mitgliedschaft ansehen
        </Link>
        <p className="text-xs text-[#F2EBE2]/30 mt-4">14 Tage Geld-zurück-Garantie</p>
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <Heart className="w-16 h-16 text-[#6B6058] mb-6" />
        <h2 className="font-heading text-4xl text-[#F2EBE2] font-light mb-3">Noch keine Matches</h2>
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
        {/* Header */}
        <div className="pt-12 pb-5">
          <h1 className="font-heading text-[52px] font-normal text-primary tracking-[-0.5px] leading-none mb-1">Matches</h1>
          {activeMatchId ? (
            <p className="text-[#9A8E84] font-body text-sm font-light">One Connection Rule aktiv</p>
          ) : (
            <p className="text-[#9A8E84] font-body text-sm font-light">{matches.length} gegenseitige Interessen</p>
          )}
        </div>

        {/* One Connection hint */}
        <p className="text-xs text-[rgba(47,74,60,0.35)] font-light mb-6">✦ &nbsp; Du kannst eine Begegnung gleichzeitig führen.</p>

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
                  'rounded-2xl bg-[#F2EBE2] overflow-hidden shadow-sm active:scale-[0.98] transition-transform duration-300',
                  isThisActiveMatch ? 'ring-2 ring-[#2F4A3C]' : ''
                )}
              >
                {/* Photo strip with serif name */}
                <Link href={`/profile/${profile.user_id}`} className="block relative h-48 overflow-hidden bg-gradient-to-br from-[#3D5E4E] to-[#1E3028]">
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photo}
                      alt={profile.name}
                      className="absolute inset-0 w-full h-full object-cover object-top"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-heading text-5xl text-[#F2EBE2]/20">
                        {profile.name?.[0]}
                      </span>
                    </div>
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(20,34,26,0.75) 0%, transparent 50%)' }} />

                  {/* Name — bottom left serif */}
                  <div className="absolute bottom-0 left-0 right-0 z-10 px-5 pb-4">
                    <h2 className="font-heading text-[32px] font-normal text-[#F2EBE2] leading-none tracking-[-0.3px]">
                      {profile.name}{!profile.hide_age && profile.age ? `, ${profile.age}` : ''}
                    </h2>
                    {!profile.hide_location && profile.location && (
                      <p className="text-[rgba(242,235,226,0.50)] text-xs mt-1 font-light">{profile.location}</p>
                    )}
                  </div>

                  {/* Active badge */}
                  {isThisActiveMatch && (
                    <span className="absolute top-2 right-2 flex items-center gap-1 text-xs text-[#2F4A3C] bg-white px-2 py-1 rounded-full z-20">
                      <CheckCircle className="w-3 h-3" /> Aktiv
                    </span>
                  )}
                </Link>

                {/* Card body */}
                <div className="px-5 pt-4 pb-5">
                  {/* Bio/intention preview */}
                  {(profile.bio || profile.intention) && (
                    <p className="text-sm font-light text-[#6B6058] leading-relaxed mb-4">
                      {profile.bio || profile.intention}
                    </p>
                  )}

                  {/* Footer: timestamp left + action right */}
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[#9A8E84] text-xs font-light">
                      {match.created_at ? `Match ${new Date(match.created_at).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}` : 'Match'}
                    </span>

                    <div>
                      {isActive ? (
                        <Link href={`/connection/${match.id}`} className="bg-[#2F4A3C] text-[#F2EBE2] text-xs font-normal px-5 py-2.5 rounded-xl">
                          Zum Chat
                        </Link>
                      ) : isRequested && !isRequester ? (
                        <button
                          onClick={() => acceptConnection(connection.id, match.id)}
                          disabled={loading === connection.id}
                          className="bg-[#2F4A3C] text-[#F2EBE2] text-xs font-normal px-5 py-2.5 rounded-xl disabled:opacity-50"
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
                          className="bg-[#2F4A3C] text-[#F2EBE2] text-xs font-normal px-5 py-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {loading === match.id ? '...' : 'Begegnung anfragen'}
                        </button>
                      )}
                    </div>
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

