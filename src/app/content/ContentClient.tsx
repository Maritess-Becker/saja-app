'use client'

import { useState, useEffect } from 'react'
import { Lock, Star, ExternalLink, ChevronRight, Heart, BookOpen, Mic, MessageSquare, Users, Sparkles, Moon, Search, Plus, ChevronLeft, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import toastLib from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import type { JournalEntry } from '@/types'
import { useSearchParams } from 'next/navigation'

type Tier = 'free' | 'membership' | 'premium'

interface Props {
  tier: Tier
  purchasedIds: string[]
  userId: string
  initialJournalEntries: JournalEntry[]
}

// ─── Journal helpers ──────────────────────────────────────────────────────────

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
  return DAILY_PROMPTS[Math.floor(Date.now() / 86_400_000) % DAILY_PROMPTS.length]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })
}

interface ContentItem {
  id: string
  title: string
  description: string
  access: 'free' | 'membership' | 'premium' | 'purchase'
  icon: React.ReactNode
  action?: 'modal' | 'external' | 'purchase'
  externalUrl?: string
  duration?: string
  tag?: string
}

const BINDUNGSTYP_TEST: ContentItem = {
  id: 'bindungstyp-test',
  title: 'Bindungstyp-Test',
  description: 'Entdecke deinen Bindungsstil und wie er deine Beziehungen prägt.',
  access: 'membership',
  icon: <Heart size={22} strokeWidth={1.8} />,
  action: 'modal',
  duration: '5 Min.',
  tag: 'Mitgliedschaft',
}

const CONTENT_SECTIONS = [
  {
    id: 'tests',
    label: 'Tests & Selbstreflexion',
    icon: <BookOpen size={22} strokeWidth={1.8} />,
    items: [
      BINDUNGSTYP_TEST,
      {
        id: 'love-language-test',
        title: 'Love Language Test',
        description: 'Welche der 5 Liebessprachen spricht dich am meisten an?',
        access: 'membership',
        icon: <Heart size={22} strokeWidth={1.8} />,
        action: 'modal',
        duration: '8 Min.',
        tag: 'Mitgliedschaft',
      },
      {
        id: 'beziehungsmodell-check',
        title: 'Beziehungsmodell-Check',
        description: 'Monogam, ethisch non-monogam, solo-poly? Finde heraus, was wirklich zu dir passt.',
        access: 'membership',
        icon: <Sparkles size={22} strokeWidth={1.8} />,
        action: 'modal',
        duration: '6 Min.',
        tag: 'Mitgliedschaft',
      },
    ] as ContentItem[],
  },
  {
    id: 'audio',
    label: 'Audio & Guides',
    icon: <Mic size={22} strokeWidth={1.8} />,
    items: [
      {
        id: 'meditation-audio',
        title: 'Meditations-Audio',
        description: 'Eine geführte Meditation zur Vorbereitung auf deine Begegnung.',
        access: 'premium',
        icon: <Mic size={22} strokeWidth={1.8} />,
        action: 'modal',
        duration: '15 Min.',
        tag: 'Premium',
      },
      {
        id: 'erstes-date-guide',
        title: 'Guide: Bewusstes erstes Treffen',
        description: 'Wie gestaltest du ein erstes bewusstes Date? Praktische Tipps und Impulse.',
        access: 'premium',
        icon: <BookOpen size={22} strokeWidth={1.8} />,
        action: 'modal',
        tag: 'Premium',
      },
      {
        id: 'reflexions-guide',
        title: 'Reflexions-Guide',
        description: 'Nach einer Begegnung: Was hast du gelernt? Was nimmst du mit?',
        access: 'premium',
        icon: <BookOpen size={22} strokeWidth={1.8} />,
        action: 'modal',
        tag: 'Premium',
      },
      {
        id: 'woechentliche-impulse',
        title: 'Wöchentliche Impulse & Rituale',
        description: 'Jeden Montag ein neues Ritual oder einen Impuls für bewusstes Dating.',
        access: 'premium',
        icon: <Sparkles size={22} strokeWidth={1.8} />,
        action: 'modal',
        tag: 'Premium',
      },
      {
        id: 'mini-coaching',
        title: 'Mini-Coaching: Bereit für Liebe',
        description: '5 kompakte Audio-Module von Anna & Yves — direkt in der App.',
        access: 'premium',
        icon: <Mic size={22} strokeWidth={1.8} />,
        action: 'modal',
        tag: 'Premium',
      },
    ] as ContentItem[],
  },
  {
    id: 'fragebögen',
    label: 'Fragebögen & Tiefenfragen',
    icon: <MessageSquare size={22} strokeWidth={1.8} />,
    items: [
      {
        id: '36-fragen',
        title: '36 Fragen',
        description: 'Die wissenschaftlich entwickelten 36 Fragen, die Menschen näherbringen — für die Begegnung.',
        access: 'premium',
        icon: <MessageSquare size={22} strokeWidth={1.8} />,
        action: 'modal',
        tag: 'Premium',
      },
      {
        id: '50-tiefenfragen',
        title: '50 Tiefen-Fragen',
        description: 'Fragen, die wirklich in die Tiefe gehen. Für mutige Gespräche.',
        access: 'premium',
        icon: <MessageSquare size={22} strokeWidth={1.8} />,
        action: 'modal',
        tag: 'Premium',
      },
      {
        id: 'frage-des-tages',
        title: 'Frage des Tages',
        description: 'Täglich eine neue Frage für deine Begegnung.',
        access: 'premium',
        icon: <Sparkles size={22} strokeWidth={1.8} />,
        action: 'modal',
        tag: 'Premium',
      },
      {
        id: 'werte-zukunft',
        title: 'Werte & Zukunft',
        description: 'Ein Fragebogen über Lebensziele, Werte und gemeinsame Visionen.',
        access: 'purchase',
        icon: <MessageSquare size={22} strokeWidth={1.8} />,
        action: 'purchase',
        tag: 'Einmalig kaufbar',
      },
      {
        id: 'intimität',
        title: 'Intimität & Nähe',
        description: 'Tiefe Fragen zu Intimität, körperlicher Nähe und Vertrauen.',
        access: 'purchase',
        icon: <Heart size={22} strokeWidth={1.8} />,
        action: 'purchase',
        tag: 'Einmalig kaufbar',
      },
      {
        id: 'konflikt',
        title: 'Konflikt & Kommunikation',
        description: 'Wie geht ihr als Paar mit Konflikten um? Konstruktive Reflexion.',
        access: 'purchase',
        icon: <MessageSquare size={22} strokeWidth={1.8} />,
        action: 'purchase',
        tag: 'Einmalig kaufbar',
      },
    ] as ContentItem[],
  },
  {
    id: 'anna-yves',
    label: 'Anna & Yves · powered by Holistic Tantra',
    icon: <Users className="w-5 h-5" />,
    items: [
      {
        id: 'ht-quiz-anna-yves',
        title: 'HT-Quiz mit Anna & Yves',
        description: 'Lerne die Grundlagen von Holistic Tantra kennen.',
        access: 'free',
        icon: <Sparkles size={22} strokeWidth={1.8} />,
        action: 'external',
        externalUrl: 'https://holistic-tantra.com',
        tag: 'Kostenlos',
      },
      {
        id: 'meditation-anna-yves',
        title: 'Geführte Meditation',
        description: 'Eine Meditation von Anna & Yves für tiefe Erdung.',
        access: 'free',
        icon: <Mic size={22} strokeWidth={1.8} />,
        action: 'external',
        externalUrl: 'https://holistic-tantra.com',
        tag: 'Kostenlos',
      },
      {
        id: 'programm-verbindung',
        title: 'Programm: Bewusste Verbindung',
        description: 'Das vollständige Programm von Anna & Yves für tiefe Partnerschaft.',
        access: 'purchase',
        icon: <Star size={22} strokeWidth={1.8} />,
        action: 'external',
        externalUrl: 'https://holistic-tantra.com',
        tag: 'Kaufbar',
      },
      {
        id: 'programm-tantra',
        title: 'Tantra für Paare',
        description: 'Tantrasches Wissen und Übungen für Paare — praktisch und tiefgründig.',
        access: 'purchase',
        icon: <Star size={22} strokeWidth={1.8} />,
        action: 'external',
        externalUrl: 'https://holistic-tantra.com',
        tag: 'Kaufbar',
      },
    ] as ContentItem[],
  },
  {
    id: 'horoskop',
    label: 'Horoskop & Liebe',
    icon: <Star size={22} strokeWidth={1.8} />,
    items: [
      {
        id: 'sternzeichen-liebe',
        title: 'Dein Sternzeichen & die Liebe',
        description: 'Was sagt dein Sonnenzeichen über dich in Beziehungen? Ein Überblick über alle 12 Zeichen.',
        access: 'free',
        icon: <Star size={22} strokeWidth={1.8} />,
        action: 'modal',
        duration: '3 Min.',
        tag: 'Kostenlos',
      },
      {
        id: 'zeichen-kompatibilitaet',
        title: 'Welche Zeichen passen zu dir?',
        description: 'Klassische Kompatibilität nach westlichem Horoskop — welche Zeichen harmonieren mit deinem?',
        access: 'membership',
        icon: <Heart size={22} strokeWidth={1.8} />,
        action: 'modal',
        duration: '5 Min.',
        tag: 'Mitgliedschaft',
      },
      {
        id: 'aszendent-berechnen',
        title: 'Aszendent berechnen',
        description: 'Gib Geburtszeit und -ort ein und finde deinen Aszendenten — die Seite die andere zuerst sehen.',
        access: 'free',
        icon: <Sparkles size={22} strokeWidth={1.8} />,
        action: 'external',
        externalUrl: 'https://astro.com',
        duration: '2 Min.',
        tag: 'Kostenlos',
      },
      {
        id: 'chinesisches-horoskop',
        title: 'Chinesisches Horoskop & Liebe',
        description: 'Welches der 12 Tiere bist du — und welche Tiere ergänzen dich in der Partnerschaft?',
        access: 'membership',
        icon: <Moon size={22} strokeWidth={1.8} />,
        action: 'modal',
        duration: '4 Min.',
        tag: 'Mitgliedschaft',
      },
    ] as ContentItem[],
  },
]

// ─── Modal content ────────────────────────────────────────────────────────────

const MODAL_CONTENT: Record<string, { title: string; body: React.ReactNode }> = {
  'bindungstyp-test': {
    title: 'Bindungstyp-Test',
    body: (
      <div className="space-y-4">
        <p className="text-[#1A1410] leading-relaxed">
          Der Bindungstyp beschreibt, wie du emotionale Nähe und Beziehungen erlebst.
          Er entsteht in der frühen Kindheit und beeinflusst, wie du liebst.
        </p>
        <div className="space-y-3">
          {[
            { type: 'Sicher', desc: 'Du kannst Nähe und Distanz gut regulieren. Vertraust dir und anderen.' },
            { type: 'Ängstlich-präoccupiert', desc: 'Du sehnst dich nach Nähe, hast aber Angst vor Ablehnung.' },
            { type: 'Vermeidend-distanziert', desc: 'Du schätzt Unabhängigkeit, tust dich schwer mit tiefer Nähe.' },
            { type: 'Desorganisiert', desc: 'Nähe löst gleichzeitig Sehnsucht und Angst aus.' },
          ].map((b) => (
            <div key={b.type} className="p-3 bg-[#EDE8E0] rounded-xl">
              <p className="font-medium text-[#1A1410] text-sm">{b.type}</p>
              <p className="text-[#6B6058] text-xs mt-0.5">{b.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-[#A09888] italic">
          Vollständiger interaktiver Test folgt in Phase 2.
        </p>
      </div>
    ),
  },
  'ht-quiz': {
    title: 'HT-Quiz',
    body: (
      <div className="space-y-4">
        <p className="text-[#1A1410]">Was ist Holistic Tantra? Teste dein Wissen mit 5 Fragen.</p>
        {[
          { q: 'Was ist der Kern von Holistic Tantra?', a: 'Bewusstes Verbinden von Körper, Geist und Seele.' },
          { q: 'Was bedeutet "Tantra" ursprünglich?', a: 'Das Wort kommt aus dem Sanskrit und bedeutet "weben" oder "ausdehnen".' },
          { q: 'Was unterscheidet Holistic Tantra von Neo-Tantra?', a: 'Holistic Tantra integriert ganzheitliche Aspekte von Körperarbeit, Spiritualität und Psychologie.' },
        ].map((item, i) => (
          <div key={i} className="p-4 bg-[#EDE8E0] rounded-xl">
            <p className="font-medium text-[#1A1410] text-sm mb-1">Frage {i + 1}: {item.q}</p>
            <p className="text-[#6B6058] text-xs">{item.a}</p>
          </div>
        ))}
        <p className="text-xs text-[#A09888] italic">Vollständiger interaktiver Quiz folgt in Phase 2.</p>
      </div>
    ),
  },
  'love-language-test': {
    title: 'Love Language Test',
    body: (
      <div className="space-y-4">
        <p className="text-[#1A1410] leading-relaxed">
          Die 5 Liebessprachen nach Gary Chapman helfen dir zu verstehen,
          wie du Liebe gibst und empfängst.
        </p>
        {[
          { lang: 'Worte der Wertschätzung', desc: 'Komplimente, Ermutigung, Dankbarkeit aussprechen.' },
          { lang: 'Quality Time', desc: 'Ungeteilte, bewusste Aufmerksamkeit schenken.' },
          { lang: 'Geschenke', desc: 'Durchdachte Gesten zeigen: "Ich denke an dich."' },
          { lang: 'Hilfsbereitschaft', desc: 'Durch Taten Fürsorge ausdrücken.' },
          { lang: 'Körperliche Berührung', desc: 'Nähe durch Umarmungen, Berühren, Körperkontakt.' },
        ].map((l) => (
          <div key={l.lang} className="p-3 bg-[#EDE8E0] rounded-xl">
            <p className="font-medium text-[#1A1410] text-sm">{l.lang}</p>
            <p className="text-[#6B6058] text-xs mt-0.5">{l.desc}</p>
          </div>
        ))}
        <p className="text-xs text-[#A09888] italic">Interaktiver Test folgt in Phase 2.</p>
      </div>
    ),
  },
  'meditation-audio': {
    title: 'Meditations-Audio',
    body: (
      <div className="space-y-4">
        <div className="bg-[#221080] rounded-2xl p-6 text-center">
          <Mic className="w-10 h-10 text-[#1A1410] mx-auto mb-3" />
          <p className="font-heading text-xl text-[#FDF8F2] mb-1">Ankommen im Moment</p>
          <p className="text-[#FDF8F2]/50 text-sm">15 Minuten • Geführte Meditation</p>
        </div>
        <p className="text-[#6B6058] text-sm leading-relaxed">
          Diese Meditation begleitet dich darin, dich selbst zu spüren, anzukommen
          und Verbindung von innen heraus zu erleben.
        </p>
        <div className="bg-[#FDF8F2] rounded-xl p-4 text-center">
          <p className="text-[#1A1410] text-sm font-medium">Audio-Datei folgt in Phase 2</p>
          <p className="text-[#A09888] text-xs mt-1">Hier wird ein Audio-Player integriert.</p>
        </div>
      </div>
    ),
  },
  'erstes-date-guide': {
    title: '„Erstes Date" Guide',
    body: (
      <div className="space-y-4">
        <p className="text-[#1A1410] font-heading text-xl italic">
          &ldquo;Ein bewusstes erstes Date beginnt, bevor du ankommst.&rdquo;
        </p>
        <div className="space-y-3">
          {[
            { title: 'Vor dem Date', tips: ['Komm geerdet an — mach vorher eine kurze Atemübung.', 'Lass Erwartungen los. Neugier statt Bewertung.'] },
            { title: 'Beim Date', tips: ['Stelle echte Fragen. Höre wirklich zu.', 'Teile etwas von dir — Verletzlichkeit schafft Verbindung.', 'Spüre in deinen Körper — was nimmst du wahr?'] },
            { title: 'Nach dem Date', tips: ['Reflektiere: Was hat dich berührt? Was nicht gestimmt?', 'Kommuniziere ehrlich, ob du weitergehen möchtest.'] },
          ].map((s) => (
            <div key={s.title}>
              <p className="font-medium text-[#1A1410] text-sm mb-2">{s.title}</p>
              <ul className="space-y-1">
                {s.tips.map((t) => (
                  <li key={t} className="text-[#6B6058] text-sm flex gap-2">
                    <span className="text-[#1A1410] mt-0.5">•</span>{t}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  'reflexions-guide': {
    title: 'Reflexions-Guide',
    body: (
      <div className="space-y-4">
        <p className="text-[#1A1410] leading-relaxed">
          Jede Begegnung ist ein Spiegel. Nutze diese Fragen nach einer Begegnung.
        </p>
        {[
          'Was hat mich an dieser Person wirklich berührt?',
          'Wo habe ich mich authentisch gezeigt — und wo nicht?',
          'Was habe ich über meine eigenen Bedürfnisse gelernt?',
          'Was nehme ich aus dieser Begegnung mit in mein Leben?',
          'Was möchte ich beim nächsten Mal anders machen?',
        ].map((q, i) => (
          <div key={i} className="flex gap-3 p-3 bg-[#EDE8E0] rounded-xl">
            <span className="text-[#1A1410] font-heading text-lg">{i + 1}.</span>
            <p className="text-[#1A1410] text-sm leading-relaxed">{q}</p>
          </div>
        ))}
      </div>
    ),
  },
  '36-fragen': {
    title: '36 Fragen',
    body: (
      <div className="space-y-4">
        <p className="text-[#6B6058] text-sm">Von Arthur Aron — wissenschaftlich belegt als Weg zu emotionaler Nähe.</p>
        <div className="space-y-2">
          <p className="font-medium text-[#1A1410] text-sm">Set I — Einstieg</p>
          {['Wenn du dir aussuchen könntest, wen du zum Abendessen einlädst — wen würdest du wählen?',
            'Möchtest du berühmt sein? Wofür?',
            'Probst du einen Anruf, bevor du telefonierst? Warum?',
            'Was wäre für dich ein perfekter Tag?',
            'Wann hast du das letzte Mal für dich gesungen? Für jemand anderen?'].map((q, i) => (
            <div key={i} className="p-3 bg-[#EDE8E0] rounded-xl text-sm text-[#1A1410]">{i + 1}. {q}</div>
          ))}
          <p className="text-xs text-[#A09888] italic mt-2">... + 31 weitere Fragen in Sets II & III</p>
        </div>
      </div>
    ),
  },
  '50-tiefenfragen': {
    title: '50 Tiefen-Fragen',
    body: (
      <div className="space-y-3">
        <p className="text-[#6B6058] text-sm">Fragen, die echte Verbindung schaffen.</p>
        {[
          'Was gibt deinem Leben den tiefsten Sinn?',
          'Wann hast du dich zuletzt wirklich gesehen gefühlt?',
          'Was ist deine größte Angst in einer Beziehung?',
          'Welcher Moment hat dich am stärksten verändert?',
          'Was trägst du in dir, das die meisten Menschen nicht sehen?',
          'Welche Version von dir liebst du am meisten?',
          'Was würdest du tun, wenn du wüsstest, dass du nicht scheitern kannst?',
        ].map((q, i) => (
          <div key={i} className="p-3 bg-[#EDE8E0] rounded-xl text-sm text-[#1A1410]">
            <span className="text-[#1A1410] font-medium">{i + 1}. </span>{q}
          </div>
        ))}
        <p className="text-xs text-[#A09888] italic">... + 43 weitere Fragen</p>
      </div>
    ),
  },
  'frage-des-tages': {
    title: 'Frage des Tages',
    body: (
      <div className="text-center py-6">
        <Sparkles className="w-10 h-10 text-[#1A1410] mx-auto mb-4" />
        <p className="text-[#6B6058] text-sm mb-4">Heute, {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        <blockquote className="font-heading text-2xl text-[#1A1410] italic leading-relaxed">
          &ldquo;Was macht dich neugierig auf das Leben?&rdquo;
        </blockquote>
        <p className="text-[#A09888] text-xs mt-6">Eine neue Frage erscheint täglich. In der Begegnung kannst du sie direkt an dein Match senden.</p>
      </div>
    ),
  },
  'sternzeichen-liebe': {
    title: 'Dein Sternzeichen & die Liebe',
    body: (
      <div className="space-y-3">
        <p className="text-[#1A1410] text-sm leading-relaxed">Jedes der 12 Zeichen trägt eine eigene Art zu lieben. Ein kurzer Überblick:</p>
        {[
          { z: '♈ Widder', t: 'Leidenschaftlich, direkt, mutig in der Liebe.' },
          { z: '♉ Stier', t: 'Sinnlich, beständig, sucht Sicherheit und Treue.' },
          { z: '♊ Zwillinge', t: 'Neugierig, kommunikativ, braucht mentale Verbindung.' },
          { z: '♋ Krebs', t: 'Fürsorglich, tief emotional, sehr loyal.' },
          { z: '♌ Löwe', t: 'Großzügig, romantisch, braucht Wertschätzung.' },
          { z: '♍ Jungfrau', t: 'Zuvorkommend, aufmerksam, liebt durch Handlungen.' },
          { z: '♎ Waage', t: 'Harmonisch, romantisch, sucht Balance.' },
          { z: '♏ Skorpion', t: 'Intensiv, tief, sucht echte Intimität.' },
          { z: '♐ Schütze', t: 'Abenteuerlustig, ehrlich, braucht Freiheit.' },
          { z: '♑ Steinbock', t: 'Verlässlich, geduldig, liebt mit Taten.' },
          { z: '♒ Wassermann', t: 'Einzigartig, unabhängig, braucht Freundschaft als Basis.' },
          { z: '♓ Fische', t: 'Empathisch, träumerisch, liebt bedingungslos.' },
        ].map((item) => (
          <div key={item.z} className="p-3 bg-[#EDE8E0] rounded-xl flex gap-3">
            <span className="text-[#1A1410] font-heading text-lg">{item.z}</span>
            <p className="text-[#1A1410] text-sm">{item.t}</p>
          </div>
        ))}
      </div>
    ),
  },
  'zeichen-kompatibilitaet': {
    title: 'Welche Zeichen passen zu dir?',
    body: (
      <div className="space-y-4">
        <p className="text-[#1A1410] text-sm leading-relaxed">Klassische Affinitäten nach Element und Qualität:</p>
        {[
          { gruppe: 'Feuer ♈♌♐', desc: 'Widder, Löwe und Schütze verstehen einander — leidenschaftlich und direkt.' },
          { gruppe: 'Erde ♉♍♑', desc: 'Stier, Jungfrau und Steinbock — geerdet, loyal, langfristig denkend.' },
          { gruppe: 'Luft ♊♎♒', desc: 'Zwillinge, Waage und Wassermann — intellektuell, kommunikativ.' },
          { gruppe: 'Wasser ♋♏♓', desc: 'Krebs, Skorpion und Fische — tief emotional, intuitiv, fürsorglich.' },
        ].map((item) => (
          <div key={item.gruppe} className="p-4 bg-[#EDE8E0] rounded-xl">
            <p className="font-medium text-[#1A1410] text-sm mb-1">{item.gruppe}</p>
            <p className="text-[#6B6058] text-xs">{item.desc}</p>
          </div>
        ))}
        <p className="text-xs text-[#A09888] italic">Kompatibilität ist komplex — das Gesamthoroskop gibt mehr Aufschluss.</p>
      </div>
    ),
  },
  'chinesisches-horoskop': {
    title: 'Chinesisches Horoskop & Liebe',
    body: (
      <div className="space-y-3">
        <p className="text-[#1A1410] text-sm leading-relaxed">Die 12 Tiere und ihre Partnerschaftsqualitäten:</p>
        {[
          { t: 'Ratte 🐭', d: 'Charmant und klug — passt gut zu Drache und Affe.' },
          { t: 'Ochse 🐂', d: 'Verlässlich und geduldig — harmoniert mit Schlange und Hahn.' },
          { t: 'Tiger 🐯', d: 'Mutig und leidenschaftlich — ergänzt sich mit Pferd und Hund.' },
          { t: 'Hase 🐇', d: 'Sanft und diplomatisch — findet Harmonie mit Ziege und Schwein.' },
          { t: 'Drache 🐉', d: 'Charismatisch und stark — verbindet sich mit Ratte und Affe.' },
          { t: 'Schlange 🐍', d: 'Weise und intuitiv — harmoniert mit Ochse und Hahn.' },
        ].map((item) => (
          <div key={item.t} className="p-3 bg-[#EDE8E0] rounded-xl">
            <p className="font-medium text-[#1A1410] text-sm">{item.t}</p>
            <p className="text-[#6B6058] text-xs mt-0.5">{item.d}</p>
          </div>
        ))}
        <p className="text-xs text-[#A09888] italic">... + 6 weitere Tiere. Vollständige Übersicht folgt in Phase 2.</p>
      </div>
    ),
  },
  'beziehungsmodell-check': {
    title: 'Beziehungsmodell-Check',
    body: (
      <div className="space-y-4">
        <p className="text-[#1A1410] leading-relaxed">
          Es gibt viele Wege, Liebe zu leben. Dieser Check hilft dir zu verstehen, welches Modell
          wirklich zu dir und deinen Werten passt.
        </p>
        {[
          { model: 'Monogamie', desc: 'Eine romantische und sexuelle Partnerschaft zur selben Zeit. Klarheit durch Exklusivität.' },
          { model: 'Ethische Non-Monogamie', desc: 'Mehrere liebevolle Verbindungen mit Wissen und Zustimmung aller Beteiligten.' },
          { model: 'Solo-Polyamorie', desc: 'Tiefe Verbindungen, aber die eigene Unabhängigkeit bleibt im Mittelpunkt.' },
          { model: 'Relationship Anarchy', desc: 'Verbindungen jenseits von Kategorien — jede Beziehung gestaltet sich neu.' },
        ].map((m) => (
          <div key={m.model} className="p-3 bg-[#EDE8E0] rounded-xl">
            <p className="font-medium text-[#1A1410] text-sm">{m.model}</p>
            <p className="text-[#6B6058] text-xs mt-0.5">{m.desc}</p>
          </div>
        ))}
        <p className="text-xs text-[#A09888] italic">Interaktiver Check folgt in Phase 2.</p>
      </div>
    ),
  },
  'woechentliche-impulse': {
    title: 'Wöchentliche Impulse & Rituale',
    body: (
      <div className="space-y-4">
        <p className="text-[#1A1410] leading-relaxed">
          Jeden Montag erwartet dich ein neues Ritual oder ein Impuls für bewusstes Dating.
        </p>
        <div className="bg-[#FDF8F2] rounded-2xl p-5 text-center">
          <Sparkles className="w-8 h-8 text-[#1A1410] mx-auto mb-3" />
          <p className="font-heading text-lg text-[#1A1410] mb-1">Diese Woche</p>
          <p className="text-[#1A1410] font-medium text-sm mb-3">Impuls: Die 5-Minuten-Stille</p>
          <p className="text-[#6B6058] text-sm leading-relaxed">
            Bevor du heute Abend dein Handy nimmst — sitze 5 Minuten in Stille.
            Was wünschst du dir wirklich in einer Verbindung?
          </p>
        </div>
        <p className="text-xs text-[#A09888] italic">Neue Impulse erscheinen wöchentlich.</p>
      </div>
    ),
  },
  'mini-coaching': {
    title: 'Mini-Coaching: Bereit für Liebe',
    body: (
      <div className="space-y-4">
        <p className="text-[#1A1410] leading-relaxed">
          5 kompakte Audio-Module von Anna & Yves — direkt in der App. Jedes Modul 10–15 Minuten.
        </p>
        {[
          { num: '01', title: 'Was hält mich wirklich zurück?', duration: '12 Min.' },
          { num: '02', title: 'Bindungswunden erkennen & heilen', duration: '15 Min.' },
          { num: '03', title: 'Anziehung vs. echte Passung', duration: '11 Min.' },
          { num: '04', title: 'Verletzlichkeit als Stärke', duration: '13 Min.' },
          { num: '05', title: 'Bereit für tiefe Liebe', duration: '14 Min.' },
        ].map((m) => (
          <div key={m.num} className="flex items-center gap-4 p-3 bg-[#EDE8E0] rounded-xl">
            <span className="font-heading text-2xl text-[#6B6058]">{m.num}</span>
            <div className="flex-1">
              <p className="font-medium text-[#1A1410] text-sm">{m.title}</p>
              <p className="text-[#A09888] text-xs">{m.duration}</p>
            </div>
            <Mic className="w-4 h-4 text-[#A09888]" />
          </div>
        ))}
        <p className="text-xs text-[#A09888] italic">Audio-Dateien folgen in Phase 2.</p>
      </div>
    ),
  },
}

// ─── Icon color map ───────────────────────────────────────────────────────────

const ICON_BG: Record<string, string> = {
  'bindungstyp-test': '#221080',
  'love-language-test': '#C4603A',
  'beziehungsmodell-check': '#221080',
  'meditation-audio': '#5A8A6A',
  'erstes-date-guide': '#4A7A5A',
  'reflexions-guide': '#3D1F9E',
  'woechentliche-impulse': '#221080',
  'mini-coaching': '#C4603A',
  '36-fragen': '#221080',
  '50-tiefenfragen': '#221080',
  'frage-des-tages': '#C4603A',
  'werte-zukunft': '#4A7A5A',
  'intimität': '#C4603A',
  'konflikt': '#3D1F9E',
  'ht-quiz-anna-yves': '#221080',
  'meditation-anna-yves': '#5A8A6A',
  'programm-verbindung': '#221080',
  'programm-tantra': '#4A7A5A',
  'sternzeichen-liebe': '#221080',
  'zeichen-kompatibilitaet': '#C4603A',
  'aszendent-berechnen': '#221080',
  'chinesisches-horoskop': '#4A7A5A',
}

// ─── Pattern Feedback config ─────────────────────────────────────────────────

const PATTERN_FEEDBACK_CONFIG: Record<string, {
  icon: string
  title: string
  body: string
  positive: boolean
  journalPrompt: string
}> = {
  calm: {
    icon: '🌿',
    title: 'Du trägst gerade eine stille Stärke.',
    body: 'In deinen letzten Begegnungen zeigt sich immer wieder Ruhe und Geerdet-Sein. Was nährt dich gerade so?',
    positive: true,
    journalPrompt: 'Was gibt mir gerade diese innere Ruhe?',
  },
  inspired: {
    icon: '✨',
    title: 'Du strahlst gerade aus dir heraus.',
    body: 'Deine Begegnungen hinterlassen immer wieder ein Gefühl von Offenheit und Inspiration. Das ist ein schönes Zeichen.',
    positive: true,
    journalPrompt: 'Was beflügelt mich gerade so in meinen Begegnungen?',
  },
  unsettled: {
    icon: '🌊',
    title: 'Ein Muster zeigt sich.',
    body: 'In deinen letzten Begegnungen hast du dich oft unsicher oder bewegt gefühlt. Das darf sein — und es lohnt sich, genauer hinzuschauen.',
    positive: false,
    journalPrompt: 'Was bewegt mich gerade so in meinen Begegnungen?',
  },
  exhausted: {
    icon: '🌧',
    title: 'Dein System sendet ein Signal.',
    body: 'Du hast dich in letzter Zeit nach Begegnungen oft überfordert oder erschöpft gefühlt. Was brauchst du gerade von dir selbst?',
    positive: false,
    journalPrompt: 'Was brauche ich gerade, um mich wieder zu erholen?',
  },
}

function getPatternConfig(value: string) {
  return PATTERN_FEEDBACK_CONFIG[value] ?? {
    icon: '🌊',
    title: 'Ein Muster zeigt sich.',
    body: `Du hast in letzten Begegnungen häufig "${value}" erlebt. Zeit für einen genaueren Blick.`,
    positive: false,
    journalPrompt: 'Was bewegt mich gerade in meinen Begegnungen?',
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ContentClient({ tier, purchasedIds, userId, initialJournalEntries }: Props) {
  const supabase = createClient()

  // ── Content state ──
  const [activeTab, setActiveTab] = useState('tests')
  const [openModal, setOpenModal] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  // ── Main tab: content vs journal ──
  const [mainTab, setMainTab] = useState<'content' | 'journal'>('content')

  // ── Journal state ──
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(initialJournalEntries)
  const [writingMode, setWritingMode] = useState(false)
  const [draft, setDraft] = useState('')
  const [draftPrompt, setDraftPrompt] = useState('')
  const [saving, setSaving] = useState(false)
  const [openEntry, setOpenEntry] = useState<JournalEntry | null>(null)
  const dailyPrompt = getDailyPrompt()

  // ── Pattern Feedback state ──
  const [patternFeedback, setPatternFeedback] = useState<string | null>(null)
  useEffect(() => {
    const val = localStorage.getItem('show_pattern_feedback')
    if (val) {
      setPatternFeedback(val)
      // Auto-switch to journal tab to show it
      setMainTab('journal')
    }
  }, [])

  // ── Content helpers ──
  const allItems = CONTENT_SECTIONS.flatMap((s) => s.items)
  const searchResults = search.trim()
    ? allItems.filter((item) =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase()) ||
        (item.tag ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : null

  function canAccess(item: ContentItem): boolean {
    if (item.access === 'free') return true
    if (item.access === 'membership') return tier !== 'free'
    if (item.access === 'premium') return tier === 'premium'
    if (item.access === 'purchase') return purchasedIds.includes(item.id)
    return false
  }

  function handleOpen(item: ContentItem) {
    if (!canAccess(item)) {
      toastLib('Upgrade erforderlich')
      return
    }
    if (item.action === 'external' && item.externalUrl) {
      window.open(item.externalUrl, '_blank')
      return
    }
    if (item.action === 'purchase') {
      toastLib('Kaufoption folgt mit Stripe-Integration.')
      return
    }
    setOpenModal(item.id)
  }

  function tagColor(access: ContentItem['access']) {
    if (access === 'free') return 'bg-[rgba(90,138,106,0.15)] text-[#3D6B50]'
    if (access === 'membership') return 'bg-[rgba(158,107,71,0.15)] text-[#120850]'
    if (access === 'premium') return 'bg-[rgba(26,20,16,0.10)] text-[#1A1410]'
    if (access === 'purchase') return 'bg-[rgba(158,107,71,0.15)] text-[#120850]'
    return 'bg-[rgba(34,16,128,0.07)] text-[#6B6058]'
  }

  const activeSection = CONTENT_SECTIONS.find((s) => s.id === activeTab)

  // ── Journal helpers ──
  function startWriting(prompt: string) {
    setDraftPrompt(prompt)
    setDraft('')
    setWritingMode(true)
  }

  async function saveEntry() {
    if (!draft.trim()) return
    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .insert({ user_id: userId, prompt: draftPrompt || null, content: draft.trim(), trigger: '' })
        .select()
        .single()
      if (error) throw error
      setJournalEntries((prev) => [data as JournalEntry, ...prev])
      setWritingMode(false)
      setDraft('')
      setDraftPrompt('')
      toastLib('Eintrag gespeichert ✦')
    } catch {
      toastLib('Fehler beim Speichern')
    } finally {
      setSaving(false)
    }
  }

  // ── Writing view ──
  if (writingMode) {
    return (
      <div className="max-w-2xl mx-auto min-h-screen bg-[#FDF8F2] flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 pt-5 pb-4">
          <button
            onClick={() => { setWritingMode(false); setDraft('') }}
            className="w-9 h-9 rounded-full bg-white border border-[rgba(30,20,10,0.08)] flex items-center justify-center text-[#6B6058]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-[#6B6058] font-body text-sm">Dein Journal</span>
        </div>

        {/* Prompt */}
        {draftPrompt && (
          <div className="mx-4 mb-5 rounded-2xl p-5" style={{ background: 'var(--bg-indigo)' }}>
            <p className="font-heading text-lg italic text-[#FDF8F2]/80 leading-snug">
              &ldquo;{draftPrompt}&rdquo;
            </p>
          </div>
        )}

        {/* Textarea */}
        <div className="flex-1 px-4">
          <textarea
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Schreib, was dir gerade in den Sinn kommt…"
            className="w-full h-64 bg-white rounded-2xl p-5 text-sm font-body text-[#1A1410] placeholder:text-[#A09888] leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-[#221080]/20"
            style={{ boxShadow: '0 2px 16px rgba(26,20,16,0.07)' }}
          />
          <p className="text-right text-xs text-[#A09888] mt-2 font-body">{draft.length} Zeichen</p>
        </div>

        {/* Save button */}
        <div className="px-4 pb-10 pt-4">
          <button
            onClick={saveEntry}
            disabled={!draft.trim() || saving}
            className="w-full py-4 rounded-full bg-[#221080] text-[#FDF8F2] font-body text-[14px] tracking-wide flex items-center justify-center gap-2 disabled:opacity-40 transition-opacity"
          >
            {saving ? (
              <span className="opacity-60">Speichern…</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Eintrag speichern
              </>
            )}
          </button>
        </div>
      </div>
    )
  }

  // ── Entry detail view ──
  if (openEntry) {
    return (
      <div className="max-w-2xl mx-auto min-h-screen bg-[#FDF8F2] flex flex-col">
        <div className="flex items-center gap-3 px-4 pt-5 pb-4">
          <button
            onClick={() => setOpenEntry(null)}
            className="w-9 h-9 rounded-full bg-white border border-[rgba(30,20,10,0.08)] flex items-center justify-center text-[#6B6058]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-[#6B6058] font-body text-sm">{formatDate(openEntry.created_at)}</span>
        </div>
        {openEntry.prompt && (
          <div className="mx-4 mb-5 rounded-2xl p-5" style={{ background: 'var(--bg-indigo)' }}>
            <p className="font-heading text-lg italic text-[#FDF8F2]/80 leading-snug">
              &ldquo;{openEntry.prompt}&rdquo;
            </p>
          </div>
        )}
        <div className="flex-1 px-4">
          <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 2px 16px rgba(26,20,16,0.07)' }}>
            <p className="font-body text-sm text-[#1A1410] leading-relaxed whitespace-pre-wrap">{openEntry.content}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto pb-32">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-transparent px-4 pt-5 pb-3 mb-4">
        <h1 className="font-heading text-[52px] font-light text-[#1A1410] tracking-[-0.5px] leading-none mb-3">Inhalte</h1>

        {/* Main tab toggle: Für dich | Dein Journal */}
        <div className="flex gap-1 bg-[rgba(34,16,128,0.06)] rounded-full p-1 w-fit">
          <button
            onClick={() => setMainTab('content')}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-body transition-all',
              mainTab === 'content'
                ? 'bg-[#221080] text-[#FDF8F2]'
                : 'text-[#6B6058]'
            )}
          >
            Für dich
          </button>
          <button
            onClick={() => setMainTab('journal')}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-body transition-all',
              mainTab === 'journal'
                ? 'bg-[#221080] text-[#FDF8F2]'
                : 'text-[#6B6058]'
            )}
          >
            Dein Journal
          </button>
        </div>
      </div>

      {/* ── JOURNAL TAB ── */}
      {mainTab === 'journal' && (
        <div className="px-4">
          {/* Pattern Feedback card */}
          {patternFeedback && (() => {
            const cfg = getPatternConfig(patternFeedback)
            function dismiss() {
              localStorage.removeItem('show_pattern_feedback')
              setPatternFeedback(null)
            }
            return (
              <div
                className="rounded-2xl p-5 mb-6 bg-white"
                style={{ boxShadow: '0 4px 24px rgba(26,20,16,0.10)' }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <span className="text-3xl leading-none mt-0.5">{cfg.icon}</span>
                  <div className="flex-1">
                    <p
                      className="text-[#1A1410] leading-snug mb-2"
                      style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '20px' }}
                    >
                      {cfg.title}
                    </p>
                    <p
                      className="text-[#6B6058] text-sm leading-relaxed"
                      style={{ fontFamily: 'var(--font-body)', fontWeight: 300 }}
                    >
                      {cfg.body}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      dismiss()
                      startWriting(cfg.journalPrompt)
                    }}
                    className="flex-1 py-2.5 rounded-full bg-[#221080] text-[#FDF8F2] font-body text-[13px] transition-opacity hover:opacity-90"
                  >
                    {cfg.positive ? 'Das freut mich ✦' : 'Im Journal erforschen →'}
                  </button>
                  <button
                    onClick={dismiss}
                    className="px-4 py-2.5 rounded-full border border-[rgba(34,16,128,0.20)] text-[#6B6058] font-body text-[13px] transition-colors hover:border-[#221080]/40"
                  >
                    Danke, ich weiß
                  </button>
                </div>
              </div>
            )
          })()}

          {/* Daily prompt card */}
          <div
            className="rounded-2xl p-6 mb-6 relative overflow-hidden"
            style={{ background: 'var(--bg-indigo)' }}
          >
            <p className="font-body text-[11px] uppercase tracking-[0.14em] text-[#FDF8F2]/45 mb-3">Tagesimpuls</p>
            <p className="font-heading text-[22px] italic text-[#FDF8F2] leading-snug mb-5">
              &ldquo;{dailyPrompt}&rdquo;
            </p>
            <button
              onClick={() => startWriting(dailyPrompt)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#FDF8F2] text-[#221080] font-body text-[13px] transition-opacity hover:opacity-90"
            >
              Jetzt schreiben →
            </button>
          </div>

          {/* Entry list */}
          {journalEntries.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-10 h-10 text-[#A09888] mx-auto mb-3" />
              <p className="text-[#1A1410] font-heading text-xl mb-1">Dein Journal wartet</p>
              <p className="text-[#6B6058] text-sm font-body">Schreib deinen ersten Eintrag.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {journalEntries.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => setOpenEntry(entry)}
                  className="w-full text-left bg-white rounded-2xl px-5 py-4 transition-all active:scale-[0.98]"
                  style={{ boxShadow: '0 2px 12px rgba(26,20,16,0.07)' }}
                >
                  <p className="text-[#6B6058] font-body text-[11px] uppercase tracking-[0.12em] mb-1.5">
                    {formatDate(entry.created_at)}
                  </p>
                  {entry.prompt && (
                    <p className="font-heading text-base italic text-[#A09888] mb-1 leading-snug line-clamp-1">
                      {entry.prompt}
                    </p>
                  )}
                  <p className="font-heading text-[18px] text-[#1A1410] leading-snug line-clamp-2">
                    {entry.content}
                  </p>
                </button>
              ))}
            </div>
          )}

          {/* FAB */}
          <button
            onClick={() => startWriting('')}
            className="fixed bottom-24 right-5 md:bottom-8 md:right-8 w-14 h-14 rounded-full bg-[#221080] flex items-center justify-center z-30 transition-transform active:scale-95"
            style={{ boxShadow: '0 4px 20px rgba(34,16,128,0.35)' }}
          >
            <Plus className="w-6 h-6 text-[#FDF8F2]" />
          </button>
        </div>
      )}

      {/* ── CONTENT TAB ── */}
      {mainTab === 'content' && (
        <div className="px-4">

          {/* Search */}
          <div className="relative mb-5">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6058]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Inhalte durchsuchen…"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-sm font-body text-[#1A1410] placeholder:text-[#6B6058] focus:outline-none focus:ring-2 focus:ring-[#221080]/30"
              style={{ boxShadow: '0 2px 12px rgba(26,20,16,0.06)' }}
            />
          </div>

          {/* Category tabs — hide when searching */}
          {!search.trim() && (
            <div className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-hide">
              {CONTENT_SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveTab(s.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-body whitespace-nowrap transition-all',
                    activeTab === s.id
                      ? 'bg-[#221080] text-white'
                      : 'border border-[rgba(34,16,128,0.12)] text-[#6B6058] hover:border-[#221080]/40'
                  )}
                >
                  {s.icon}
                  {s.label}
                </button>
              ))}
            </div>
          )}

          {/* Search results */}
          {searchResults !== null && (
            <div className="space-y-3 mb-6">
              {searchResults.length === 0 && (
                <p className="text-center text-[#6B6058] text-sm py-8">Keine Inhalte gefunden.</p>
              )}
              {searchResults.map((item) => {
                const accessible = canAccess(item)
                return (
                  <button
                    key={item.id}
                    onClick={() => handleOpen(item)}
                    className={cn(
                      'bg-white rounded-2xl p-5 w-full text-left flex gap-4 items-start transition-all active:scale-[0.98] duration-150',
                      !accessible && 'opacity-60'
                    )}
                    style={{ boxShadow: '0 2px 12px rgba(26,20,16,0.08)' }}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: accessible ? (ICON_BG[item.id] ?? '#221080') : 'rgba(34,16,128,0.12)', color: '#FFFFFF' }}
                    >
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-heading text-[22px] text-[#1A1410]">{item.title}</h3>
                        {item.tag && (
                          <span className={cn('text-[11px] px-2.5 py-1 rounded-full font-body font-medium', tagColor(item.access))}>
                            {item.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-[#1A1410] font-body text-sm leading-relaxed">{item.description}</p>
                    </div>
                    <div className="flex-shrink-0 mt-1">
                      {accessible
                        ? item.action === 'external'
                          ? <ExternalLink className="w-4 h-4 text-[#6B6058]" />
                          : <ChevronRight className="w-4 h-4 text-[#6B6058]" />
                        : <Lock className="w-4 h-4 text-[#6B6058]" />
                      }
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* Content items (tab view) */}
          {searchResults === null && activeSection && (
            <div className="space-y-3">
              {activeSection.items.map((item) => {
                const accessible = canAccess(item)
                return (
                  <button
                    key={item.id}
                    onClick={() => handleOpen(item)}
                    className={cn(
                      'bg-white rounded-2xl p-5 w-full text-left flex gap-4 items-start transition-all active:scale-[0.98] duration-150',
                      !accessible && 'opacity-60'
                    )}
                    style={{ boxShadow: '0 2px 12px rgba(26,20,16,0.08)' }}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: accessible ? (ICON_BG[item.id] ?? '#221080') : 'rgba(34,16,128,0.12)',
                        color: '#FFFFFF',
                      }}
                    >
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-heading text-[22px] text-[#1A1410]">{item.title}</h3>
                        {item.tag && (
                          <span className={cn('text-[11px] px-2.5 py-1 rounded-full font-body font-medium', tagColor(item.access))}>
                            {item.tag}
                          </span>
                        )}
                        {item.duration && (
                          <span className="text-xs text-[#6B6058] font-light">{item.duration}</span>
                        )}
                      </div>
                      <p className="text-[#1A1410] font-body text-sm leading-relaxed">{item.description}</p>
                    </div>
                    <div className="flex-shrink-0 mt-1">
                      {accessible ? (
                        item.action === 'external'
                          ? <ExternalLink className="w-4 h-4 text-[#6B6058]" />
                          : <ChevronRight className="w-4 h-4 text-[#6B6058]" />
                      ) : (
                        <Lock className="w-4 h-4 text-[#6B6058]" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* Modal */}
          {openModal && MODAL_CONTENT[openModal] && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
              <div className="bg-white rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
                <div className="sticky top-0 bg-white rounded-t-3xl px-6 pt-6 pb-4 border-b border-[rgba(30,20,10,0.08)] flex items-center justify-between">
                  <h2 className="font-heading text-2xl text-[#1A1410]">{MODAL_CONTENT[openModal].title}</h2>
                  <button
                    onClick={() => setOpenModal(null)}
                    className="w-8 h-8 rounded-full bg-[#EDE8E0] flex items-center justify-center text-[#6B6058] hover:text-[#1A1410]"
                  >
                    ✕
                  </button>
                </div>
                <div className="px-6 py-5">
                  {MODAL_CONTENT[openModal].body}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

