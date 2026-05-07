'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import {
  Edit, MapPin, Briefcase, Sparkles, Mic, Ruler, Heart, Play, Pause,
  Star, User, Bell, Shield, LogOut, ChevronRight, Moon, Check, Lock,
} from 'lucide-react'
import type { Profile, EmotionalCapacity } from '@/types'
import { photoUrl, calculateAge } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { getDailyAffirmation } from '@/lib/affirmations'

// ── Sub-components ────────────────────────────────────────────────────────────

function PersonalityBar({ leftLabel, rightLabel, value }: { leftLabel: string; rightLabel: string; value: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-[#6B6058]">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
      <div className="h-1.5 bg-[rgba(122,62,30,0.07)] rounded-full overflow-hidden">
        <div className="h-full bg-[#7A3E1E]/50 rounded-full" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function AudioPlayer({ url }: { url: string }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  function handleToggle() {
    const el = audioRef.current
    if (!el) return
    if (playing) { el.pause(); setPlaying(false) }
    else { el.play().catch(() => {}); setPlaying(true) }
  }
  return (
    <div className="flex items-center gap-3">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} src={url} onEnded={() => setPlaying(false)} preload="none" />
      <button
        onClick={handleToggle}
        className="w-10 h-10 rounded-full bg-[#7A3E1E] flex items-center justify-center shadow flex-shrink-0 hover:bg-[#4A2010] transition-colors active:scale-95"
      >
        {playing ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white translate-x-0.5" />}
      </button>
      <div className="flex-1">
        <p className="text-sm font-medium text-[#1A1410] mb-1">Sprach-Intro anhören</p>
        <div className="flex items-end gap-0.5 h-4">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i}
              className={`w-0.5 rounded-full transition-all ${playing ? 'bg-[#7A3E1E] animate-pulse' : 'bg-[#7A3E1E]/30'}`}
              style={{ height: `${28 + Math.sin(i * 0.85) * 48 + Math.cos(i * 1.3) * 18}%`, animationDelay: `${i * 50}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function PhotoWithCaption({ photo, name, height }: { photo: { url: string; path: string; caption?: string }; name: string; height: string }) {
  const url = photoUrl(photo)
  if (!url) return null
  return (
    <div className="mt-3">
      <div className="mx-3 rounded-3xl overflow-hidden shadow-sm" style={{ height }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={name} className="w-full h-full object-cover" />
      </div>
      {photo.caption && (
        <p className="px-5 pt-2.5 text-sm text-[#6B6058] italic leading-relaxed text-justify">{photo.caption}</p>
      )}
    </div>
  )
}

function PromptBlock({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="px-4 py-4 border-t border-[rgba(122,62,30,0.10)]">
      <div className="bg-[rgba(122,62,30,0.07)] rounded-xl px-4 py-4 border-l-[3px] border-[#7A3E1E]">
        <p className="text-[11px] text-[#6B6058] uppercase tracking-widest mb-2">{question}</p>
        <p className="font-heading text-xl italic text-[#4A2010] leading-snug text-justify">{answer}</p>
      </div>
    </div>
  )
}

// ── Settings items ────────────────────────────────────────────────────────────

const settingsItems = [
  { label: 'Konto', icon: User, href: '#' },
  { label: 'Benachrichtigungen', icon: Bell, href: '#' },
  { label: 'Abonnement', icon: Star, href: '/pricing' },
  { label: 'Datenschutz', icon: Shield, href: '/datenschutz' },
  { label: 'Impressum', icon: Shield, href: '/impressum' },
  { label: 'Abmelden', icon: LogOut, href: '#', danger: true },
]

// ── Phase progress circles ────────────────────────────────────────────────────

function PhaseCircles({ phase }: { phase: number }) {
  // Each phase gets a distinct aura color: Wurzel → Herz → Krone
  const phases = [
    { num: 1, label: 'Basis',      aura: '#C4603A' },  // Sakral — warm terracotta
    { num: 2, label: 'Vertiefung', aura: '#2D7A5F' },  // Herz — salbeigrün
    { num: 3, label: 'Tiefe',      aura: '#7B4FA6' },  // Krone — lavendel
  ]
  return (
    <div className="mx-4 mb-4 bg-white rounded-2xl border border-[rgba(122,62,30,0.08)] p-4">
      <p className="text-[9px] text-[#6B6058] uppercase tracking-[0.12em] font-body mb-3">Profiltiefe</p>
      <div className="flex items-center gap-0 mb-3">
        {phases.map((p, i) => {
          const done = phase >= p.num
          const active = phase === p.num
          return (
            <div key={p.num} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-body font-medium transition-all"
                  style={
                    done
                      ? { backgroundColor: p.aura, color: '#FDF5E8' }
                      : active
                      ? { border: `2px solid ${p.aura}`, color: p.aura }
                      : { border: '2px solid rgba(122,62,30,0.20)', color: '#A09888' }
                  }
                >
                  {done ? <Check className="w-3.5 h-3.5" /> : p.num}
                </div>
                <span
                  className="text-[9px] mt-1 font-body"
                  style={{ color: done ? p.aura : '#A09888' }}
                >{p.label}</span>
              </div>
              {i < phases.length - 1 && (
                <div
                  className="h-0.5 w-6 mx-1 rounded-full mb-4"
                  style={{ backgroundColor: phase > p.num ? p.aura : 'rgba(122,62,30,0.15)' }}
                />
              )}
            </div>
          )
        })}
      </div>
      <p className="text-[11px] text-[#6B6058] font-body">Je mehr du teilst, desto besser dein Matching.</p>
    </div>
  )
}

// ── Props ────────────────────────────────────────────────────────────────────

interface Props {
  profile: Profile
  tier: string
}

// ── Emotional Capacity config ─────────────────────────────────────────────────
const CAPACITY_OPTIONS: Array<{ value: EmotionalCapacity; dot: string; label: string; desc: string }> = [
  { value: 'open',      dot: '#2D7A5F', label: 'Offen für Tiefe & Nähe',     desc: 'Bereit für echte Verbindung' },
  { value: 'selective', dot: '#BF9B30', label: 'Selektiv & vorsichtig',       desc: 'Tiefe braucht Vertrauen' },
  { value: 'light',     dot: '#3A5F8A', label: 'Gerade eher leicht & locker', desc: 'Kein Druck, kein Ernst' },
  { value: 'slow',      dot: '#C4603A', label: 'Slow Mode — wenig Kapazität', desc: 'Ich brauche gerade Zeit' },
]

// ── Main component ────────────────────────────────────────────────────────────

export function ProfileSelfView({ profile, tier }: Props) {
  const supabase = createClient()
  const photos = profile.photos ?? []

  // ── Trial calculation ──
  const onboardingPhase = profile.onboarding_phase ?? 1
  const trialStarted = profile.trial_started_at ? new Date(profile.trial_started_at) : null
  const trialMs = trialStarted ? Date.now() - trialStarted.getTime() : Infinity
  const trialDaysLeft = trialStarted ? Math.max(0, 14 - Math.floor(trialMs / 86_400_000)) : 0
  const trialActive = (profile.trial_active ?? false) && trialDaysLeft > 0

  const [capacity, setCapacity]                       = useState<EmotionalCapacity | null>(profile.emotional_capacity ?? null)
  const [currentMoment, setCurrentMoment]             = useState(profile.current_moment ?? '')
  const [editingMoment, setEditingMoment]             = useState(false)
  const [momentDraft, setMomentDraft]                 = useState(profile.current_moment ?? '')
  const [paused, setPaused]                           = useState(profile.profile_paused ?? false)
  const [saving, setSaving]                           = useState(false)
  // Affirmation settings
  const [affirmEnabled, setAffirmEnabled]             = useState(profile.affirmations_enabled ?? true)
  const [affirmTime, setAffirmTime]                   = useState(profile.affirmation_time ?? '09:00')
  const [savingAffirm, setSavingAffirm]               = useState(false)

  async function saveCapacity(val: EmotionalCapacity) {
    setCapacity(val)
    await supabase.from('profiles').update({ emotional_capacity: val }).eq('user_id', profile.user_id)
  }

  async function saveMoment() {
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ current_moment: momentDraft.trim() || null })
      .eq('user_id', profile.user_id)
    if (!error) {
      setCurrentMoment(momentDraft.trim())
      setEditingMoment(false)
    } else {
      toast.error('Speichern fehlgeschlagen.')
    }
    setSaving(false)
  }

  async function togglePause() {
    const next = !paused
    setPaused(next)
    await supabase.from('profiles').update({
      profile_paused: next,
      paused_since: next ? new Date().toISOString() : null,
    }).eq('user_id', profile.user_id)
    toast.success(next ? 'Profil pausiert. 🌙' : 'Pause beendet — willkommen zurück.')
  }

  async function saveAffirmationSettings(enabled: boolean, time: string) {
    setSavingAffirm(true)
    await supabase.from('profiles').update({
      affirmations_enabled: enabled,
      affirmation_time: time,
    }).eq('user_id', profile.user_id)
    setSavingAffirm(false)
    toast.success('Affirmations-Einstellungen gespeichert.')
  }

  return (
    <div className="max-w-lg mx-auto pb-36">

      {/* Header with title + Bearbeiten button */}
      <div className="px-4 pt-5 pb-4 flex items-center justify-between">
        <h1 className="font-heading text-[52px] font-light text-[#1A1410] tracking-[-0.5px] leading-none">Mein Profil</h1>
        <Link
          href="/profile/edit"
          className="flex items-center gap-1.5 border border-[rgba(30,20,10,0.25)] text-[#1A1410] hover:bg-[rgba(30,20,10,0.06)] rounded-full text-xs py-1.5 px-3 font-body transition-colors duration-200"
        >
          <Edit className="w-3.5 h-3.5" /> Bearbeiten
        </Link>
      </div>

      {/* ── Trial banner ── */}
      {trialActive && (
        <div
          className="mx-4 mb-4 rounded-2xl px-4 py-3 flex items-center gap-3"
          style={{ background: 'var(--bg-indigo)' }}
        >
          <Sparkles className="w-4 h-4 text-[#FDF5E8]/70 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-[#FDF5E8] font-body text-sm">
              ✦ Du bist im Vollzugang —{' '}
              <span className="font-medium">noch {trialDaysLeft} {trialDaysLeft === 1 ? 'Tag' : 'Tage'}</span>
            </p>
          </div>
          <Link
            href="/paywall"
            className="text-[#FDF5E8]/70 text-[11px] font-body underline underline-offset-2 flex-shrink-0"
          >
            Upgrade
          </Link>
        </div>
      )}
      {!trialActive && profile.trial_started_at && (
        <div className="mx-4 mb-4 rounded-2xl px-4 py-3 flex items-center gap-3 bg-[rgba(26,20,16,0.06)] border border-[rgba(26,20,16,0.12)]">
          <Lock className="w-4 h-4 text-[#6B6058] flex-shrink-0" />
          <p className="text-[#1A1410] font-body text-sm flex-1">Dein Vollzugang ist abgelaufen.</p>
          <Link
            href="/paywall"
            className="text-[#7A3E1E] text-[11px] font-body font-medium flex-shrink-0"
          >
            Weiter →
          </Link>
        </div>
      )}

      {/* ── Phase progress circles ── */}
      <PhaseCircles phase={onboardingPhase} />

      {/* ── Emotionale Kapazität + Pause ── */}
      <div className="mx-4 mb-4 bg-white rounded-2xl border border-[rgba(30,20,10,0.08)] p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[9px] text-[#6B6058] uppercase tracking-[0.12em] font-body">Mein Status</p>
          <button
            onClick={togglePause}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-body transition-colors ${
              paused
                ? 'bg-[#7A3E1E] text-[#FDF5E8]'
                : 'bg-[#EDE8E0] text-[#1A1410] hover:bg-[rgba(30,20,10,0.12)]'
            }`}
          >
            <Moon className="w-3 h-3" />
            {paused ? 'Pause aktiv' : 'Pause einlegen'}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {CAPACITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => saveCapacity(opt.value)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all text-left ${
                capacity === opt.value
                  ? 'border-[#7A3E1E] bg-[#7A3E1E]'
                  : 'border-[rgba(30,20,10,0.12)] bg-[#EDE8E0] hover:bg-[rgba(30,20,10,0.08)]'
              }`}
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: opt.dot }} />
              <span className={`text-xs font-body font-light leading-snug ${capacity === opt.value ? 'text-[#FDF5E8]' : 'text-[#1A1410]'}`}>
                {opt.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Foto 1 — groß, mit Name-Overlay ── */}
      <div className="mx-3 rounded-3xl overflow-hidden shadow-md relative" style={{ height: '78vh' }}>
        {photoUrl(photos[0]) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl(photos[0])} alt={profile.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-[rgba(122,62,30,0.07)] flex items-center justify-center">
            <span className="font-heading text-8xl text-[#6B6058]">{profile.name?.[0]}</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-52 bg-gradient-to-t from-[rgba(74,32,16,0.88)] to-transparent pointer-events-none" />
        <div className="absolute bottom-5 left-5 text-white">
          <h2 className="font-heading text-4xl drop-shadow">
            {profile.name}{!profile.hide_age && profile.birth_date ? `, ${calculateAge(profile.birth_date)}` : !profile.hide_age && profile.age ? `, ${profile.age}` : ''}
          </h2>
          {!profile.hide_location && profile.location && (
            <div className="flex items-center gap-1.5 text-white/75 text-sm mt-1">
              <MapPin className="w-3.5 h-3.5" />
              {profile.location}
            </div>
          )}
        </div>
      </div>

      {/* ── Was mich gerade bewegt ── */}
      <div className="px-5 py-5 border-t border-[rgba(122,62,30,0.08)]">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] text-[#6B6058] uppercase tracking-widest">Was mich gerade bewegt</p>
          {!editingMoment && (
            <button
              onClick={() => { setMomentDraft(currentMoment); setEditingMoment(true) }}
              className="text-[10px] text-[#6B6058] hover:text-[#1A1410] transition-colors underline underline-offset-2"
            >
              {currentMoment ? 'ändern' : 'hinzufügen'}
            </button>
          )}
        </div>
        {editingMoment ? (
          <div>
            <textarea
              value={momentDraft}
              onChange={(e) => setMomentDraft(e.target.value.slice(0, 120))}
              placeholder="Ein Gedanke, ein Gefühl, ein Thema das dich gerade begleitet..."
              className="w-full px-4 py-3 rounded-xl border border-[rgba(122,62,30,0.15)] bg-white text-[#1A1410] text-sm font-body font-light resize-none focus:outline-none focus:border-[#7A3E1E]/40 placeholder:text-[#6B6058]"
              rows={3}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-[#6B6058]">{momentDraft.length}/120</span>
              <div className="flex gap-2">
                <button onClick={() => setEditingMoment(false)} className="text-xs text-[#6B6058] hover:text-[#1A1410] px-3 py-1.5 transition-colors">
                  Abbrechen
                </button>
                <button
                  onClick={saveMoment}
                  disabled={saving}
                  className="flex items-center gap-1 text-xs bg-[#7A3E1E] text-[#FDF5E8] px-4 py-1.5 rounded-full hover:bg-[#4A2010] transition-colors disabled:opacity-50"
                >
                  <Check className="w-3 h-3" /> Speichern
                </button>
              </div>
            </div>
          </div>
        ) : currentMoment ? (
          <p className="font-heading text-lg italic text-[#1A1410] leading-snug">
            &ldquo;{currentMoment}&rdquo;
          </p>
        ) : (
          <p className="text-sm text-[#6B6058] italic font-body">
            Noch nichts eingetragen — was begleitet dich gerade?
          </p>
        )}
      </div>

      {/* ── Quick-info pills ── */}
      <div className="px-5 pt-5 pb-1 flex flex-wrap gap-2">
        {profile.height_cm && (
          <span className="flex items-center gap-1.5 text-sm text-[#6B6058] bg-[rgba(122,62,30,0.07)] px-3 py-1.5 rounded-full">
            <Ruler className="w-3.5 h-3.5" />{profile.height_cm} cm
          </span>
        )}
        {profile.occupation && (
          <span className="flex items-center gap-1.5 text-sm text-[#6B6058] bg-[rgba(122,62,30,0.07)] px-3 py-1.5 rounded-full">
            <Briefcase className="w-3.5 h-3.5" />{profile.occupation}
          </span>
        )}
        {profile.intention && (
          <span className="flex items-center gap-1.5 text-sm text-[#1A1410] bg-[rgba(122,62,30,0.07)] px-3 py-1.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />{profile.intention}
          </span>
        )}
        {profile.has_children && (
          <span className="text-sm text-[#6B6058] bg-[rgba(122,62,30,0.07)] px-3 py-1.5 rounded-full">{profile.has_children}</span>
        )}
      </div>

      {/* ── Über mich ── */}
      {profile.bio && (
        <div className="px-5 py-5 border-t border-[rgba(122,62,30,0.10)]">
          <p className="text-[11px] text-[#6B6058] uppercase tracking-widest mb-3">Über mich</p>
          <p className="text-[#1A1410] text-sm leading-relaxed text-justify">{profile.bio}</p>
        </div>
      )}

      {/* ── Sprachmemo ── */}
      {profile.audio_prompt_url ? (
        <div className="px-5 py-5 border-t border-[rgba(122,62,30,0.10)]">
          <p className="text-[11px] text-[#6B6058] uppercase tracking-widest mb-3">Sprachmemo</p>
          <AudioPlayer url={profile.audio_prompt_url} />
        </div>
      ) : (
        <div className="px-5 py-5 border-t border-[rgba(122,62,30,0.10)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[rgba(122,62,30,0.07)] flex items-center justify-center flex-shrink-0">
            <Mic className="w-5 h-5 text-[#1A1410]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-[#1A1410] mb-1.5">Sprachmemo</p>
            <div className="flex items-center gap-0.5 h-5">
              {Array.from({ length: 26 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-[#7A3E1E]/25 rounded-full"
                  style={{ height: `${30 + Math.sin(i * 0.9) * 50 + Math.cos(i * 1.4) * 20}%` }}
                />
              ))}
            </div>
          </div>
          <span className="text-xs text-[#6B6058] flex-shrink-0">Noch nicht aufgenommen</span>
        </div>
      )}

      {/* ── Interessen ── */}
      {profile.interests?.length > 0 && (
        <div className="px-5 py-5 border-t border-[rgba(122,62,30,0.10)]">
          <p className="text-[11px] text-[#6B6058] uppercase tracking-widest mb-3">Interessen</p>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((item) => (
              <span key={item} className="text-sm text-[#6B6058] bg-[rgba(122,62,30,0.07)] px-3 py-1.5 rounded-full">{item}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── Werte ── */}
      {profile.werte?.length > 0 && (
        <div className="px-5 py-5 border-t border-[rgba(122,62,30,0.10)]">
          <p className="text-[11px] text-[#6B6058] uppercase tracking-widest mb-3">Werte</p>
          <div className="flex flex-wrap gap-2">
            {profile.werte.map((w) => (
              <span key={w} className="text-sm text-[#1A1410] bg-[rgba(122,62,30,0.07)] px-3 py-1.5 rounded-full">{w}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── Meine Welt ── */}
      {(profile.my_world?.length ?? 0) > 0 && (
        <div className="px-5 py-5 border-t border-[rgba(122,62,30,0.10)]">
          <p className="text-[11px] text-[#6B6058] uppercase tracking-widest mb-3">Meine Welt</p>
          <div className="flex flex-wrap gap-2">
            {profile.my_world!.map((item) => (
              <span
                key={item}
                className="text-[11px] font-body font-light px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(122,62,30,0.08)', color: '#1A1410' }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Meine Communities ── */}
      {(profile.communities?.length ?? 0) > 0 && (
        <div className="px-5 py-5 border-t border-[rgba(122,62,30,0.10)]">
          <p className="text-[11px] text-[#6B6058] uppercase tracking-widest mb-3">Meine Communities</p>
          <div className="flex flex-wrap gap-2">
            {profile.communities!.map((c) => (
              <span key={c} className="text-[12px] font-body px-3 py-1.5 rounded-full border border-[rgba(122,62,30,0.30)] text-[#1A1410] bg-[rgba(122,62,30,0.08)]">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Beziehung & Bindung ── */}
      {(profile.relationship_model || profile.bindungstyp || profile.love_language) && (
        <div className="px-5 py-5 border-t border-[rgba(122,62,30,0.10)] space-y-4">
          <p className="text-[11px] text-[#6B6058] uppercase tracking-widest">Beziehung &amp; Bindung</p>
          {profile.relationship_model && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#6B6058]">Beziehungsmodell</span>
              <span className="text-sm text-[#1A1410] font-medium">{profile.relationship_model}</span>
            </div>
          )}
          {profile.bindungstyp && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#6B6058]">Bindungstyp</span>
              <span className="text-sm text-[#1A1410] font-medium">{profile.bindungstyp}</span>
            </div>
          )}
          {profile.love_language && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#6B6058]">Love Language</span>
              <span className="text-sm text-[#1A1410] font-medium flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-[#1A1410]" />{profile.love_language}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Persönlichkeit ── */}
      {(profile.introvert_extrovert != null || profile.spontan_strukturiert != null || profile.rational_emotional != null) && (
        <div className="px-5 py-5 border-t border-[rgba(122,62,30,0.10)] space-y-4">
          <p className="text-[11px] text-[#6B6058] uppercase tracking-widest">Persönlichkeit</p>
          {profile.introvert_extrovert != null && (
            <PersonalityBar leftLabel="Introvertiert" rightLabel="Extrovertiert" value={profile.introvert_extrovert} />
          )}
          {profile.spontan_strukturiert != null && (
            <PersonalityBar leftLabel="Spontan" rightLabel="Strukturiert" value={profile.spontan_strukturiert} />
          )}
          {profile.rational_emotional != null && (
            <PersonalityBar leftLabel="Rational" rightLabel="Emotional" value={profile.rational_emotional} />
          )}
        </div>
      )}

      {/* ── Horoskop ── */}
      {(profile.sun_sign || profile.ascendant || profile.chinese_zodiac) && (
        <div className="px-5 py-5 border-t border-[rgba(122,62,30,0.10)] space-y-3">
          <p className="text-[11px] text-[#6B6058] uppercase tracking-widest">Horoskop</p>
          <div className="flex flex-wrap gap-2">
            {profile.sun_sign && (
              <span className="rounded-full text-[11px] px-3 py-1.5 font-body font-light" style={{ background: 'rgba(122,62,30,0.08)', color: '#1A1410' }}>
                {profile.sun_sign}
              </span>
            )}
            {profile.ascendant && (
              <span className="rounded-full text-[11px] px-3 py-1.5 font-body font-light" style={{ background: 'rgba(122,62,30,0.08)', color: '#1A1410' }}>
                ↑ {profile.ascendant.replace(/^[♈♉♊♋♌♍♎♏♐♑♒♓]\s*/, '')}
              </span>
            )}
            {profile.chinese_zodiac && (
              <span className="rounded-full text-[11px] px-3 py-1.5 font-body font-light" style={{ background: 'rgba(122,62,30,0.10)', color: '#A05830' }}>
                {profile.chinese_zodiac}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Dealbreakers ── */}
      {profile.dealbreakers?.length > 0 && (
        <div className="px-5 py-5 border-t border-[rgba(122,62,30,0.10)]">
          <p className="text-[11px] text-[#6B6058] uppercase tracking-widest mb-3">Dealbreaker</p>
          <div className="flex flex-wrap gap-2">
            {profile.dealbreakers.map((d) => (
              <span key={d} className="text-sm text-red-700/80 bg-red-50 border border-red-200/60 px-3 py-1.5 rounded-full">{d}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── Intimität ── */}
      {profile.sexuality_visible && (profile.sexuality_interests?.length ?? 0) > 0 && (
        <div className="px-5 py-5 border-t border-[rgba(122,62,30,0.10)]">
          <p className="text-[11px] text-[#6B6058] uppercase tracking-widest mb-3">Intimität</p>
          <div className="flex flex-wrap gap-2">
            {profile.sexuality_interests!.map((item) => (
              <span key={item} className="text-sm text-[#6B6058] bg-[rgba(122,62,30,0.07)] px-3 py-1.5 rounded-full">{item}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── Interleaved: Foto 2–6 + Prompts ── */}
      {photos[1] && <PhotoWithCaption photo={photos[1]} name={profile.name} height="62vh" />}
      {profile.prompts?.[0]?.answer && (
        <PromptBlock question={profile.prompts[0].question} answer={profile.prompts[0].answer} />
      )}

      {photos[2] && <PhotoWithCaption photo={photos[2]} name={profile.name} height="62vh" />}
      {profile.prompts?.[1]?.answer && (
        <PromptBlock question={profile.prompts[1].question} answer={profile.prompts[1].answer} />
      )}

      {photos[3] && <PhotoWithCaption photo={photos[3]} name={profile.name} height="62vh" />}
      {profile.prompts?.[2]?.answer && (
        <PromptBlock question={profile.prompts[2].question} answer={profile.prompts[2].answer} />
      )}

      {photos[4] && <PhotoWithCaption photo={photos[4]} name={profile.name} height="62vh" />}
      {photos[5] && <PhotoWithCaption photo={photos[5]} name={profile.name} height="62vh" />}

      {/* ── Phase 3: Vollständiges Profil badge OR invitation ── */}
      {onboardingPhase >= 3 ? (
        <div className="mx-4 mt-6 flex items-center gap-3 px-4 py-3 rounded-2xl bg-[rgba(122,62,30,0.06)] border border-[#7A3E1E]/20">
          <Sparkles className="w-4 h-4 text-[#7A3E1E] flex-shrink-0" />
          <p className="text-[#7A3E1E] font-body text-sm font-medium">Vollständiges Profil ✦</p>
        </div>
      ) : (
        <div
          className="mx-4 mt-6 rounded-2xl p-5"
          style={{ background: 'var(--bg-indigo)' }}
        >
          <p className="text-[#FDF5E8]/60 font-body text-[10px] uppercase tracking-[0.12em] mb-2">Für echte Verbindung</p>
          <p className="font-heading text-[22px] text-[#FDF5E8] leading-snug mb-1">Geh tiefer.</p>
          <p className="text-[#FDF5E8]/70 font-body text-sm leading-relaxed mb-4">
            Bindungstyp, Love Language, Dealbreaker, Intimität, Beziehungsmodell, Horoskop —
            für Menschen, die wirklich gesehen werden wollen.
          </p>
          <div className="grid grid-cols-3 gap-2 mb-5">
            {[
              { label: 'Bindungstyp', done: !!profile.bindungstyp },
              { label: 'Love Language', done: !!profile.love_language },
              { label: 'Beziehungsmodell', done: !!profile.relationship_model },
              { label: 'Horoskop', done: !!(profile.sun_sign || profile.ascendant) },
              { label: 'Dealbreaker', done: (profile.dealbreakers?.length ?? 0) > 0 },
              { label: 'Intimität', done: (profile.sexuality_interests?.length ?? 0) > 0 },
            ].map((item) => (
              <div
                key={item.label}
                className={`rounded-xl px-2 py-2 text-center flex flex-col items-center gap-1 ${
                  item.done ? 'bg-[rgba(253,245,232,0.20)]' : 'bg-[rgba(253,245,232,0.06)] border border-[rgba(253,245,232,0.12)]'
                }`}
              >
                <span className="text-sm">{item.done ? '✓' : '·'}</span>
                <span className={`text-[10px] font-body leading-tight ${item.done ? 'text-[#FDF5E8]' : 'text-[#FDF5E8]/50'}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
          <Link
            href="/profile/edit?phase=3"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-[#FDF5E8] text-[#7A3E1E] font-body text-[13px] font-medium transition-opacity hover:opacity-90"
          >
            Jetzt vertiefen →
          </Link>
        </div>
      )}

      {/* ── Upgrade-Banner (nur wenn nicht Premium) ── */}
      {tier !== 'premium' && (
        <div className="mx-4 mt-6 bg-[#4A2010] rounded-2xl p-6 text-[#EDE8F8]">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-5 h-5 text-[#1A1410]" />
            <span className="font-heading text-xl">Premium freischalten</span>
          </div>
          <p className="text-[#EDE8F8]/60 text-sm mb-4 leading-relaxed text-justify">
            Love Language Test, 36 Fragen, 50 Tiefen-Fragen, Kompatibilitäts-Score und mehr.
          </p>
          <Link href="/pricing" className="btn-primary text-sm py-2.5 inline-block">
            Upgrade — Preise folgen
          </Link>
        </div>
      )}

      {/* ── Meine Affirmationen ── */}
      <div className="mx-4 mt-6 bg-white rounded-2xl border border-[rgba(122,62,30,0.12)] p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[#C08080]">✦</span>
          <h3 className="font-heading text-xl text-[#1A1410]">Meine Affirmationen</h3>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-between py-3 border-b border-[rgba(122,62,30,0.08)]">
          <div>
            <p className="text-sm text-[#1A1410] font-body">Tägliche Affirmation</p>
            <p className="text-xs text-[#A09888] mt-0.5">Jeden Morgen eine Affirmation erhalten</p>
          </div>
          <button
            onClick={async () => {
              const next = !affirmEnabled
              setAffirmEnabled(next)
              await saveAffirmationSettings(next, affirmTime)
            }}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
              affirmEnabled ? 'bg-[#C08080]' : 'bg-[rgba(122,62,30,0.15)]'
            }`}
            aria-label="Affirmationen ein/aus"
          >
            <span
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                affirmEnabled ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* Time picker */}
        {affirmEnabled && (
          <div className="flex items-center justify-between py-3 border-b border-[rgba(122,62,30,0.08)]">
            <div>
              <p className="text-sm text-[#1A1410] font-body">Uhrzeit</p>
              <p className="text-xs text-[#A09888] mt-0.5">Wann möchtest du deine Affirmation?</p>
            </div>
            <input
              type="time"
              value={affirmTime}
              onChange={(e) => setAffirmTime(e.target.value)}
              onBlur={() => saveAffirmationSettings(affirmEnabled, affirmTime)}
              className="text-sm text-[#7A3E1E] font-body bg-transparent border-b border-[rgba(122,62,30,0.3)] focus:outline-none focus:border-[#7A3E1E] text-right"
            />
          </div>
        )}

        {/* Today's affirmation preview */}
        <div className="pt-3">
          <p className="text-[11px] uppercase tracking-wider text-[#A09888] mb-2">Heutige Affirmation</p>
          <p className="font-heading text-[16px] italic text-[#4A2010] leading-snug">
            &ldquo;{getDailyAffirmation().content}&rdquo;
          </p>
        </div>
      </div>

      {/* ── Einstellungen ── */}
      <div className="mx-4 mt-6 bg-white rounded-2xl border border-[rgba(122,62,30,0.12)] p-6 mb-8">
        <h3 className="font-heading text-xl text-[#1A1410] mb-4">Einstellungen</h3>
        <div className="space-y-1">
          {settingsItems.map(({ label, icon: Icon, href, danger }) => (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-3 py-3 px-1 rounded-xl transition-colors hover:bg-[#7A3E1E] text-sm font-body ${
                danger ? 'text-red-400' : 'text-[#6B6058]'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              <ChevronRight className="w-4 h-4 text-[#EDE8E0]" />
            </Link>
          ))}
        </div>
      </div>

    </div>
  )
}


