'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Heart, X, MapPin, Sparkles, Users, Lock, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Message } from '@/types'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { formatRelativeTime, cn, photoUrl } from '@/lib/utils'
import Link from 'next/link'
import { useChatLayout } from '@/hooks/useChatLayout'

const DAILY_QUESTIONS = [
  'Was war dein schönster Moment diese Woche?',
  'Wofür bist du heute dankbar?',
  'Was macht dich neugierig auf das Leben?',
  'Beschreibe einen Ort, an dem du dich vollkommen frei fühlst.',
  'Was hat dich zuletzt wirklich berührt?',
  'Was bedeutet Heimat für dich?',
  'Welche Eigenschaft an dir selbst liebst du am meisten?',
]

// ── 3-Level Guided Questions ─────────────────────────────────────
type QuestionLevel = 'leicht' | 'mittel' | 'tief'

const GUIDED_QUESTIONS_BY_LEVEL: Record<QuestionLevel, string[]> = {
  leicht: [
    'Was hat dich heute zum Lächeln gebracht?',
    'Was machst du gerade am liebsten?',
    'Was ist dein liebster Ort?',
    'Womit verbringst du eine freie Stunde am liebsten?',
    'Was hörst du gerade viel?',
  ],
  mittel: [
    'Was ist dir in Beziehungen wirklich wichtig?',
    'Was hat dich zuletzt überrascht?',
    'Wofür bist du gerade dankbar?',
    'Was lernst du gerade über dich?',
    'Was bedeutet dir Verbindung?',
  ],
  tief: [
    'Wann fühlst du dich wirklich sicher mit jemandem?',
    'Was brauchst du um dich wirklich zu öffnen?',
    'Was bedeutet für dich gerade echte Verbindung?',
    'Woran merkst du dass jemand wirklich zuhört?',
    'Was schützt du gerade in dir?',
  ],
}

// Keep legacy for backward compat
const GUIDED_QUESTIONS = GUIDED_QUESTIONS_BY_LEVEL.leicht

const INTENTION_OPTIONS = [
  'Ehrlich kennenlernen',
  'Schauen ob es fließt',
  'Offen ohne Erwartung',
]

const CHECKIN_OPTIONS = [
  { emoji: '🌿', label: 'Ruhig & geerdet',        value: 'calm' },
  { emoji: '✨', label: 'Inspiriert & offen',      value: 'inspired' },
  { emoji: '🌊', label: 'Unsicher & bewegt',       value: 'unsettled' },
  { emoji: '🌧',  label: 'Überfordert & erschöpft', value: 'exhausted' },
]

// Pick 3 random guided questions from a given level
function pickQuestions(level: QuestionLevel = 'leicht') {
  const shuffled = [...GUIDED_QUESTIONS_BY_LEVEL[level]].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 3)
}

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
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const spacerRef = useRef<HTMLDivElement>(null)

  const dailyQuestion = DAILY_QUESTIONS[new Date().getDate() % DAILY_QUESTIONS.length]

  // ── Guided First Message (Feature 7+8) ────────────────────────────────────
  const guidedKey = activeConnection ? `guided_done_${activeConnection.id}` : null
  const [guidedLevel, setGuidedLevel] = useState<QuestionLevel>('leicht')
  const [guidedQuestions, setGuidedQuestions] = useState(() => pickQuestions('leicht'))
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null)
  const [selectedIntention, setSelectedIntention] = useState<string | null>(() => {
    if (!activeConnection) return null
    return typeof window !== 'undefined'
      ? localStorage.getItem(`intention_${activeConnection?.id}`) ?? null
      : null
  })
  const [showGuided, setShowGuided] = useState(() => {
    if (!activeConnection || typeof window === 'undefined') return false
    const done = localStorage.getItem(`guided_done_${activeConnection.id}`)
    return !done && initialMessages.length === 0
  })
  const [guidedStep, setGuidedStep] = useState<'question' | 'intention'>('question')

  // ── End-flow steps (Feature 9+10) ─────────────────────────────────────────
  const [endStep, setEndStep] = useState<'none' | 'confirm' | 'closing' | 'checkin'>('none')
  const [closingMsg, setClosingMsg] = useState('')
  const [checkinResponse, setCheckinResponse] = useState<string | null>(null)
  const [checkinNote, setCheckinNote] = useState('')
  const [savingCheckin, setSavingCheckin] = useState(false)

  // Keeps input glued above keyboard and nav behind keyboard
  useChatLayout(containerRef, spacerRef)

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

  // Sends the guided question as the first message
  async function sendGuidedQuestion() {
    if (!selectedQuestion || !activeConnection) return
    setSending(true)
    await supabase.from('messages').insert({
      connection_id: activeConnection.id,
      sender_id: currentUserId,
      content: `✦ ${selectedQuestion}`,
    })
    if (guidedKey) localStorage.setItem(guidedKey, '1')
    if (selectedIntention && activeConnection)
      localStorage.setItem(`intention_${activeConnection.id}`, selectedIntention)
    setSending(false)
    setShowGuided(false)
  }

  function skipGuided() {
    if (guidedKey) localStorage.setItem(guidedKey, '1')
    if (selectedIntention && activeConnection)
      localStorage.setItem(`intention_${activeConnection.id}`, selectedIntention)
    setShowGuided(false)
  }

  // Ends DB connection, then flows through closing → checkin screens
  async function confirmEnd() {
    if (!activeConnection || !activeMatch) return
    await supabase
      .from('connections')
      .update({ status: 'ended', ended_at: new Date().toISOString() })
      .eq('id', activeConnection.id)
    await supabase
      .from('matches')
      .update({ status: 'ended' })
      .eq('id', activeMatch.id)
    setEndStep('closing')
  }

  async function sendClosingMessage() {
    if (closingMsg.trim() && activeConnection) {
      await supabase.from('messages').insert({
        connection_id: activeConnection.id,
        sender_id: currentUserId,
        content: `🌿 ${closingMsg.trim()}`,
      })
    }
    setEndStep('checkin')
  }

  async function saveCheckin() {
    if (!checkinResponse) return
    setSavingCheckin(true)
    const { data: authData } = await supabase.auth.getUser()
    if (authData.user) {
      const uid = authData.user.id

      await supabase.from('emotional_checkins').insert({
        user_id: uid,
        trigger: 'encounter_end',
        response: checkinResponse,
        note: checkinNote.trim() || null,
      })

      // Update checkin_pattern (last 10 responses)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('checkin_pattern')
        .eq('user_id', uid)
        .single()

      const currentPattern = (profileData?.checkin_pattern as Record<string, number>) ?? {}
      const updatedPattern = { ...currentPattern, [checkinResponse]: (currentPattern[checkinResponse] ?? 0) + 1 }
      await supabase.from('profiles').update({ checkin_pattern: updatedPattern }).eq('user_id', uid)

      // Check burnout: 3 consecutive exhausted check-ins?
      const { data: recent } = await supabase
        .from('emotional_checkins')
        .select('response')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
        .limit(3)
      if (recent && recent.length >= 3 && recent.every(r => r.response === 'exhausted')) {
        localStorage.setItem('show_burnout_hint', '1')
      }

      // Pattern feedback: check if any response appears 3+ times in total
      const maxCount = Math.max(...Object.values(updatedPattern))
      const totalCheckins = Object.values(updatedPattern).reduce((a, b) => a + b, 0)
      if (totalCheckins > 0 && totalCheckins % 5 === 0 && maxCount >= 3) {
        const dominantResponse = Object.entries(updatedPattern).sort((a, b) => b[1] - a[1])[0][0]
        localStorage.setItem('show_pattern_feedback', dominantResponse)
        // Reset pattern after feedback
        await supabase.from('profiles').update({ checkin_pattern: {} }).eq('user_id', uid)
      }
    }
    setSavingCheckin(false)
    router.push('/content?tab=journal&trigger=encounter')
    router.refresh()
  }

  function skipCheckin() {
    toast.success('Begegnung beendet. Ihr seid beide wieder frei.')
    router.push('/discover')
    router.refresh()
  }

  // ── Free tier lock ──────────────────────────────────────────────────────
  if (tier === 'free') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center bg-[#221080]">
        <div className="w-20 h-20 bg-[rgba(253,248,242,0.12)] rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-9 h-9 text-[#FDF8F2]/50" />
        </div>
        <h2 className="font-heading text-4xl text-[#FDF8F2] mb-3">Begegnung ist gesperrt</h2>
        <p className="text-[#FDF8F2]/60 leading-relaxed mb-8 max-w-sm">
          Mit der Mitgliedschaft (29 €/Monat) kannst du Begegnungen starten und mit Matches chatten.
        </p>
        <Link href="/pricing" className="bg-[#FDF8F2] text-[#1A1410] px-8 py-3.5 rounded-full font-body font-semibold hover:bg-white transition-colors">
          Mitgliedschaft ansehen
        </Link>
        <p className="text-xs text-[#FDF8F2]/30 mt-4">14 Tage Geld-zurück-Garantie</p>
      </div>
    )
  }

  // ── Kein aktives Match ──────────────────────────────────────────────────
  if (!activeMatch || !activeConnection) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-6 text-center">
        <div className="w-20 h-20 bg-[#FDF8F2] rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-10 h-10 text-[#1A1410]" />
        </div>
        <h2 className="font-heading text-4xl text-[#1A1410] mb-4">
          Noch keine aktive Begegnung
        </h2>
        <p className="text-[#6B6058] max-w-sm leading-relaxed mb-8">
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
          <div className="card bg-[#FDF8F2] border-0">
            <p className="text-xs text-[#1A1410] font-medium uppercase tracking-wider mb-2">
              One Connection Rule
            </p>
            <p className="text-[#6B6058] text-sm leading-relaxed">
              Bei Saja kannst du immer nur mit{' '}
              <strong className="text-[#1A1410]">einer Person gleichzeitig</strong>{' '}
              in einer Begegnung sein — für echte Tiefe statt endloses Chatten.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Aktive Begegnung ────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="flex flex-col w-full max-w-2xl mx-auto overflow-hidden" style={{ height: '100dvh' }}>

      {/* Header */}
      <div className="flex items-center gap-4 p-4 bg-[#221080]">
        <Link href={`/profile/${otherProfile?.user_id}`} className="w-12 h-12 rounded-xl bg-[rgba(253,248,242,0.15)] flex items-center justify-center overflow-hidden flex-shrink-0 hover:opacity-90 transition-opacity">
          {photoUrl(otherProfile?.photos?.[0]) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl(otherProfile?.photos?.[0])} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="font-heading text-xl text-[#FDF8F2]">
              {otherProfile?.name?.[0]}
            </span>
          )}
        </Link>
        <Link href={`/profile/${otherProfile?.user_id}`} className="flex-1 min-w-0 hover:opacity-70 transition-opacity">
          <h2 className="font-heading text-xl text-[#FDF8F2]">{otherProfile?.name}</h2>
          {otherProfile?.location && !otherProfile.hide_location && (
            <div className="flex items-center gap-1 text-[#FDF8F2]/50 text-xs">
              <MapPin className="w-3 h-3" />
              {otherProfile.location}
            </div>
          )}
        </Link>
        <div className="flex items-center gap-1.5 bg-[rgba(253,248,242,0.15)] px-3 py-1.5 rounded-full">
          <Heart className="w-3.5 h-3.5 text-[#FDF8F2] fill-[#FDF8F2]" />
          <span className="text-xs text-[#FDF8F2] font-medium">Begegnung aktiv</span>
        </div>
        <button
          onClick={() => setEndStep('confirm')}
          className="p-2 text-[#FDF8F2]/40 hover:text-red-300 transition-colors"
          title="Begegnung beenden"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Meine Intention */}
      {selectedIntention && (
        <div className="px-4 py-2 border-b border-[rgba(34,16,128,0.10)] bg-[#FDF8F2]">
          <p className="text-[10px] text-[#6B6058] uppercase tracking-widest">Meine Intention</p>
          <p className="text-xs text-[#6B6058] font-body font-light">{selectedIntention}</p>
        </div>
      )}

      {/* Frage des Tages */}
      <div className="px-4 py-3 bg-[#FDF8F2] border-b border-[rgba(30,20,10,0.08)]">
        <p className="text-xs text-[#1A1410] font-medium mb-1">Frage des Tages</p>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-[#1A1410] italic">&ldquo;{dailyQuestion}&rdquo;</p>
          <button
            onClick={sendDailyQuestion}
            className="text-xs text-[#1A1410] hover:underline flex-shrink-0 font-medium"
          >
            Senden
          </button>
        </div>
      </div>

      {/* Nachrichten — einziger scrollbarer Bereich */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-6 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-16">
            <Heart className="w-12 h-12 text-[#6B6058] mx-auto mb-4" />
            <p className="font-heading text-xl text-[#1A1410]/40">
              Der Anfang von etwas Besonderem
            </p>
            <p className="text-[#A09888] text-sm mt-2">
              Sende eine erste Nachricht oder nutze die Frage des Tages.
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId
          return (
            <div key={msg.id} className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
              {!isMe && (
                <div className="w-7 h-7 rounded-full bg-[#EDE8E0] flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                  <span className="text-xs font-heading text-[#1A1410]">
                    {otherProfile?.name?.[0]}
                  </span>
                </div>
              )}
              <div
                className={cn(
                  'max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed',
                  isMe
                    ? 'bg-primary text-white rounded-br-sm'
                    : 'bg-white border border-[rgba(30,20,10,0.08)] text-[#1A1410] rounded-bl-sm'
                )}
              >
                {msg.content}
                <p className={cn('text-[10px] mt-1.5', isMe ? 'text-white/50' : 'text-[#A09888]')}>
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
        className="flex-shrink-0 px-4 pt-3 bg-white border-t border-[rgba(34,16,128,0.12)] flex gap-3"
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <input
          type="text"
          className="flex-1 rounded-full border border-[rgba(30,20,10,0.15)] bg-white px-4 py-3 text-sm font-body font-light text-[#1A1410] placeholder:text-[#A09888] focus:outline-none focus:border-[#221080] focus:border-[1.5px]"
          placeholder="Schreibe etwas…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="w-11 h-11 bg-[#221080] rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-40 hover:bg-[#120850] transition-colors active:scale-95"
        >
          <Send className="w-4 h-4 text-[#FDF8F2]" />
        </button>
      </form>

      {/* Abstand zur Nav auf Mobile — kollabiert wenn Tastatur offen ist */}
      <div ref={spacerRef} className="flex-shrink-0 md:hidden bg-white" style={{ height: 'calc(4rem + env(safe-area-inset-bottom, 0px))' }} />

      {/* ── Guided First Message Overlay — 3 Ebenen ── */}
      {showGuided && (
        <div className="fixed inset-0 z-50 flex flex-col px-5 py-8 overflow-y-auto"
          style={{ background: 'var(--bg-violett)' }}>
          <button onClick={skipGuided} className="self-end text-[#FDF8F2]/40 text-sm font-body mb-6 hover:text-[#FDF8F2]/70">
            Überspringen
          </button>

          {guidedStep === 'question' ? (
            <>
              <h2 className="font-heading text-[32px] text-[#FDF8F2] mb-3 leading-tight">Wie möchtest du beginnen?</h2>
              <p className="text-[#FDF8F2]/55 font-body font-light text-sm mb-6 leading-relaxed">
                Wähle eine Ebene — oder schreib einfach was sich richtig anfühlt.
              </p>

              {/* Level pills */}
              <div className="flex gap-2 mb-6">
                {([
                  { key: 'leicht' as QuestionLevel, label: 'Leicht', badge: 'bg-[rgba(253,248,242,0.12)] text-[#FDF8F2]' },
                  { key: 'mittel' as QuestionLevel, label: 'Nachdenklich', badge: 'bg-[#221080] text-[#FDF8F2]' },
                  { key: 'tief' as QuestionLevel, label: 'In die Tiefe', badge: 'bg-[#3D1F9E] text-[#FDF8F2]' },
                ] as const).map((lvl) => (
                  <button
                    key={lvl.key}
                    onClick={() => {
                      setGuidedLevel(lvl.key)
                      setGuidedQuestions(pickQuestions(lvl.key))
                      setSelectedQuestion(null)
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-body transition-all border ${
                      guidedLevel === lvl.key
                        ? 'border-[#FDF8F2] bg-[rgba(253,248,242,0.15)] text-[#FDF8F2]'
                        : 'border-[rgba(253,248,242,0.2)] text-[#FDF8F2]/55'
                    }`}
                  >
                    {lvl.label}
                  </button>
                ))}
              </div>

              {/* Questions */}
              <div className="space-y-3 mb-8">
                {guidedQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => setSelectedQuestion(q)}
                    className={`w-full text-left px-5 py-4 rounded-2xl transition-all font-body font-light text-sm leading-relaxed ${
                      selectedQuestion === q
                        ? 'bg-[rgba(253,248,242,0.14)] border border-[rgba(253,248,242,0.4)] text-[#FDF8F2]'
                        : 'bg-[rgba(253,248,242,0.06)] border border-[rgba(253,248,242,0.12)] text-[#FDF8F2]/70'
                    }`}
                  >
                    &ldquo;{q}&rdquo;
                  </button>
                ))}
              </div>

              <button
                onClick={() => selectedQuestion && setGuidedStep('intention')}
                disabled={!selectedQuestion}
                className="btn-primary w-full mb-3 disabled:opacity-40"
              >
                Diese Frage senden ✦
              </button>
              <button onClick={skipGuided} className="w-full py-3 text-[#FDF8F2]/50 text-sm font-body">
                Eigene Nachricht schreiben
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setGuidedStep('question')} className="self-start text-[#FDF8F2]/40 text-sm font-body mb-6">
                ← Zurück
              </button>
              <h2 className="font-heading text-[28px] text-[#FDF8F2] mb-2 leading-tight">Meine Intention für dieses Gespräch</h2>
              <p className="text-[#FDF8F2]/40 font-body font-light text-xs uppercase tracking-widest mb-6">Nur für dich sichtbar</p>
              <div className="space-y-2 mb-8">
                {INTENTION_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSelectedIntention(opt)}
                    className={`w-full text-left px-5 py-3.5 rounded-full transition-all font-body font-light text-sm ${
                      selectedIntention === opt
                        ? 'bg-[#FDF8F2] text-[#1A1410]'
                        : 'bg-[rgba(253,248,242,0.08)] border border-[rgba(253,248,242,0.15)] text-[#FDF8F2]/70'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <button
                onClick={sendGuidedQuestion}
                disabled={sending || !selectedQuestion}
                className="btn-primary w-full disabled:opacity-40"
              >
                {sending ? '…' : 'Diese Frage senden ✦'}
              </button>
            </>
          )}
        </div>
      )}

      {/* ── End Confirm Modal ── */}
      {endStep === 'confirm' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#FDF8F2] rounded-2xl p-6 max-w-sm w-full">
            <h3 className="font-heading text-2xl text-[#1A1410] mb-3">Begegnung beenden?</h3>
            <p className="text-[#6B6058] text-sm mb-6 leading-relaxed font-body">
              Wenn du die Begegnung beendest, seid ihr beide sofort wieder frei.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setEndStep('none')} className="flex-1 py-3 rounded-full text-sm font-body border border-[rgba(34,16,128,0.2)] text-[#6B6058]">
                Abbrechen
              </button>
              <button onClick={confirmEnd} className="flex-1 bg-red-500 text-white py-3 rounded-full text-sm font-medium hover:bg-red-600 transition-colors">
                Ja, beenden
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Closing Message Screen (Feature 9) ── */}
      {endStep === 'closing' && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 bg-[#FDF8F2]">
          <div className="w-full max-w-sm">
            <h2 className="font-heading text-3xl text-[#1A1410] mb-3 text-center">
              Möchtest du der anderen Person etwas mitgeben?
            </h2>
            <p className="text-[#6B6058] text-sm font-body text-center mb-6 leading-relaxed">
              Eine kurze ehrliche Nachricht — kein Muss, aber manchmal bedeutsam.
            </p>
            <textarea
              value={closingMsg}
              onChange={(e) => setClosingMsg(e.target.value.slice(0, 200))}
              placeholder="Eine kurze ehrliche Nachricht..."
              className="w-full px-4 py-3 rounded-xl border border-[rgba(34,16,128,0.15)] bg-white text-[#1A1410] text-sm font-body font-light resize-none focus:outline-none focus:border-[rgba(34,16,128,0.4)] mb-2"
              rows={4}
            />
            <div className="flex justify-end mb-4">
              <span className="text-[10px] text-[#6B6058]">{closingMsg.length}/200</span>
            </div>
            <button onClick={sendClosingMessage} className="btn-primary-dark w-full mb-3">
              {closingMsg.trim() ? 'Nachricht senden' : 'Ohne Nachricht weiter'}
            </button>
            <button onClick={() => setEndStep('checkin')} className="w-full py-3 text-[#6B6058] text-sm font-body">
              Ohne Nachricht abschließen
            </button>
          </div>
        </div>
      )}

      {/* ── Emotional Check-in Screen (Feature 10) ── */}
      {endStep === 'checkin' && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 bg-[#FDF8F2]">
          <div className="w-full max-w-sm">
            <h2 className="font-heading text-[28px] text-[#1A1410] mb-6 text-center">Wie fühlst du dich?</h2>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {CHECKIN_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setCheckinResponse(opt.value)}
                  className={`flex flex-col items-center py-5 px-3 rounded-2xl border transition-all ${
                    checkinResponse === opt.value
                      ? 'border-[rgba(34,16,128,0.4)] bg-[rgba(34,16,128,0.06)]'
                      : 'border-[rgba(34,16,128,0.10)] bg-white hover:border-[rgba(34,16,128,0.2)]'
                  }`}
                >
                  <span className="text-2xl mb-2">{opt.emoji}</span>
                  <span className="text-xs text-[#1A1410] font-body text-center leading-snug">{opt.label}</span>
                </button>
              ))}
            </div>
            {checkinResponse && (
              <div className="mb-4">
                <textarea
                  value={checkinNote}
                  onChange={(e) => setCheckinNote(e.target.value)}
                  placeholder="Möchtest du mehr dazu festhalten? (optional)"
                  className="w-full px-4 py-3 rounded-xl border border-[rgba(34,16,128,0.12)] bg-white text-[#1A1410] text-sm font-body font-light resize-none focus:outline-none"
                  rows={2}
                />
              </div>
            )}
            <button
              onClick={saveCheckin}
              disabled={!checkinResponse || savingCheckin}
              className="btn-primary-dark w-full mb-3 disabled:opacity-40"
            >
              {savingCheckin ? '…' : 'Speichern & zum Journal'}
            </button>
            <button onClick={skipCheckin} className="w-full py-3 text-[#6B6058] text-sm font-body">
              Überspringen
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
