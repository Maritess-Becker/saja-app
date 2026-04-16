'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Heart, X, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Message } from '@/types'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatRelativeTime, cn, photoUrl } from '@/lib/utils'
import { useKeyboardNav } from '@/hooks/useKeyboardNav'

interface Connection {
  id: string
  match_id: string
  requested_by: string
  status: string
  started_at: string | null
}

interface Props {
  connection: Connection
  otherProfile: Profile | null
  initialMessages: Message[]
  currentUserId: string
  matchId: string
}

const DAILY_QUESTIONS = [
  'Was war dein schönster Moment diese Woche?',
  'Wofür bist du heute dankbar?',
  'Was macht dich neugierig auf das Leben?',
  'Beschreibe einen Ort, an dem du dich vollkommen frei fühlst.',
  'Was hat dich zuletzt wirklich berührt?',
  'Was bedeutet Heimat für dich?',
  'Welche Eigenschaft an dir selbst liebst du am meisten?',
]

export function ConnectionClient({ connection, otherProfile, initialMessages, currentUserId, matchId }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const dailyQuestion = DAILY_QUESTIONS[new Date().getDate() % DAILY_QUESTIONS.length]

  // Push mobile bottom nav behind keyboard when typing
  useKeyboardNav()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    // Realtime subscription
    const channel = supabase
      .channel(`connection:${connection.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `connection_id=eq.${connection.id}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [connection.id, supabase])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    setSending(true)
    const { error } = await supabase.from('messages').insert({
      connection_id: connection.id,
      sender_id: currentUserId,
      content: text.trim(),
    })
    if (error) toast.error('Fehler beim Senden.')
    else setText('')
    setSending(false)
  }

  async function sendDailyQuestion() {
    await supabase.from('messages').insert({
      connection_id: connection.id,
      sender_id: currentUserId,
      content: `Frage des Tages: ${dailyQuestion}`,
    })
  }

  async function endConnection() {
    await supabase
      .from('connections')
      .update({ status: 'ended', ended_at: new Date().toISOString() })
      .eq('id', connection.id)
    await supabase
      .from('matches')
      .update({ status: 'ended' })
      .eq('id', matchId)
    toast.success('Begegnung beendet. Ihr seid beide wieder frei.')
    router.push('/discover')
    router.refresh()
  }

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto overflow-hidden" style={{ height: '100%' }}>
      {/* Header */}
      <div className="flex items-center gap-4 p-4 bg-white border-b border-sand">
        <Link href={`/profile/${otherProfile?.user_id}`} className="w-12 h-12 rounded-xl bg-sand flex items-center justify-center overflow-hidden flex-shrink-0 hover:opacity-90 transition-opacity">
          {photoUrl(otherProfile?.photos?.[0]) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl(otherProfile?.photos?.[0])} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="font-heading text-xl text-primary">{otherProfile?.name?.[0]}</span>
          )}
        </Link>
        <Link href={`/profile/${otherProfile?.user_id}`} className="flex-1 min-w-0 hover:opacity-70 transition-opacity">
          <h2 className="font-heading text-xl text-dark">{otherProfile?.name}</h2>
          {otherProfile?.location && !otherProfile.hide_location && (
            <div className="flex items-center gap-1 text-text/40 text-xs">
              <MapPin className="w-3 h-3" />
              {otherProfile.location}
            </div>
          )}
        </Link>
        <div className="flex items-center gap-1">
          <Heart className="w-4 h-4 text-primary fill-primary" />
          <span className="text-xs text-primary font-medium">Begegnung</span>
        </div>
        <button
          onClick={() => setShowEndConfirm(true)}
          className="p-2 text-text/30 hover:text-red-400 transition-colors"
          title="Phase beenden"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Daily question banner */}
      <div className="px-4 py-3 bg-light border-b border-sand">
        <p className="text-xs text-primary font-medium mb-1">Frage des Tages</p>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-text/70 italic">&ldquo;{dailyQuestion}&rdquo;</p>
          <button onClick={sendDailyQuestion} className="text-xs text-primary hover:underline flex-shrink-0">
            Senden
          </button>
        </div>
      </div>

      {/* Nachrichten — einziger scrollbarer Bereich */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-6 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Heart className="w-12 h-12 text-primary/20 mx-auto mb-4" />
            <p className="text-text/40 font-heading text-xl">Der Anfang von etwas Besonderem</p>
            <p className="text-text/30 text-sm mt-2">Sende eine erste Nachricht oder nutze die Frage des Tages.</p>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId
          return (
            <div key={msg.id} className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
              <div className={cn(
                'max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed',
                isMe
                  ? 'bg-primary text-white rounded-br-sm'
                  : 'bg-white border border-sand text-text rounded-bl-sm'
              )}>
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

      {/* Eingabe — bleibt immer unten sichtbar */}
      <form
        onSubmit={sendMessage}
        className="flex-shrink-0 px-4 pt-3 bg-white border-t border-[#E2DAD0] flex gap-3"
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <input
          type="text"
          className="flex-1 rounded-2xl border border-[#E2DAD0] bg-[#F6F2EC] px-4 py-3 text-sm font-body text-[#1A1410] placeholder:text-[#A89888] focus:outline-none focus:ring-2 focus:ring-[#9E6B47]/30"
          placeholder="Schreibe etwas…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="w-12 h-12 bg-[#9E6B47] rounded-2xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 hover:bg-[#7A4E30] transition-colors active:scale-95"
        >
          <Send className="w-5 h-5 text-white" />
        </button>
      </form>

      {/* Abstand zur Nav auf Mobile */}
      <div className="flex-shrink-0 md:hidden bg-white" style={{ height: 'calc(4rem + env(safe-area-inset-bottom, 0px))' }} />

      {/* End confirmation modal */}
      {showEndConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-sm w-full">
            <h3 className="font-heading text-2xl text-dark mb-3">Phase beenden?</h3>
            <p className="text-text/60 text-sm mb-6 leading-relaxed">
              Wenn du die Begegnung beendest, sind ihr beide sofort wieder frei —
              neue Matches und Entdecken werden wieder aktiviert.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowEndConfirm(false)} className="btn-secondary flex-1">
                Abbrechen
              </button>
              <button onClick={endConnection} className="flex-1 bg-red-500 text-white px-6 py-3 rounded-full hover:bg-red-600 transition-colors font-medium">
                Ja, beenden
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
