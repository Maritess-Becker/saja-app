'use client'

import { useState } from 'react'
import { Heart, MapPin, Sparkles, Clock, CheckCircle, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
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
      // Update match status
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
        <div className="w-20 h-20 bg-sand rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-9 h-9 text-text/30" />
        </div>
        <h2 className="font-heading text-4xl text-dark mb-3">Matches sind gesperrt</h2>
        <p className="text-text/55 leading-relaxed mb-8">
          Mit der Mitgliedschaft (29 €/Monat) siehst du gegenseitige Interessen und kannst Begegnungen anfragen.
        </p>
        <Link href="/pricing" className="btn-primary px-8 py-3.5">
          Mitgliedschaft ansehen
        </Link>
        <p className="text-xs text-text/30 mt-4">14 Tage Geld-zurück-Garantie</p>
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <Heart className="w-16 h-16 text-primary/20 mb-6" />
        <h2 className="font-heading text-4xl text-dark mb-3">Noch keine Matches</h2>
        <p className="text-text/50 max-w-sm mb-8">
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
      <h1 className="font-heading text-3xl text-dark mb-2">Matches</h1>
      <p className="text-text/50 text-sm mb-8">
        {activeMatchId ? (
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-primary" />
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

          return (
            <div key={match.id} className={cn('card flex gap-4', isThisActiveMatch && 'border-2 border-primary')}>
              {/* Avatar */}
              <div className="w-16 h-16 rounded-2xl bg-sand flex-shrink-0 flex items-center justify-center overflow-hidden">
                {profile.photos?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.photos[0]} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-heading text-2xl text-primary">{profile.name?.[0]}</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-heading text-xl text-dark">
                      {profile.name}{!profile.hide_age && profile.age ? `, ${profile.age}` : ''}
                    </h3>
                    {!profile.hide_location && profile.location && (
                      <div className="flex items-center gap-1 text-text/40 text-xs mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {profile.location}
                      </div>
                    )}
                  </div>
                  {isThisActiveMatch && (
                    <span className="flex items-center gap-1 text-xs text-primary bg-light px-2 py-1 rounded-full">
                      <CheckCircle className="w-3 h-3" /> Aktiv
                    </span>
                  )}
                </div>

                {profile.intention && (
                  <p className="text-xs text-text/50 mt-1">{profile.intention}</p>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-3 flex-wrap">
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
                    <span className="flex items-center gap-1.5 text-xs text-text/40">
                      <Clock className="w-3.5 h-3.5" /> Anfrage gesendet
                    </span>
                  ) : (
                    <button
                      onClick={() => requestConnection(match.id)}
                      disabled={loading === match.id || (!!activeMatchId && !isThisActiveMatch)}
                      className={cn('btn-primary text-xs py-2 px-4', activeMatchId && !isThisActiveMatch && 'opacity-40 cursor-not-allowed')}
                    >
                      {loading === match.id ? '...' : 'Begegnung anfragen'}
                    </button>
                  )}
                </div>

                {isRequested && !isRequester && connection?.expires_at && (
                  <p className="text-xs text-text/30 mt-1">
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
