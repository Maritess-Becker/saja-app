'use client'

import { useState } from 'react'
import { Lock, Star, ExternalLink, ChevronRight, Heart, BookOpen, Mic, MessageSquare, Users, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import toastLib from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

type Tier = 'free' | 'membership' | 'premium'

interface Props {
  tier: Tier
  purchasedIds: string[]
  userId: string
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
  icon: <Heart className="w-5 h-5" />,
  action: 'modal',
  duration: '5 Min.',
  tag: 'Mitgliedschaft',
}

const CONTENT_SECTIONS = [
  {
    id: 'tests',
    label: 'Tests & Selbstreflexion',
    icon: <BookOpen className="w-5 h-5" />,
    items: [
      BINDUNGSTYP_TEST,
      {
        id: 'love-language-test',
        title: 'Love Language Test',
        description: 'Welche der 5 Liebessprachen spricht dich am meisten an?',
        access: 'membership',
        icon: <Heart className="w-5 h-5" />,
        action: 'modal',
        duration: '8 Min.',
        tag: 'Mitgliedschaft',
      },
      {
        id: 'beziehungsmodell-check',
        title: 'Beziehungsmodell-Check',
        description: 'Monogam, ethisch non-monogam, solo-poly? Finde heraus, was wirklich zu dir passt.',
        access: 'membership',
        icon: <Sparkles className="w-5 h-5" />,
        action: 'modal',
        duration: '6 Min.',
        tag: 'Mitgliedschaft',
      },
    ] as ContentItem[],
  },
  {
    id: 'audio',
    label: 'Audio & Guides',
    icon: <Mic className="w-5 h-5" />,
    items: [
      {
        id: 'meditation-audio',
        title: 'Meditations-Audio',
        description: 'Eine geführte Meditation zur Vorbereitung auf deine Begegnung.',
        access: 'premium',
        icon: <Mic className="w-5 h-5" />,
        action: 'modal',
        duration: '15 Min.',
        tag: 'Premium',
      },
      {
        id: 'erstes-date-guide',
        title: 'Guide: Bewusstes erstes Treffen',
        description: 'Wie gestaltest du ein erstes bewusstes Date? Praktische Tipps und Impulse.',
        access: 'premium',
        icon: <BookOpen className="w-5 h-5" />,
        action: 'modal',
        tag: 'Premium',
      },
      {
        id: 'reflexions-guide',
        title: 'Reflexions-Guide',
        description: 'Nach einer Begegnung: Was hast du gelernt? Was nimmst du mit?',
        access: 'premium',
        icon: <BookOpen className="w-5 h-5" />,
        action: 'modal',
        tag: 'Premium',
      },
      {
        id: 'woechentliche-impulse',
        title: 'Wöchentliche Impulse & Rituale',
        description: 'Jeden Montag ein neues Ritual oder einen Impuls für bewusstes Dating.',
        access: 'premium',
        icon: <Sparkles className="w-5 h-5" />,
        action: 'modal',
        tag: 'Premium',
      },
      {
        id: 'mini-coaching',
        title: 'Mini-Coaching: Bereit für Liebe',
        description: '5 kompakte Audio-Module von Anna & Yves — direkt in der App.',
        access: 'premium',
        icon: <Mic className="w-5 h-5" />,
        action: 'modal',
        tag: 'Premium',
      },
    ] as ContentItem[],
  },
  {
    id: 'fragebögen',
    label: 'Fragebögen & Tiefenfragen',
    icon: <MessageSquare className="w-5 h-5" />,
    items: [
      {
        id: '36-fragen',
        title: '36 Fragen',
        description: 'Die wissenschaftlich entwickelten 36 Fragen, die Menschen näherbringen — für die Begegnung.',
        access: 'premium',
        icon: <MessageSquare className="w-5 h-5" />,
        action: 'modal',
        tag: 'Premium',
      },
      {
        id: '50-tiefenfragen',
        title: '50 Tiefen-Fragen',
        description: 'Fragen, die wirklich in die Tiefe gehen. Für mutige Gespräche.',
        access: 'premium',
        icon: <MessageSquare className="w-5 h-5" />,
        action: 'modal',
        tag: 'Premium',
      },
      {
        id: 'frage-des-tages',
        title: 'Frage des Tages',
        description: 'Täglich eine neue Frage für deine Begegnung.',
        access: 'premium',
        icon: <Sparkles className="w-5 h-5" />,
        action: 'modal',
        tag: 'Premium',
      },
      {
        id: 'werte-zukunft',
        title: 'Werte & Zukunft',
        description: 'Ein Fragebogen über Lebensziele, Werte und gemeinsame Visionen.',
        access: 'purchase',
        icon: <MessageSquare className="w-5 h-5" />,
        action: 'purchase',
        tag: 'Einmalig kaufbar',
      },
      {
        id: 'intimität',
        title: 'Intimität & Nähe',
        description: 'Tiefe Fragen zu Intimität, körperlicher Nähe und Vertrauen.',
        access: 'purchase',
        icon: <Heart className="w-5 h-5" />,
        action: 'purchase',
        tag: 'Einmalig kaufbar',
      },
      {
        id: 'konflikt',
        title: 'Konflikt & Kommunikation',
        description: 'Wie geht ihr als Paar mit Konflikten um? Konstruktive Reflexion.',
        access: 'purchase',
        icon: <MessageSquare className="w-5 h-5" />,
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
        icon: <Sparkles className="w-5 h-5" />,
        action: 'external',
        externalUrl: 'https://holistic-tantra.com',
        tag: 'Kostenlos',
      },
      {
        id: 'meditation-anna-yves',
        title: 'Geführte Meditation',
        description: 'Eine Meditation von Anna & Yves für tiefe Erdung.',
        access: 'free',
        icon: <Mic className="w-5 h-5" />,
        action: 'external',
        externalUrl: 'https://holistic-tantra.com',
        tag: 'Kostenlos',
      },
      {
        id: 'programm-verbindung',
        title: 'Programm: Bewusste Verbindung',
        description: 'Das vollständige Programm von Anna & Yves für tiefe Partnerschaft.',
        access: 'purchase',
        icon: <Star className="w-5 h-5" />,
        action: 'external',
        externalUrl: 'https://holistic-tantra.com',
        tag: 'Kaufbar',
      },
      {
        id: 'programm-tantra',
        title: 'Tantra für Paare',
        description: 'Tantrasches Wissen und Übungen für Paare — praktisch und tiefgründig.',
        access: 'purchase',
        icon: <Star className="w-5 h-5" />,
        action: 'external',
        externalUrl: 'https://holistic-tantra.com',
        tag: 'Kaufbar',
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
        <p className="text-text/70 leading-relaxed">
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
            <div key={b.type} className="p-3 bg-sand rounded-xl">
              <p className="font-medium text-dark text-sm">{b.type}</p>
              <p className="text-text/60 text-xs mt-0.5">{b.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-text/40 italic">
          Vollständiger interaktiver Test folgt in Phase 2.
        </p>
      </div>
    ),
  },
  'ht-quiz': {
    title: 'HT-Quiz',
    body: (
      <div className="space-y-4">
        <p className="text-text/70">Was ist Holistic Tantra? Teste dein Wissen mit 5 Fragen.</p>
        {[
          { q: 'Was ist der Kern von Holistic Tantra?', a: 'Bewusstes Verbinden von Körper, Geist und Seele.' },
          { q: 'Was bedeutet "Tantra" ursprünglich?', a: 'Das Wort kommt aus dem Sanskrit und bedeutet "weben" oder "ausdehnen".' },
          { q: 'Was unterscheidet Holistic Tantra von Neo-Tantra?', a: 'Holistic Tantra integriert ganzheitliche Aspekte von Körperarbeit, Spiritualität und Psychologie.' },
        ].map((item, i) => (
          <div key={i} className="p-4 bg-sand rounded-xl">
            <p className="font-medium text-dark text-sm mb-1">Frage {i + 1}: {item.q}</p>
            <p className="text-text/60 text-xs">{item.a}</p>
          </div>
        ))}
        <p className="text-xs text-text/40 italic">Vollständiger interaktiver Quiz folgt in Phase 2.</p>
      </div>
    ),
  },
  'love-language-test': {
    title: 'Love Language Test',
    body: (
      <div className="space-y-4">
        <p className="text-text/70 leading-relaxed">
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
          <div key={l.lang} className="p-3 bg-sand rounded-xl">
            <p className="font-medium text-dark text-sm">{l.lang}</p>
            <p className="text-text/60 text-xs mt-0.5">{l.desc}</p>
          </div>
        ))}
        <p className="text-xs text-text/40 italic">Interaktiver Test folgt in Phase 2.</p>
      </div>
    ),
  },
  'meditation-audio': {
    title: 'Meditations-Audio',
    body: (
      <div className="space-y-4">
        <div className="bg-dark rounded-2xl p-6 text-center">
          <Mic className="w-10 h-10 text-primary mx-auto mb-3" />
          <p className="font-heading text-xl text-light mb-1">Ankommen im Moment</p>
          <p className="text-light/50 text-sm">15 Minuten • Geführte Meditation</p>
        </div>
        <p className="text-text/60 text-sm leading-relaxed">
          Diese Meditation begleitet dich darin, dich selbst zu spüren, anzukommen
          und Verbindung von innen heraus zu erleben.
        </p>
        <div className="bg-light rounded-xl p-4 text-center">
          <p className="text-primary text-sm font-medium">Audio-Datei folgt in Phase 2</p>
          <p className="text-text/40 text-xs mt-1">Hier wird ein Audio-Player integriert.</p>
        </div>
      </div>
    ),
  },
  'erstes-date-guide': {
    title: '„Erstes Date" Guide',
    body: (
      <div className="space-y-4">
        <p className="text-text/70 font-heading text-xl italic">
          &ldquo;Ein bewusstes erstes Date beginnt, bevor du ankommst.&rdquo;
        </p>
        <div className="space-y-3">
          {[
            { title: 'Vor dem Date', tips: ['Komm geerdet an — mach vorher eine kurze Atemübung.', 'Lass Erwartungen los. Neugier statt Bewertung.'] },
            { title: 'Beim Date', tips: ['Stelle echte Fragen. Höre wirklich zu.', 'Teile etwas von dir — Verletzlichkeit schafft Verbindung.', 'Spüre in deinen Körper — was nimmst du wahr?'] },
            { title: 'Nach dem Date', tips: ['Reflektiere: Was hat dich berührt? Was nicht gestimmt?', 'Kommuniziere ehrlich, ob du weitergehen möchtest.'] },
          ].map((s) => (
            <div key={s.title}>
              <p className="font-medium text-dark text-sm mb-2">{s.title}</p>
              <ul className="space-y-1">
                {s.tips.map((t) => (
                  <li key={t} className="text-text/60 text-sm flex gap-2">
                    <span className="text-primary mt-0.5">•</span>{t}
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
        <p className="text-text/70 leading-relaxed">
          Jede Begegnung ist ein Spiegel. Nutze diese Fragen nach einer Begegnung.
        </p>
        {[
          'Was hat mich an dieser Person wirklich berührt?',
          'Wo habe ich mich authentisch gezeigt — und wo nicht?',
          'Was habe ich über meine eigenen Bedürfnisse gelernt?',
          'Was nehme ich aus dieser Begegnung mit in mein Leben?',
          'Was möchte ich beim nächsten Mal anders machen?',
        ].map((q, i) => (
          <div key={i} className="flex gap-3 p-3 bg-sand rounded-xl">
            <span className="text-primary font-heading text-lg">{i + 1}.</span>
            <p className="text-text/70 text-sm leading-relaxed">{q}</p>
          </div>
        ))}
      </div>
    ),
  },
  '36-fragen': {
    title: '36 Fragen',
    body: (
      <div className="space-y-4">
        <p className="text-text/60 text-sm">Von Arthur Aron — wissenschaftlich belegt als Weg zu emotionaler Nähe.</p>
        <div className="space-y-2">
          <p className="font-medium text-dark text-sm">Set I — Einstieg</p>
          {['Wenn du dir aussuchen könntest, wen du zum Abendessen einlädst — wen würdest du wählen?',
            'Möchtest du berühmt sein? Wofür?',
            'Probst du einen Anruf, bevor du telefonierst? Warum?',
            'Was wäre für dich ein perfekter Tag?',
            'Wann hast du das letzte Mal für dich gesungen? Für jemand anderen?'].map((q, i) => (
            <div key={i} className="p-3 bg-sand rounded-xl text-sm text-text/70">{i + 1}. {q}</div>
          ))}
          <p className="text-xs text-text/40 italic mt-2">... + 31 weitere Fragen in Sets II & III</p>
        </div>
      </div>
    ),
  },
  '50-tiefenfragen': {
    title: '50 Tiefen-Fragen',
    body: (
      <div className="space-y-3">
        <p className="text-text/60 text-sm">Fragen, die echte Verbindung schaffen.</p>
        {[
          'Was gibt deinem Leben den tiefsten Sinn?',
          'Wann hast du dich zuletzt wirklich gesehen gefühlt?',
          'Was ist deine größte Angst in einer Beziehung?',
          'Welcher Moment hat dich am stärksten verändert?',
          'Was trägst du in dir, das die meisten Menschen nicht sehen?',
          'Welche Version von dir liebst du am meisten?',
          'Was würdest du tun, wenn du wüsstest, dass du nicht scheitern kannst?',
        ].map((q, i) => (
          <div key={i} className="p-3 bg-sand rounded-xl text-sm text-text/70">
            <span className="text-primary font-medium">{i + 1}. </span>{q}
          </div>
        ))}
        <p className="text-xs text-text/40 italic">... + 43 weitere Fragen</p>
      </div>
    ),
  },
  'frage-des-tages': {
    title: 'Frage des Tages',
    body: (
      <div className="text-center py-6">
        <Sparkles className="w-10 h-10 text-primary mx-auto mb-4" />
        <p className="text-text/50 text-sm mb-4">Heute, {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        <blockquote className="font-heading text-2xl text-dark italic leading-relaxed">
          &ldquo;Was macht dich neugierig auf das Leben?&rdquo;
        </blockquote>
        <p className="text-text/40 text-xs mt-6">Eine neue Frage erscheint täglich. In der Begegnung kannst du sie direkt an dein Match senden.</p>
      </div>
    ),
  },
  'beziehungsmodell-check': {
    title: 'Beziehungsmodell-Check',
    body: (
      <div className="space-y-4">
        <p className="text-text/70 leading-relaxed">
          Es gibt viele Wege, Liebe zu leben. Dieser Check hilft dir zu verstehen, welches Modell
          wirklich zu dir und deinen Werten passt.
        </p>
        {[
          { model: 'Monogamie', desc: 'Eine romantische und sexuelle Partnerschaft zur selben Zeit. Klarheit durch Exklusivität.' },
          { model: 'Ethische Non-Monogamie', desc: 'Mehrere liebevolle Verbindungen mit Wissen und Zustimmung aller Beteiligten.' },
          { model: 'Solo-Polyamorie', desc: 'Tiefe Verbindungen, aber die eigene Unabhängigkeit bleibt im Mittelpunkt.' },
          { model: 'Relationship Anarchy', desc: 'Verbindungen jenseits von Kategorien — jede Beziehung gestaltet sich neu.' },
        ].map((m) => (
          <div key={m.model} className="p-3 bg-sand rounded-xl">
            <p className="font-medium text-dark text-sm">{m.model}</p>
            <p className="text-text/60 text-xs mt-0.5">{m.desc}</p>
          </div>
        ))}
        <p className="text-xs text-text/40 italic">Interaktiver Check folgt in Phase 2.</p>
      </div>
    ),
  },
  'woechentliche-impulse': {
    title: 'Wöchentliche Impulse & Rituale',
    body: (
      <div className="space-y-4">
        <p className="text-text/70 leading-relaxed">
          Jeden Montag erwartet dich ein neues Ritual oder ein Impuls für bewusstes Dating.
        </p>
        <div className="bg-light rounded-2xl p-5 text-center">
          <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
          <p className="font-heading text-lg text-dark mb-1">Diese Woche</p>
          <p className="text-primary font-medium text-sm mb-3">Impuls: Die 5-Minuten-Stille</p>
          <p className="text-text/60 text-sm leading-relaxed">
            Bevor du heute Abend dein Handy nimmst — sitze 5 Minuten in Stille.
            Was wünschst du dir wirklich in einer Verbindung?
          </p>
        </div>
        <p className="text-xs text-text/40 italic">Neue Impulse erscheinen wöchentlich.</p>
      </div>
    ),
  },
  'mini-coaching': {
    title: 'Mini-Coaching: Bereit für Liebe',
    body: (
      <div className="space-y-4">
        <p className="text-text/70 leading-relaxed">
          5 kompakte Audio-Module von Anna & Yves — direkt in der App. Jedes Modul 10–15 Minuten.
        </p>
        {[
          { num: '01', title: 'Was hält mich wirklich zurück?', duration: '12 Min.' },
          { num: '02', title: 'Bindungswunden erkennen & heilen', duration: '15 Min.' },
          { num: '03', title: 'Anziehung vs. echte Passung', duration: '11 Min.' },
          { num: '04', title: 'Verletzlichkeit als Stärke', duration: '13 Min.' },
          { num: '05', title: 'Bereit für tiefe Liebe', duration: '14 Min.' },
        ].map((m) => (
          <div key={m.num} className="flex items-center gap-4 p-3 bg-sand rounded-xl">
            <span className="font-heading text-2xl text-primary/30">{m.num}</span>
            <div className="flex-1">
              <p className="font-medium text-dark text-sm">{m.title}</p>
              <p className="text-text/40 text-xs">{m.duration}</p>
            </div>
            <Mic className="w-4 h-4 text-text/30" />
          </div>
        ))}
        <p className="text-xs text-text/40 italic">Audio-Dateien folgen in Phase 2.</p>
      </div>
    ),
  },
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ContentClient({ tier, purchasedIds, userId }: Props) {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState('tests')
  const [openModal, setOpenModal] = useState<string | null>(null)

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
    if (access === 'free') return 'bg-accent/20 text-accent'
    if (access === 'membership') return 'bg-primary/10 text-primary'
    if (access === 'premium') return 'bg-dark/10 text-dark'
    if (access === 'purchase') return 'bg-primary/10 text-primary'
    return 'bg-sand text-text/60'
  }

  const activeSection = CONTENT_SECTIONS.find((s) => s.id === activeTab)

  return (
    <div className="max-w-2xl mx-auto px-4 pt-8 pb-32">
      <h1 className="font-heading text-3xl text-dark mb-1">Inhalte</h1>
      <p className="text-text/50 text-sm mb-6">Tests, Guides, Fragebögen und mehr.</p>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-hide">
        {CONTENT_SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveTab(s.id)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
              activeTab === s.id
                ? 'bg-primary text-white'
                : 'bg-white border border-sand text-text/60 hover:border-primary hover:text-primary'
            )}
          >
            {s.icon}
            {s.label}
          </button>
        ))}

      </div>

      {/* Content items */}
      {activeSection && (
        <div className="space-y-3">
          {activeSection.items.map((item) => {
            const accessible = canAccess(item)
            return (
              <button
                key={item.id}
                onClick={() => handleOpen(item)}
                className={cn(
                  'card w-full text-left flex gap-4 items-start transition-all hover:shadow-md',
                  !accessible && 'opacity-70'
                )}
              >
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                  accessible ? 'bg-light text-primary' : 'bg-sand text-text/30'
                )}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-heading text-lg text-dark">{item.title}</h3>
                    {item.tag && (
                      <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', tagColor(item.access))}>
                        {item.tag}
                      </span>
                    )}
                    {item.duration && (
                      <span className="text-xs text-text/30">{item.duration}</span>
                    )}
                  </div>
                  <p className="text-text/60 text-sm leading-relaxed">{item.description}</p>
                </div>
                <div className="flex-shrink-0 mt-1">
                  {accessible ? (
                    item.action === 'external'
                      ? <ExternalLink className="w-4 h-4 text-text/30" />
                      : <ChevronRight className="w-4 h-4 text-text/30" />
                  ) : (
                    <Lock className="w-4 h-4 text-text/30" />
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
            <div className="sticky top-0 bg-white rounded-t-3xl px-6 pt-6 pb-4 border-b border-sand flex items-center justify-between">
              <h2 className="font-heading text-2xl text-dark">{MODAL_CONTENT[openModal].title}</h2>
              <button
                onClick={() => setOpenModal(null)}
                className="w-8 h-8 rounded-full bg-sand flex items-center justify-center text-text/50 hover:text-text"
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
  )
}

