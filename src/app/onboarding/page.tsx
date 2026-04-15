'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Upload, X, Eye, MapPin, Briefcase } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import type { Gender, Orientation, Bindungstyp, LoveLanguage } from '@/types'
import { cn } from '@/lib/utils'
import { SajaLogo } from '@/components/ui/SajaLogo'

const TOTAL_STEPS = 6

const INTERESTS_OPTIONS = [
  'Meditation', 'Yoga', 'Tantra', 'Atemarbeit', 'Natur', 'Wandern', 'Reisen',
  'Musik', 'Kunst', 'Kochen', 'Lesen', 'Tanzen', 'Massage', 'Heilarbeit',
  'Psychologie', 'Philosophie', 'Spiritualität', 'Bewegung', 'Kreatives Schreiben',
]
const WERTE_OPTIONS = [
  'Ehrlichkeit', 'Bewusstsein', 'Wachstum', 'Tiefe', 'Freiheit', 'Sicherheit',
  'Verbindung', 'Authentizität', 'Mitgefühl', 'Kreativität', 'Spiritualität',
  'Familie', 'Abenteuer', 'Stille', 'Gemeinschaft', 'Humor',
]
const RELATIONSHIP_MODELS = [
  'Monogamie', 'Offene Beziehung', 'Polyamorie', 'Ich bin offen für verschiedenes', 'Noch nicht festgelegt',
]

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showPreview, setShowPreview] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Step 1
  const [photos, setPhotos] = useState<string[]>([])
  const [quote, setQuote] = useState('')
  // Step 2
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [location, setLocation] = useState('')
  const [origin, setOrigin] = useState('')
  const [gender, setGender] = useState<Gender | ''>('')
  const [orientation, setOrientation] = useState<Orientation | ''>('')
  const [seeking, setSeeking] = useState<string[]>([])
  const [languages, setLanguages] = useState('')
  const [hasChildren, setHasChildren] = useState('')
  // Step 3
  const [bio, setBio] = useState('')
  const [notCompatible, setNotCompatible] = useState('')
  const [occupation, setOccupation] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  // Step 4
  const [bindungstyp, setBindungstyp] = useState<Bindungstyp | ''>('')
  const [loveLanguage, setLoveLanguage] = useState<LoveLanguage | ''>('')
  const [werte, setWerte] = useState<string[]>([])
  const [sliderIE, setSliderIE] = useState(50)
  const [sliderSS, setSliderSS] = useState(50)
  const [sliderRE, setSliderRE] = useState(50)
  // Step 5
  const [intention, setIntention] = useState('')
  const [relationshipModel, setRelationshipModel] = useState('')
  const [intentionText, setIntentionText] = useState('')
  // Step 6
  const [sexualInterests, setSexualInterests] = useState<string[]>([])
  const [hideAge, setHideAge] = useState(false)
  const [hideLocation, setHideLocation] = useState(false)
  const [profilePaused, setProfilePaused] = useState(false)

  // ── Vorhandenes Profil laden ──────────────────────────────────────────────
  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data: p } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (p) {
        setPhotos(p.photos ?? [])
        setQuote(p.profile_quote ?? '')
        setName(p.name ?? '')
        setAge(p.age ? String(p.age) : '')
        setLocation(p.location ?? '')
        setOrigin(p.origin ?? '')
        setGender(p.gender ?? '')
        setOrientation(p.orientation ?? '')
        setSeeking(p.seeking ?? [])
        setLanguages(p.languages?.join(', ') ?? '')
        setHasChildren(p.has_children ?? '')
        setBio(p.bio ?? '')
        setNotCompatible(p.not_compatible_with ?? '')
        setOccupation(p.occupation ?? '')
        setInterests(p.interests ?? [])
        setBindungstyp(p.bindungstyp ?? '')
        setLoveLanguage(p.love_language ?? '')
        setWerte(p.werte ?? [])
        setSliderIE(p.introvert_extrovert ?? 50)
        setSliderSS(p.spontan_strukturiert ?? 50)
        setSliderRE(p.rational_emotional ?? 50)
        setIntention(p.intention ?? '')
        setRelationshipModel(p.relationship_model ?? '')
        setIntentionText(p.intention_text ?? '')
        setSexualInterests(p.sexual_interests ?? [])
        setHideAge(p.hide_age ?? false)
        setHideLocation(p.hide_location ?? false)
        setProfilePaused(p.profile_paused ?? false)
      }
      setLoading(false)
    }
    loadProfile()
  }, [])

  function toggleChip<T extends string>(val: T, list: T[], setter: (v: T[]) => void) {
    setter(list.includes(val) ? list.filter((i) => i !== val) : [...list, val])
  }

  // ── Auto-Save beim Weiter ─────────────────────────────────────────────────
  async function saveStep() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').upsert({
      user_id: user.id,
      name: name || null,
      age: age ? parseInt(age) : null,
      location: location || null,
      origin: origin || null,
      gender: gender || null,
      orientation: orientation || null,
      seeking,
      languages: languages.split(',').map((l) => l.trim()).filter(Boolean),
      has_children: hasChildren || null,
      bio: bio || null,
      not_compatible_with: notCompatible || null,
      occupation: occupation || null,
      interests,
      bindungstyp: bindungstyp || null,
      love_language: loveLanguage || null,
      werte,
      introvert_extrovert: sliderIE,
      spontan_strukturiert: sliderSS,
      rational_emotional: sliderRE,
      intention: intention || null,
      relationship_model: relationshipModel || null,
      intention_text: intentionText || null,
      sexual_interests: sexualInterests.length > 0 ? sexualInterests : null,
      hide_age: hideAge,
      hide_location: hideLocation,
      profile_paused: profilePaused,
      photos,
      profile_quote: quote || null,
      is_complete: false,
    }, { onConflict: 'user_id' })
  }

  async function handleNext() {
    if (step === 2 && !name) { toast.error('Bitte gib deinen Namen ein.'); return }
    await saveStep()
    setStep(step + 1)
  }

  // ── Foto Upload ───────────────────────────────────────────────────────────
  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (photos.length >= 6) { toast.error('Maximal 6 Fotos erlaubt.'); return }

    setUploadingPhoto(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setUploadingPhoto(false); return }

    const ext = file.name.split('.').pop()
    const path = `${user.id}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      toast.error('Upload fehlgeschlagen. Bitte Supabase Storage Bucket "profile-photos" anlegen.')
      setUploadingPhoto(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(path)

    setPhotos((prev) => [...prev, publicUrl])
    toast.success('Foto hochgeladen!')
    setUploadingPhoto(false)
  }

  async function removePhoto(url: string) {
    setPhotos((prev) => prev.filter((p) => p !== url))
  }

  // ── Profil speichern (finaler Schritt) ────────────────────────────────────
  async function handleFinish() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('Nicht eingeloggt.'); setSaving(false); return }

    const { error } = await supabase.from('profiles').upsert({
      user_id: user.id,
      name, age: age ? parseInt(age) : null,
      location: location || null, origin: origin || null,
      gender: gender || null, orientation: orientation || null,
      seeking, languages: languages.split(',').map((l) => l.trim()).filter(Boolean),
      has_children: hasChildren || null, bio: bio || null,
      not_compatible_with: notCompatible || null, occupation: occupation || null,
      interests, bindungstyp: bindungstyp || null, love_language: loveLanguage || null,
      werte, introvert_extrovert: sliderIE, spontan_strukturiert: sliderSS, rational_emotional: sliderRE,
      intention: intention || null, relationship_model: relationshipModel || null,
      intention_text: intentionText || null,
      sexual_interests: sexualInterests.length > 0 ? sexualInterests : null,
      hide_age: hideAge, hide_location: hideLocation, profile_paused: profilePaused,
      photos, profile_quote: quote || null, is_complete: true,
    }, { onConflict: 'user_id' })

    if (error) { toast.error('Fehler: ' + error.message) }
    else { toast.success('Profil gespeichert!'); router.push('/discover') }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-sand">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <SajaLogo size="sm" />
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-1.5 text-sm text-primary hover:text-dark transition-colors font-medium"
            >
              <Eye className="w-4 h-4" />
              Vorschau
            </button>
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div key={i} className={cn('h-1 flex-1 rounded-full transition-all duration-300', i + 1 <= step ? 'bg-primary' : 'bg-sand')} />
            ))}
          </div>
          <p className="text-xs text-text/40 mt-2">Schritt {step} von {TOTAL_STEPS} — wird automatisch gespeichert</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* ── STEP 1: Fotos ── */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-heading text-4xl text-dark mb-2">Fotos & Zitat</h2>
              <p className="text-text/50">Dein erster Eindruck — authentisch und einladend.</p>
            </div>

            <div>
              <label className="label">Fotos (bis zu 6)</label>
              <div className="grid grid-cols-3 gap-3">
                {photos.map((url, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removePhoto(url)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-1.5 left-1.5 text-[10px] bg-black/50 text-white px-1.5 py-0.5 rounded-full">
                        Haupt
                      </span>
                    )}
                  </div>
                ))}
                {photos.length < 6 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="aspect-square rounded-xl border-2 border-dashed border-sand bg-white flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary transition-colors"
                  >
                    {uploadingPhoto ? (
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-text/30" />
                        <span className="text-xs text-text/30">Foto</span>
                      </>
                    )}
                  </button>
                )}
                {/* Leere Platzhalter */}
                {Array.from({ length: Math.max(0, 5 - photos.length) }, (_, i) => (
                  <div key={`empty-${i}`} className="aspect-square rounded-xl border-2 border-dashed border-sand/50 bg-white/50" />
                ))}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              <p className="text-xs text-text/40 mt-2">JPG, PNG, WebP — max. 5 MB pro Foto</p>
            </div>

            <div>
              <label className="label">Profil-Zitat</label>
              <textarea
                className="input min-h-[80px] resize-none"
                placeholder="Ein Satz, der dich beschreibt…"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                maxLength={200}
              />
              <p className="text-xs text-text/40 mt-1 text-right">{quote.length}/200</p>
            </div>
          </div>
        )}

        {/* ── STEP 2: Basis ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-heading text-4xl text-dark mb-2">Basis-Informationen</h2>
              <p className="text-text/50">Lass andere wissen, wer du bist.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Vorname *</label>
                <input className="input" placeholder="Dein Name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="label">Alter</label>
                <input className="input" type="number" placeholder="z.B. 32" value={age} onChange={(e) => setAge(e.target.value)} min="18" max="99" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Wohnort</label>
                <input className="input" placeholder="z.B. Wien" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
              <div>
                <label className="label">Herkunft</label>
                <input className="input" placeholder="z.B. Deutschland" value={origin} onChange={(e) => setOrigin(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label">Geschlecht</label>
              <div className="flex flex-wrap gap-2">
                {(['Frau', 'Mann', 'Non-binär', 'Trans Frau', 'Trans Mann', 'Genderfluid', 'Andere', 'Lieber nicht angeben'] as Gender[]).map((g) => (
                  <button key={g} type="button" onClick={() => setGender(g)} className={cn('chip', gender === g && 'chip-active')}>{g}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Sexuelle Orientierung</label>
              <div className="flex flex-wrap gap-2">
                {(['Hetero', 'Homo', 'Bi', 'Pan', 'Asexuell', 'Demisexuell', 'Queer', 'Lieber nicht angeben'] as Orientation[]).map((o) => (
                  <button key={o} type="button" onClick={() => setOrientation(o)} className={cn('chip', orientation === o && 'chip-active')}>{o}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Wen suchst du?</label>
              <div className="flex flex-wrap gap-2">
                {['Frau', 'Mann', 'Non-binär', 'Alle'].map((s) => (
                  <button key={s} type="button" onClick={() => toggleChip(s, seeking, setSeeking)} className={cn('chip', seeking.includes(s) && 'chip-active')}>{s}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Sprachen (kommagetrennt)</label>
                <input className="input" placeholder="Deutsch, Englisch" value={languages} onChange={(e) => setLanguages(e.target.value)} />
              </div>
              <div>
                <label className="label">Kinder</label>
                <select className="input" value={hasChildren} onChange={(e) => setHasChildren(e.target.value)}>
                  <option value="">Bitte wählen</option>
                  <option>Keine Kinder</option>
                  <option>Kinder (wohnen bei mir)</option>
                  <option>Kinder (wohnen nicht bei mir)</option>
                  <option>Möchte Kinder</option>
                  <option>Möchte keine Kinder</option>
                  <option>Offen</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: Über dich ── */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-heading text-4xl text-dark mb-2">Über dich</h2>
              <p className="text-text/50">Teile, was dich ausmacht.</p>
            </div>
            <div>
              <label className="label">Bio</label>
              <textarea className="input min-h-[120px] resize-none" placeholder="Wer bist du? Was bewegt dich?" value={bio} onChange={(e) => setBio(e.target.value)} maxLength={600} />
              <p className="text-xs text-text/40 mt-1 text-right">{bio.length}/600</p>
            </div>
            <div>
              <label className="label">Was passt nicht zu mir</label>
              <textarea className="input min-h-[80px] resize-none" placeholder="Ehrlichkeit schützt beide Seiten…" value={notCompatible} onChange={(e) => setNotCompatible(e.target.value)} maxLength={300} />
            </div>
            <div>
              <label className="label">Beruf / Tätigkeit</label>
              <input className="input" placeholder="z.B. Therapeutin, Lehrerin" value={occupation} onChange={(e) => setOccupation(e.target.value)} />
            </div>
            <div>
              <label className="label">Interessen</label>
              <div className="flex flex-wrap gap-2">
                {INTERESTS_OPTIONS.map((i) => (
                  <button key={i} type="button" onClick={() => toggleChip(i, interests, setInterests)} className={cn('chip', interests.includes(i) && 'chip-active')}>{i}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 4: Verbindungsstil ── */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-heading text-4xl text-dark mb-2">Verbindungsstil</h2>
              <p className="text-text/50">Wie liebst und verbindest du dich?</p>
            </div>
            <div>
              <label className="label">Bindungstyp</label>
              <div className="flex flex-col gap-2">
                {(['Sicher', 'Ängstlich-präoccupiert', 'Vermeidend-distanziert', 'Desorganisiert'] as Bindungstyp[]).map((b) => (
                  <button key={b} type="button" onClick={() => setBindungstyp(b)} className={cn('chip text-left', bindungstyp === b && 'chip-active')}>{b}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Love Language</label>
              <div className="flex flex-col gap-2">
                {(['Worte der Wertschätzung', 'Quality Time', 'Geschenke', 'Hilfsbereitschaft', 'Körperliche Berührung'] as LoveLanguage[]).map((l) => (
                  <button key={l} type="button" onClick={() => setLoveLanguage(l)} className={cn('chip text-left', loveLanguage === l && 'chip-active')}>{l}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Werte</label>
              <div className="flex flex-wrap gap-2">
                {WERTE_OPTIONS.map((w) => (
                  <button key={w} type="button" onClick={() => toggleChip(w, werte, setWerte)} className={cn('chip', werte.includes(w) && 'chip-active')}>{w}</button>
                ))}
              </div>
            </div>
            <div className="space-y-5">
              {[
                { label: 'Introvertiert ↔ Extravertiert', left: 'Introvertiert', right: 'Extravertiert', val: sliderIE, set: setSliderIE },
                { label: 'Spontan ↔ Strukturiert', left: 'Spontan', right: 'Strukturiert', val: sliderSS, set: setSliderSS },
                { label: 'Rational ↔ Emotional', left: 'Rational', right: 'Emotional', val: sliderRE, set: setSliderRE },
              ].map(({ label, left, right, val, set }) => (
                <div key={label}>
                  <label className="label">{label}</label>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-text/40 w-20 text-right">{left}</span>
                    <input type="range" min="0" max="100" value={val} onChange={(e) => set(Number(e.target.value))} className="flex-1 accent-primary" />
                    <span className="text-xs text-text/40 w-20">{right}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 5: Intention ── */}
        {step === 5 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-heading text-4xl text-dark mb-2">Deine Intention</h2>
              <p className="text-text/50">Was suchst du wirklich?</p>
            </div>
            <div>
              <label className="label">Was suchst du?</label>
              <div className="flex flex-wrap gap-2">
                {['Tiefe Verbindung', 'Partnerschaft', 'Freundschaft + mehr', 'Ich erkunde noch', 'Spiritueller Partner', 'Lebenspartner'].map((i) => (
                  <button key={i} type="button" onClick={() => setIntention(i)} className={cn('chip', intention === i && 'chip-active')}>{i}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Beziehungsmodell</label>
              <div className="flex flex-wrap gap-2">
                {RELATIONSHIP_MODELS.map((m) => (
                  <button key={m} type="button" onClick={() => setRelationshipModel(m)} className={cn('chip', relationshipModel === m && 'chip-active')}>{m}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">In eigenen Worten (optional)</label>
              <textarea className="input min-h-[100px] resize-none" placeholder="Was darf eine Verbindung für dich beinhalten?" value={intentionText} onChange={(e) => setIntentionText(e.target.value)} maxLength={400} />
            </div>
          </div>
        )}

        {/* ── STEP 6: Privatsphäre ── */}
        {step === 6 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-heading text-4xl text-dark mb-2">Privatsphäre</h2>
              <p className="text-text/50">Du entscheidest, was andere sehen.</p>
            </div>
            <div className="card space-y-4">
              {[
                { label: 'Alter verbergen', val: hideAge, set: setHideAge },
                { label: 'Wohnort verbergen', val: hideLocation, set: setHideLocation },
                { label: 'Profil pausieren', val: profilePaused, set: setProfilePaused, desc: 'Dein Profil wird in der Entdecken-Ansicht nicht angezeigt.' },
              ].map(({ label, val, set, desc }) => (
                <div key={label} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-text">{label}</p>
                    {desc && <p className="text-xs text-text/40">{desc}</p>}
                  </div>
                  <button type="button" onClick={() => set(!val)} className={cn('w-12 h-6 rounded-full transition-colors duration-200 relative', val ? 'bg-primary' : 'bg-sand')}>
                    <span className={cn('absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200', val ? 'translate-x-7' : 'translate-x-1')} />
                  </button>
                </div>
              ))}
            </div>
            <div>
              <label className="label">Sexuelle Interessen (optional)</label>
              <div className="flex flex-wrap gap-2">
                {['Tantrische Praktiken', 'Energiearbeit', 'Körperarbeit', 'Intimität erkunden', 'Sacred Sexuality', 'BDSM', 'Polyamoröse Erfahrungen'].map((s) => (
                  <button key={s} type="button" onClick={() => toggleChip(s, sexualInterests, setSexualInterests)} className={cn('chip', sexualInterests.includes(s) && 'chip-active')}>{s}</button>
                ))}
              </div>
              <p className="text-xs text-text/40 mt-2">Diese Angaben sind optional und nur für Matches sichtbar.</p>
            </div>
            <div className="bg-light rounded-xl p-4">
              <p className="text-sm text-text/60 leading-relaxed">
                Mit dem Abschluss stimmst du unserer <a href="/datenschutz" className="text-primary hover:underline">Datenschutzerklärung</a> zu.
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-sand">
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)} className="btn-ghost flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" /> Zurück
            </button>
          ) : <div />}
          {step < TOTAL_STEPS ? (
            <button onClick={handleNext} className="btn-primary flex items-center gap-2">
              Weiter <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleFinish} disabled={saving} className="btn-primary">
              {saving ? 'Speichern...' : 'Profil speichern'}
            </button>
          )}
        </div>
      </div>

      {/* ── Profil-Vorschau Modal ── */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-white rounded-t-3xl px-5 pt-5 pb-3 border-b border-sand flex items-center justify-between">
              <p className="text-xs text-text/40 font-medium uppercase tracking-wider">Profilvorschau</p>
              <button onClick={() => setShowPreview(false)} className="w-8 h-8 rounded-full bg-sand flex items-center justify-center text-text/50 hover:text-text">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Foto */}
            <div className="aspect-[3/4] bg-sand relative">
              {photos[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photos[0]} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-text/20">
                  <Upload className="w-12 h-12" />
                  <p className="text-sm">Noch kein Foto</p>
                </div>
              )}
              {/* Foto-Thumbnails */}
              {photos.length > 1 && (
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                  {photos.map((_, i) => (
                    <div key={i} className={cn('w-1.5 h-1.5 rounded-full', i === 0 ? 'bg-white' : 'bg-white/50')} />
                  ))}
                </div>
              )}
              {/* Gradient + Name */}
              <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <h2 className="font-heading text-3xl">
                  {name || 'Dein Name'}{!hideAge && age ? `, ${age}` : ''}
                </h2>
                {!hideLocation && location && (
                  <div className="flex items-center gap-1 text-white/70 text-sm mt-0.5">
                    <MapPin className="w-3.5 h-3.5" />{location}
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="p-5 space-y-4">
              {quote && <p className="font-heading text-lg text-dark italic">&ldquo;{quote}&rdquo;</p>}
              {occupation && (
                <div className="flex items-center gap-2 text-text/60 text-sm">
                  <Briefcase className="w-4 h-4" />{occupation}
                </div>
              )}
              {intention && (
                <span className="inline-block bg-light text-primary text-xs px-3 py-1.5 rounded-full">{intention}</span>
              )}
              {bio && <p className="text-text/60 text-sm leading-relaxed">{bio}</p>}
              {interests.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {interests.slice(0, 6).map((i) => (
                    <span key={i} className="text-xs bg-sand text-text/60 px-2.5 py-1 rounded-full">{i}</span>
                  ))}
                </div>
              )}
              {werte.length > 0 && (
                <div>
                  <p className="text-xs text-text/40 mb-1.5">Werte</p>
                  <div className="flex flex-wrap gap-1.5">
                    {werte.slice(0, 5).map((w) => (
                      <span key={w} className="text-xs bg-light text-primary px-2.5 py-1 rounded-full">{w}</span>
                    ))}
                  </div>
                </div>
              )}
              {bindungstyp && (
                <p className="text-xs text-text/40">Bindungstyp: <span className="text-text/60">{bindungstyp}</span></p>
              )}
              {loveLanguage && (
                <p className="text-xs text-text/40">Love Language: <span className="text-text/60">{loveLanguage}</span></p>
              )}
            </div>

            <div className="px-5 pb-5">
              <button onClick={() => setShowPreview(false)} className="btn-primary w-full">
                Weiter bearbeiten
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
