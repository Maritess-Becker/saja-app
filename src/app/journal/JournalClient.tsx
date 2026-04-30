'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { JournalEntry } from '@/types'
import { useSearchParams } from 'next/navigation'
import { Plus, X, ChevronLeft, Check } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// ── Daily prompt pool ────────────────────────────────────────────────────────
const DAILY_PROMPTS = [
  'Was wünschst du dir gerade von einer Verbindung?',
  'Was hast du heute über dich gelernt?',
  'Wann hast du dich zuletzt wirklich gesehen gefühlt?',
  'Was brauchst du gerade von dir selbst?',
  'Welche Begegnung hat dich zuletzt wirklich berührt — und warum?',
  'Was schützt du gerade in dir?',
  'Wofür bist du heute dankbar?',
]

function getDailyPrompt() {
  const day = Math.floor(Date.now() / 86_400_000)
  return DAILY_PROMPTS[day % DAILY_PROMPTS.length]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('de-DE', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

// ── Props ────────────────────────────────────────────────────────────────────
interface Props {
  initialEntries: JournalEntry[]
  userId: string
}

// ── Component ────────────────────────────────────────────────────────────────
export function JournalClient({ initialEntries, userId }: Props) {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const triggerParam = searchParams.get('trigger')

  const [entries, setEntries]           = useState<JournalEntry[]>(initialEntries)
  const [writing, setWriting]           = useState(false)
  const [openEntry, setOpenEntry]       = useState<JournalEntry | null>(null)
  const [draft, setDraft]               = useState('')
  const [draftPrompt, setDraftPrompt]   = useState<string | null>(null)
  const [saving, setSaving]             = useState(false)
  const [dailyDone, setDailyDone]       = useState(false)

  const dailyPrompt = getDailyPrompt()

  // If coming from encounter end, pre-fill the encounter prompt
  useEffect(() => {
    if (triggerParam === 'encounter') {
      setDraftPrompt('Diese Begegnung ist abgeschlossen. Was nehme ich mit?')
      setDraft('')
      setWriting(true)
    }
  }, [triggerParam])

  // Check if daily prompt was answered today
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    const done = entries.some(
      (e) => e.trigger === 'daily' && e.created_at.startsWith(today)
    )
    setDailyDone(done)
  }, [entries])

  async function saveEntry() {
    if (!draft.trim()) return
    setSaving(true)
    const { data, error } = await supabase
      .from('journal_entries')
      .insert({
        user_id: userId,
        prompt: draftPrompt,
        content: draft.trim(),
        trigger: triggerParam === 'encounter' ? 'encounter' : draftPrompt ? 'daily' : 'free',
      })
      .select()
      .single()
    if (!error && data) {
      setEntries((prev) => [data as JournalEntry, ...prev])
    }
    setSaving(false)
    setWriting(false)
    setDraft('')
    setDraftPrompt(null)
  }

  function startFree() {
    setDraftPrompt(null)
    setDraft('')
    setWriting(true)
  }

  function startDaily() {
    setDraftPrompt(dailyPrompt)
    setDraft('')
    setWriting(true)
  }

  // ── Write view ──────────────────────────────────────────────────────────────
  if (writing) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-6 pb-24">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => { setWriting(false); setDraft(''); setDraftPrompt(null) }}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[rgba(34,16,128,0.07)] transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-[#6B6058]" />
          </button>
          <span className="text-xs text-[#6B6058] uppercase tracking-widest font-body">Neuer Eintrag</span>
        </div>

        {draftPrompt && (
          <div className="mb-5 px-4 py-4 rounded-2xl bg-white border border-[rgba(34,16,128,0.10)]">
            <p className="text-[10px] text-[#6B6058] uppercase tracking-widest mb-1.5 font-body">Impuls</p>
            <p className="font-heading text-lg italic text-[#1A1410]">&ldquo;{draftPrompt}&rdquo;</p>
          </div>
        )}

        <textarea
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={draftPrompt ? 'Schreib was auch immer kommt…' : 'Ein Gedanke, eine Beobachtung, ein Gefühl…'}
          className="w-full min-h-[240px] px-4 py-4 rounded-2xl border border-[rgba(34,16,128,0.12)] bg-white text-[#1A1410] text-sm font-body font-light leading-relaxed resize-none focus:outline-none focus:border-[rgba(34,16,128,0.35)] mb-4"
        />

        <button
          onClick={saveEntry}
          disabled={!draft.trim() || saving}
          className="btn-primary-dark w-full disabled:opacity-40 flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" />
          {saving ? 'Speichern…' : 'Speichern'}
        </button>
      </div>
    )
  }

  // ── Open entry detail ───────────────────────────────────────────────────────
  if (openEntry) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-6 pb-24">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setOpenEntry(null)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[rgba(34,16,128,0.07)]"
          >
            <ChevronLeft className="w-5 h-5 text-[#6B6058]" />
          </button>
          <span className="text-xs text-[#6B6058] uppercase tracking-widest font-body">
            {formatDate(openEntry.created_at)}
          </span>
        </div>
        {openEntry.prompt && (
          <div className="mb-5 px-4 py-4 rounded-2xl bg-white border border-[rgba(34,16,128,0.10)]">
            <p className="text-[10px] text-[#6B6058] uppercase tracking-widest mb-1 font-body">Impuls</p>
            <p className="font-heading text-lg italic text-[#1A1410]">&ldquo;{openEntry.prompt}&rdquo;</p>
          </div>
        )}
        <div className="bg-white rounded-2xl border border-[rgba(34,16,128,0.10)] px-5 py-5">
          <p className="text-[#1A1410] text-sm font-body font-light leading-relaxed whitespace-pre-wrap">
            {openEntry.content}
          </p>
        </div>
      </div>
    )
  }

  // ── Main view ───────────────────────────────────────────────────────────────
  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-24 relative">

      {/* Header */}
      <div className="sticky top-0 z-20 bg-transparent pt-0 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/profile" className="w-8 h-8 flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-[#6B6058]" />
          </Link>
          <h1 className="font-heading text-[42px] font-light text-[#1A1410] leading-none tracking-tight">Journal</h1>
        </div>
      </div>

      {/* Daily Prompt Card */}
      {!dailyDone && (
        <div className="bg-white rounded-2xl border border-[rgba(34,16,128,0.10)] p-5 mb-5 shadow-sm">
          <p className="text-[10px] text-[#6B6058] uppercase tracking-widest mb-3 font-body">Frage des Tages</p>
          <p className="font-heading text-xl italic text-[#1A1410] leading-snug mb-4">
            &ldquo;{dailyPrompt}&rdquo;
          </p>
          <button onClick={startDaily} className="btn-primary-dark text-sm py-2.5 px-5">
            Jetzt reflektieren
          </button>
        </div>
      )}

      {/* Free write button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={startFree}
          className="flex items-center gap-2 text-sm text-[#6B6058] hover:text-[#1A1410] font-body transition-colors"
        >
          <Plus className="w-4 h-4" /> Freier Eintrag
        </button>
      </div>

      {/* Entry list */}
      {entries.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-heading text-2xl text-[#6B6058] mb-2">Noch keine Einträge</p>
          <p className="text-sm text-[#6B6058] font-body">Dein erster Gedanke wartet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <button
              key={entry.id}
              onClick={() => setOpenEntry(entry)}
              className="w-full text-left bg-white rounded-2xl border border-[rgba(34,16,128,0.08)] px-5 py-4 hover:border-[rgba(34,16,128,0.2)] transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {entry.prompt && (
                    <p className="text-[10px] text-[#6B6058] uppercase tracking-widest mb-1 font-body truncate">
                      {entry.prompt}
                    </p>
                  )}
                  <p className="text-sm text-[#1A1410] font-body font-light line-clamp-2 leading-relaxed">
                    {entry.content}
                  </p>
                </div>
                <span className="text-[10px] text-[#6B6058] font-body flex-shrink-0 mt-0.5">
                  {formatDate(entry.created_at)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={startFree}
        className="fixed bottom-24 right-5 md:bottom-6 w-12 h-12 bg-[#221080] rounded-full flex items-center justify-center shadow-lg hover:bg-[#120850] transition-colors active:scale-95 z-30"
      >
        <Plus className="w-6 h-6 text-[#FDF8F2]" />
      </button>
    </div>
  )
}
