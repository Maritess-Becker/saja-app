'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Heart, X, MapPin, Sparkles, Users, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Message } from '@/types'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { formatRelativeTime, cn } from '@/lib/utils'
import Link from 'next/link'

const DAILY_QUESTIONS = [
  'Was war dein schönster Moment diese Woche?',
  'Wofür bist du heute dankbar?',
  'Was macht dich neugierig auf das Leben?',
  'Beschreibe einen Ort, an dem du dich vollkommen frei fühlst.',
  'Was hat dich zuletzt wirklich berührt?',
  'Was bedeutet Heimat für dich?',
  'Welche Eigenschaft an dir selbst liebst du am meisten?',
]

interface Props {
  activeMatch: { id: string; user1_id: string; user2_id: string } | null
  activeConnection: { id: string; status: string; requested_by: string; started_at: string | null } | null
  otherProfile: Profile | null
  initialMessages: Message[]
  currentUserId: string
  tier: 'free' | 'membership' | 'premium'
}

export function BegegnungClient({
  activeMatch,
  activeConnection,
  otherProfile,
  initialMessages,
  currentUserId,
  tier,
}: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const dailyQuestion = DAILY_QUESTIONS[new Date().getDate() % DAILY_QUESTIONS.length]

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!activeConnection) return
    const channel = supabase
      .channel(`begegnung:${activeConnection.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `connection_id=eq.${activeConnection.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [activeConnection, supabase])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || !activeConnection) return
    setSending(true)
    const { error } = await supabase.from('messages').insert({
      connection_id: activeConnection.id,
      sender_id: currentUserId,
      content: text.trim(),
    })
    if (error) toast.error('Fehler beim Senden.')
    else setText('')
    setSending(false)
  }

  async function sendDailyQuestion() {
    if (!activeConnection) return
    await supabase.from('messages').insert({
      connection_id: activeConnection.id,
      sender_id: currentUserId,
      content: `Frage des Tages: ${dailyQuestion}`,
    })
  }

  async function endConnection() {
    if (!activeConnection || !activeMatch) return
    await supabase
      .from('connections')
      .update({ status: 'ended', ended_at: new Date().toISOString() })
      .eq('id', activeConnection.id)
    await supabase
      .from('matches')
      .update({ status: 'ended' })
      .eq('id', activeMatch.id)
    toast.success('Begegnung beendet. Ihr seid beide wieder frei.')
    router.push('/discover')
    router.refresh()
  }

  // ── Free tier lock ──────────────────────────────────────────────────────
  if (tier === 'free') {
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-6 text-center max-w-sm mx-auto">
        <div className="w-20 h-20 bg-sand rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-9 h-9 text-text/30" />
        </div>
        <h2 className="font-heading text-4xl text-dark mb-3">Begegnung ist gesperrt</h2>
        <p className="text-text/55 leading-relaxed mb-8">
          Mit der Mitgliedschaft (29 €/Monat) kannst du Begegnungen starten und mit Matches chatten.
        </p>
        <Link href="/pricing" className="btn-primary px-8 py-3.5">
          Mitgliedschaft ansehen
        </Link>
        <p className="text-xs text-text/30 mt-4">14 Tage Geld-zurück-Garantie</p>
      </div>
    )
  }

  // ── Kein aktives Match ──────────────────────────────────────────────────
  if (!activeMatch || !activeConnection) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-6 text-center">
        <div className="w-20 h-20 bg-light rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-10 h-10 text-primary" />
        </div>
        <h2 className="font-heading text-4xl text-dark mb-4">
          Noch keine aktive Begegnung
        </h2>
        <p className="text-text/50 max-w-sm leading-relaxed mb-8">
          Sobald du und eine andere Person eine Begegnung gestartet habt,
          erscheint euer Chat hier — mit voller Aufmerksamkeit für einander.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/matches" className="btn-primary flex items-center gap-2">
            <Users className="w-4 h-4" />
            Zu den Matches
          </Link>
          <Link href="/discover" className="btn-secondary">
            Entdecken
          </Link>
        </div>
        <div className="mt-12 max-w-sm">
          <div className="card bg-light border-0">
            <p className="text-xs text-primary font-medium uppercase tracking-wider mb-2">
              One Connection Rule
            </p>
            <p className="text-text/60 text-sm leading-relaxed">
              Bei Saja kannst du immer nur mit{' '}
              <strong className="text-dark">einer Person gleichzeitig</strong>{' '}
              in einer Begegnung sein — für echte Tiefe statt endloses Chatten.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Aktive Begegnung ────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto w-full">

      {/* Header */}
      <div className="flex items-center gap-4 p-4 bg-white border-b border-sand">
        <div className="w-12 h-12 rounded-xl bg-sand flex items-center justify-center overflow-hidden flex-shrink-0">
          {otherProfile?.photos?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={otherProfile.photos[0]} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="font-heading text-xl text-primary">
              {otherProfile?.name?.[0]}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-heading text-xl text-dark">{otherProfile?.name}</h2>
          {otherProfile?.location && !otherProfile.hide_location && (
            <div className="flex items-center gap-1 text-text/40 text-xs">
              <MapPin className="w-3 h-3" />
              {otherProfile.location}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 bg-light px-3 py-1.5 rounded-full">
          <Heart className="w-3.5 h-3.5 text-primary fill-primary" />
          <span className="text-xs text-primary font-medium">Begegnung aktiv</span>
        </div>
        <button
          onClick={() => setShowEndConfirm(true)}
          className="p-2 text-text/30 hover:text-red-400 transition-colors"
          title="Begegnung beenden"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Frage des Tages */}
      <div className="px-4 py-3 bg-light border-b border-sand">
        <p className="text-xs text-primary font-medium mb-1">Frage des Tages</p>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-text/70 italic">&ldquo;{dailyQuestion}&rdquo;</p>
          <button
            onClick={sendDailyQuestion}
            className="text-xs text-primary hover:underline flex-shrink-0 font-medium"
          >
            Senden
          </button>
        </div>
      </div>

      {/* Nachrichten */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-16">
            <Heart className="w-12 h-12 text-primary/20 mx-auto mb-4" />
            <p className="font-heading text-xl text-dark/40">
              Der Anfang von etwas Besonderem
            </p>
            <p className="text-text/30 text-sm mt-2">
              Sende eine erste Nachricht oder nutze die Frage des Tages.
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId
          return (
            <div key={msg.id} className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
              {!isMe && (
                <div className="w-7 h-7 rounded-full bg-sand flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                  <span className="text-xs font-heading text-primary">
                    {otherProfile?.name?.[0]}
                  </span>
                </div>
              )}
              <div
                className={cn(
                  'max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed',
                  isMe
                    ? 'bg-primary text-white rounded-br-sm'
                    : 'bg-white border border-sand text-text rounded-bl-sm'
                )}
              >
                {msg.content}
                <p className={cn('text-[10px] mt-1.5', isMe ? 'text-white/50' : 'text-text/30')}>
                  {formatRelativeTime(msg.created_at)}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Eingabe */}
      <form
        onSubmit={sendMessage}
        className="p-4 bg-white border-t border-sand flex gap-3"
      >
        <input
          type="text"
          className="input flex-1"
          placeholder="Schreibe etwas..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 hover:bg-dark transition-colors"
        >
          <Send className="w-5 h-5 text-white" />
        </button>
      </form>

      {/* Bestätigungs-Modal */}
      {showEndConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-sm w-full">
            <h3 className="font-heading text-2xl text-dark mb-3">Begegnung beenden?</h3>
            <p className="text-text/60 text-sm mb-6 leading-relaxed">
              Wenn du die Begegnung beendest, seid ihr beide sofort wieder frei —
              neue Matches und Entdecken werden wieder aktiviert.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEndConfirm(false)}
                className="btn-secondary flex-1"
              >
                Abbrechen
              </button>
              <button
                onClick={endConnection}
                className="flex-1 bg-red-500 text-white px-6 py-3 rounded-full hover:bg-red-600 transition-colors font-medium"
              >
                Ja, beenden
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
