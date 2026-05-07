'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SajaLogo } from '@/components/ui/SajaLogo'
import toast from 'react-hot-toast'
import { Plus, X, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ────────────────────────────────────────────────────────────
type PhotoItem = { url: string; path: string; caption?: string }

type EmotionalCapacity = 'open' | 'selective' | 'light' | 'slow'

// ── Helpers ──────────────────────────────────────────────────────────
function calcAge(birthDate: string): number | null {
  if (!birthDate) return null
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

function getSunSign(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const m = d.getMonth() + 1
  const day = d.getDate()
  if ((m === 3 && day >= 21) || (m === 4 && day <= 19)) return '♈ Widder'
  if ((m === 4 && day >= 20) || (m === 5 && day <= 20)) return '♉ Stier'
  if ((m === 5 && day >= 21) || (m === 6 && day <= 20)) return '♊ Zwillinge'
  if ((m === 6 && day >= 21) || (m === 7 && day <= 22)) return '♋ Krebs'
  if ((m === 7 && day >= 23) || (m === 8 && day <= 22)) return '♌ Löwe'
  if ((m === 8 && day >= 23) || (m === 9 && day <= 22)) return '♍ Jungfrau'
  if ((m === 9 && day >= 23) || (m === 10 && day <= 22)) return '♎ Waage'
  if ((m === 10 && day >= 23) || (m === 11 && day <= 21)) return '♏ Skorpion'
  if ((m === 11 && day >= 22) || (m === 12 && day <= 21)) return '♐ Schütze'
  if ((m === 12 && day >= 22) || (m === 1 && day <= 19)) return '♑ Steinbock'
  if ((m === 1 && day >= 20) || (m === 2 && day <= 18)) return '♒ Wassermann'
  return '♓ Fische'
}


// ── Constants ─────────────────────────────────────────────────────────
const TOTAL_STEPS = 7

const INTENTION_OPTIONS = [
  { value: 'Ernsthafte Beziehung', emoji: '🌿', desc: 'Du suchst eine tiefe, langfristige Verbindung.' },
  { value: 'Freundschaft & mehr', emoji: '✨', desc: 'Erst kennenlernen, dann sehen was entsteht.' },
  { value: 'Bewusstes Dating', emoji: '🌊', desc: 'Begegnungen mit Intention — ohne Druck.' },
  { value: 'Offenes Erkunden', emoji: '🌸', desc: 'Offen für alles was sich stimmig anfühlt.' },
]

const CAPACITY_OPTIONS = [
  { value: 'open' as EmotionalCapacity, dot: '#7A9E8A', label: 'Offen für Tiefe & Nähe', desc: 'Bereit für echte Verbindung' },
  { value: 'selective' as EmotionalCapacity, dot: '#BFA76A', label: 'Selektiv & vorsichtig', desc: 'Tiefe braucht Vertrauen' },
  { value: 'light' as EmotionalCapacity, dot: '#3A5F8A', label: 'Gerade eher leicht & locker', desc: 'Kein Druck, kein Ernst' },
  { value: 'slow' as EmotionalCapacity, dot: '#A8654C', label: 'Slow Mode — wenig Kapazität', desc: 'Ich brauche gerade Zeit' },
]

const GENDER_OPTIONS = ['Frau', 'Mann', 'Non-binär', 'Trans Frau', 'Trans Mann', 'Genderfluid', 'Andere', 'Lieber nicht angeben']

// ── Progress bar ──────────────────────────────────────────────────────
function ProgressBar({ step }: { step: number }) {
  const pct = Math.round((step / TOTAL_STEPS) * 100)
  return (
    <div className="sticky top-0 z-20 px-5 pt-5 pb-3" style={{ background: '#EAE0D5', borderBottom: '0.5px solid rgba(44,26,14,0.08)' }}>
      <div className="max-w-lg mx-auto">
        <div className="h-0.5 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(44,26,14,0.10)' }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: '#6B7B5A' }} />
        </div>
        <p className="text-[11px] font-body" style={{ color: 'rgba(44,26,14,0.40)' }}>Schritt {step} von {TOTAL_STEPS} · ~5 Minuten</p>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════
export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [step, setStep] = useState(0)

  // Step 1: Basics
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [gender, setGender] = useState('')
  const [location, setLocation] = useState('')
  const [occupation, setOccupation] = useState('')
  const [heightCm, setHeightCm] = useState('')

  // Step 2: Fotos
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  // Step 3: Intention
  const [intention, setIntention] = useState('')

  // Step 4: Emotionale Kapazität
  const [capacity, setCapacity] = useState<EmotionalCapacity | null>(null)

  // Step 5: Was mich gerade bewegt
  const [currentMoment, setCurrentMoment] = useState('')

  // Step 6: Bio
  const [bio, setBio] = useState('')

  // ── Load user ──────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        // If already has phase >= 1, redirect to discover
        if ((data.onboarding_phase ?? 0) >= 1 && data.is_complete) {
          router.push('/discover')
          return
        }
        // Pre-fill if some data exists
        if (data.name) setName(data.name)
        if (data.birth_date) setBirthDate(data.birth_date)
        if (data.gender) setGender(data.gender)
        if (data.location) setLocation(data.location)
        if (data.occupation) setOccupation(data.occupation)
        if (data.height_cm) setHeightCm(String(data.height_cm))
        if (data.intention) setIntention(data.intention)
        if (data.emotional_capacity) setCapacity(data.emotional_capacity as EmotionalCapacity)
        if (data.current_moment) setCurrentMoment(data.current_moment)
        if (data.photos?.length) {
          const rawPhotos = data.photos as unknown[]
          setPhotos(rawPhotos.map((p: unknown) =>
            typeof p === 'string'
              ? { url: p as string, path: (p as string).split('/profile-photos/')[1] ?? (p as string) }
              : p as PhotoItem
          ))
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  // ── Photo upload ───────────────────────────────────────────────────
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!userId) return
    const file = e.target.files?.[0]
    if (!file) return
    if (photos.length >= 6) { toast.error('Maximal 6 Fotos'); return }
    setUploadingPhoto(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${userId}/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('profile-photos').upload(path, file)
      if (error) throw error
      const { data: urlData } = supabase.storage.from('profile-photos').getPublicUrl(path)
      setPhotos((prev) => [...prev, { url: urlData.publicUrl, path }])
    } catch {
      toast.error('Foto konnte nicht hochgeladen werden.')
    } finally {
      setUploadingPhoto(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function removePhoto(index: number) {
    const photo = photos[index]
    await supabase.storage.from('profile-photos').remove([photo.path])
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  // ── Save progress to Supabase ──────────────────────────────────────
  async function autoSave() {
    if (!userId) return
    await supabase.from('profiles').upsert({
      user_id: userId,
      name: name || null,
      birth_date: birthDate || null,
      age: birthDate ? calcAge(birthDate) : null,
      gender: gender || null,
      location: location || null,
      occupation: occupation || null,
      height_cm: heightCm ? parseInt(heightCm) : null,
      photos,
      intention: intention || null,
      emotional_capacity: capacity || null,
      current_moment: currentMoment || null,
    })
  }

  // ── Complete Phase 1 ───────────────────────────────────────────────
  async function completePhase1() {
    if (!userId) return
    setSaving(true)
    try {
      const age = birthDate ? calcAge(birthDate) : null
      await supabase.from('profiles').upsert({
        user_id: userId,
        name,
        birth_date: birthDate || null,
        age,
        sun_sign: birthDate ? getSunSign(birthDate) : null,
        gender: gender || null,
        location: location || null,
        occupation: occupation || null,
        height_cm: heightCm ? parseInt(heightCm) : null,
        photos,
        intention,
        emotional_capacity: capacity,
        current_moment: currentMoment || null,
        onboarding_phase: 1,
        is_complete: true,
        trial_started_at: new Date().toISOString(),
        trial_active: true,
      })
      localStorage.removeItem('saja_onboarding_progress')
      router.push('/discover')
    } catch {
      toast.error('Fehler beim Speichern. Bitte versuche es erneut.')
    } finally {
      setSaving(false)
    }
  }

  function next() {
    autoSave()
    setStep((s) => s + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function back() {
    setStep((s) => Math.max(0, s - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#EAE0D5' }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(44,26,14,0.12)', borderTopColor: '#6B7B5A' }} />
      </div>
    )
  }

  // ── Screen 0: Welcome ──────────────────────────────────────────────
  if (step === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: '#EAE0D5' }}>
        <SajaLogo size="lg" onDark={false} className="mb-10" />
        <h1 className="font-heading text-[40px] font-light text-[#2C1A0E] leading-tight mb-4">
          Willkommen bei Saja.
        </h1>
        <p className="font-body font-light text-base leading-relaxed max-w-sm mb-12" style={{ color: 'rgba(44,26,14,0.55)' }}>
          Echte Verbindungen beginnen mit Selbstkenntnis.
          Fünf Minuten — und du bist dabei.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button onClick={() => setStep(1)} className="btn-primary py-4 text-base">
            Los geht&apos;s →
          </button>
        </div>
        <p className="text-xs mt-10 font-body" style={{ color: 'rgba(44,26,14,0.25)' }}>Keine Kreditkarte · 14 Tage voller Zugang</p>
      </div>
    )
  }

  // ── Screen 1: Basics ──────────────────────────────────────────────
  if (step === 1) {
    const canContinue = name.trim().length >= 2 && birthDate && gender
    return (
      <div className="min-h-screen" style={{ background: '#EAE0D5' }}>
        <ProgressBar step={1} />
        <div className="max-w-lg mx-auto px-5 pt-8 pb-32">
          <h2 className="font-heading text-[38px] font-light text-[#2C1A0E] leading-tight mb-2">
            Erzähl uns von dir.
          </h2>
          <p className="font-body font-light text-sm mb-8" style={{ color: 'rgba(44,26,14,0.50)' }}>
            Nur was du teilen möchtest.
          </p>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="label">Dein Vorname</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Wie heißt du?"
                className="input"
              />
            </div>

            {/* Geburtsdatum */}
            <div>
              <label className="label">Geburtstag</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="input"
                max={new Date(Date.now() - 18 * 365.25 * 86400000).toISOString().split('T')[0]}
              />
            </div>

            {/* Geschlecht */}
            <div>
              <label className="label">Geschlecht</label>
              <div className="flex flex-wrap gap-2">
                {GENDER_OPTIONS.map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-body border transition-all',
                      gender === g
                        ? 'bg-[#6B7B5A] text-[#F2EBE2] border-[#6B7B5A]'
                        : 'bg-[#F2EBE2] border-[rgba(44,26,14,0.12)] text-[#9A8A7A]'
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Wohnort */}
            <div>
              <label className="label">Wohnort</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="z.B. München"
                className="input"
              />
            </div>

            {/* Beruf */}
            <div>
              <label className="label">Beruf <span className="opacity-50">(optional)</span></label>
              <input
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="Was machst du?"
                className="input"
              />
            </div>

            {/* Größe */}
            <div>
              <label className="label">Größe <span className="opacity-50">(optional)</span></label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                placeholder="in cm"
                min={140}
                max={220}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-4" style={{ background: 'linear-gradient(to top, #EAE0D5, transparent)' }}>
          <div className="max-w-lg mx-auto">
            <button onClick={next} disabled={!canContinue} className="btn-primary w-full py-4 disabled:opacity-40">
              Weiter →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Screen 2: Fotos ───────────────────────────────────────────────
  if (step === 2) {
    return (
      <div className="min-h-screen" style={{ background: '#EAE0D5' }}>
        <ProgressBar step={2} />
        <div className="max-w-lg mx-auto px-5 pt-8 pb-32">
          <button onClick={back} className="flex items-center gap-1 mb-6 transition-colors text-[#9A8A7A] hover:text-[#2C1A0E]">
            <ChevronLeft className="w-4 h-4" /> Zurück
          </button>
          <h2 className="font-heading text-[38px] font-light text-[#2C1A0E] leading-tight mb-2">
            Zeig dich.
          </h2>
          <p className="font-body font-light text-sm mb-8" style={{ color: 'rgba(44,26,14,0.50)' }}>
            Mindestens ein Foto — damit Menschen dich sehen können.
          </p>

          {/* Photo grid */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {photos.map((photo, i) => (
              <div key={i} className="aspect-square rounded-2xl overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => removePhoto(i)}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center"
                >
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
                {i === 0 && (
                  <div className="absolute bottom-2 left-2 bg-[#6B7B5A]/80 rounded-full px-2 py-0.5 text-[10px] text-white">
                    Hauptfoto
                  </div>
                )}
              </div>
            ))}
            {photos.length < 6 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors"
                style={{ borderColor: 'rgba(44,26,14,0.18)' }}
              >
                {uploadingPhoto ? (
                  <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(44,26,14,0.15)', borderTopColor: '#6B7B5A' }} />
                ) : (
                  <>
                    <Plus className="w-6 h-6 text-[#9A8A7A]" />
                    <span className="text-[10px] font-body text-[#9A8A7A]">Foto</span>
                  </>
                )}
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <p className="text-xs font-body text-center" style={{ color: 'rgba(44,26,14,0.30)' }}>
            Bis zu 6 Fotos · Authentisch ist schöner als perfekt
          </p>
        </div>

        <div className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-4" style={{ background: 'linear-gradient(to top, #EAE0D5, transparent)' }}>
          <div className="max-w-lg mx-auto">
            <button onClick={next} disabled={photos.length === 0} className="btn-primary w-full py-4 disabled:opacity-40">
              Weiter →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Screen 3: Intention ────────────────────────────────────────────
  if (step === 3) {
    return (
      <div className="min-h-screen" style={{ background: '#EAE0D5' }}>
        <ProgressBar step={3} />
        <div className="max-w-lg mx-auto px-5 pt-8 pb-32">
          <button onClick={back} className="flex items-center gap-1 mb-6 transition-colors text-[#9A8A7A] hover:text-[#2C1A0E]">
            <ChevronLeft className="w-4 h-4" /> Zurück
          </button>
          <h2 className="font-heading text-[38px] font-light text-[#2C1A0E] leading-tight mb-2">
            Was suchst du gerade?
          </h2>
          <p className="font-body font-light text-sm mb-8" style={{ color: 'rgba(44,26,14,0.50)' }}>
            Ohne Erwartung — nur was wirklich stimmt.
          </p>

          <div className="space-y-3">
            {INTENTION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setIntention(opt.value)}
                className="w-full p-4 rounded-2xl border text-left transition-all"
                style={intention === opt.value
                  ? { borderColor: '#6B7B5A', background: 'rgba(107,123,90,0.08)' }
                  : { borderColor: 'rgba(44,26,14,0.12)', background: '#F2EBE2' }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{opt.emoji}</span>
                  <div>
                    <p className="font-body text-[#2C1A0E] font-normal">{opt.value}</p>
                    <p className="text-sm font-body font-light text-[#9A8A7A]">{opt.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-4" style={{ background: 'linear-gradient(to top, #EAE0D5, transparent)' }}>
          <div className="max-w-lg mx-auto">
            <button onClick={next} disabled={!intention} className="btn-primary w-full py-4 disabled:opacity-40">
              Weiter →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Screen 4: Emotionale Kapazität ────────────────────────────────
  if (step === 4) {
    return (
      <div className="min-h-screen" style={{ background: '#EAE0D5' }}>
        <ProgressBar step={4} />
        <div className="max-w-lg mx-auto px-5 pt-8 pb-32">
          <button onClick={back} className="flex items-center gap-1 mb-6 transition-colors text-[#9A8A7A] hover:text-[#2C1A0E]">
            <ChevronLeft className="w-4 h-4" /> Zurück
          </button>
          <h2 className="font-heading text-[38px] font-light text-[#2C1A0E] leading-tight mb-2">
            Wie bist du gerade?
          </h2>
          <p className="font-body font-light text-sm mb-8" style={{ color: 'rgba(44,26,14,0.50)' }}>
            Dein emotionaler Status — zeigt anderen was du gerade brauchst.
          </p>

          <div className="space-y-3">
            {CAPACITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setCapacity(opt.value)}
                className="w-full p-4 rounded-2xl border text-left transition-all flex items-center gap-4"
                style={capacity === opt.value
                  ? { borderColor: '#6B7B5A', background: 'rgba(107,123,90,0.08)' }
                  : { borderColor: 'rgba(44,26,14,0.12)', background: '#F2EBE2' }}
              >
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: opt.dot }} />
                <div>
                  <p className="font-body text-[#2C1A0E] font-normal">{opt.label}</p>
                  <p className="text-sm font-body font-light text-[#9A8A7A]">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-4" style={{ background: 'linear-gradient(to top, #EAE0D5, transparent)' }}>
          <div className="max-w-lg mx-auto">
            <button onClick={next} disabled={!capacity} className="btn-primary w-full py-4 disabled:opacity-40">
              Weiter →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Screen 5: Was mich gerade bewegt ─────────────────────────────
  if (step === 5) {
    return (
      <div className="min-h-screen" style={{ background: '#EAE0D5' }}>
        <ProgressBar step={5} />
        <div className="max-w-lg mx-auto px-5 pt-8 pb-32">
          <button onClick={back} className="flex items-center gap-1 mb-6 transition-colors text-[#9A8A7A] hover:text-[#2C1A0E]">
            <ChevronLeft className="w-4 h-4" /> Zurück
          </button>
          <h2 className="font-heading text-[38px] font-light text-[#2C1A0E] leading-tight mb-2">
            Was bewegt dich gerade?
          </h2>
          <p className="font-body font-light text-sm mb-8" style={{ color: 'rgba(44,26,14,0.50)' }}>
            Ein Gedanke, ein Thema, ein Gefühl — maximal 120 Zeichen.
          </p>

          <textarea
            value={currentMoment}
            onChange={(e) => setCurrentMoment(e.target.value.slice(0, 120))}
            placeholder="z.B. &ldquo;Ich lerne gerade loszulassen und mehr im Moment zu sein.&rdquo;"
            rows={4}
            className="input resize-none"
          />
          <div className="flex justify-between mt-2">
            <span className="text-xs font-body" style={{ color: 'rgba(44,26,14,0.30)' }}>Optional</span>
            <span className="text-xs font-body" style={{ color: 'rgba(44,26,14,0.30)' }}>{currentMoment.length}/120</span>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-4" style={{ background: 'linear-gradient(to top, #EAE0D5, transparent)' }}>
          <div className="max-w-lg mx-auto flex flex-col gap-3">
            <button onClick={next} className="btn-primary w-full py-4">
              Weiter →
            </button>
            {!currentMoment && (
              <button onClick={next} className="btn-ghost w-full py-3 text-sm">
                Überspringen
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Screen 6: Über mich (Bio) ─────────────────────────────────────
  if (step === 6) {
    return (
      <div className="min-h-screen" style={{ background: '#EAE0D5' }}>
        <ProgressBar step={6} />
        <div className="max-w-lg mx-auto px-5 pt-8 pb-32">
          <button onClick={back} className="flex items-center gap-1 mb-6 transition-colors text-[#9A8A7A] hover:text-[#2C1A0E]">
            <ChevronLeft className="w-4 h-4" /> Zurück
          </button>
          <h2 className="font-heading text-[38px] font-light text-[#2C1A0E] leading-tight mb-2">
            Wer bist du?
          </h2>
          <p className="font-body font-light text-sm mb-8" style={{ color: 'rgba(44,26,14,0.50)' }}>
            Kurz in eigenen Worten — optional aber wirkungsvoll.
          </p>

          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 400))}
            placeholder="Was sollen Menschen über dich wissen?"
            rows={5}
            className="input resize-none"
          />
          <span className="text-xs font-body block text-right mt-1" style={{ color: 'rgba(44,26,14,0.30)' }}>{bio.length}/400</span>
        </div>

        <div className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-4" style={{ background: 'linear-gradient(to top, #EAE0D5, transparent)' }}>
          <div className="max-w-lg mx-auto flex flex-col gap-3">
            <button
              onClick={async () => {
                if (userId && bio.trim()) {
                  await supabase.from('profiles').update({ bio: bio.trim() }).eq('user_id', userId)
                }
                setStep(7)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="btn-primary w-full py-4"
            >
              Weiter →
            </button>
            {!bio && (
              <button onClick={() => { setStep(7); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="btn-ghost w-full py-3 text-sm">
                Überspringen
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Screen 7: Fertig ──────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: '#EAE0D5' }}>
      <div className="text-5xl mb-6 text-[#6B7B5A]">✦</div>
      <h2 className="font-heading text-[42px] font-light text-[#2C1A0E] leading-tight mb-4">
        Du bist dabei.
      </h2>
      <p className="font-body font-light text-base leading-relaxed max-w-sm mb-3" style={{ color: 'rgba(44,26,14,0.55)' }}>
        Entdecke erste Profile. Du kannst alles jederzeit anpassen.
      </p>
      <p className="font-body font-light text-sm max-w-sm mb-10" style={{ color: 'rgba(44,26,14,0.40)' }}>
        Dein kostenloser Vollzugang läuft 14 Tage. Keine Kreditkarte nötig.
      </p>
      <button
        onClick={completePhase1}
        disabled={saving}
        className="btn-primary px-10 py-4 text-base disabled:opacity-40"
      >
        {saving ? 'Einen Moment…' : 'Entdecken →'}
      </button>
    </div>
  )
}
