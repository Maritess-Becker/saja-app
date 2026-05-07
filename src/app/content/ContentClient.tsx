'use client'

import { useState, useEffect } from 'react'
import { Lock, Star, ChevronRight, Heart, BookOpen, Mic, MessageSquare, Sparkles, Moon, Search, Plus, ChevronLeft, Check, User, Compass, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'
import toastLib from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import type { JournalEntry } from '@/types'
import { getDailyGedanke } from '@/lib/affirmations'

type Tier = 'free' | 'membership' | 'premium'

interface Props {
  tier: Tier
  purchasedIds: string[]
  userId: string
  initialJournalEntries: JournalEntry[]
}

// ─── Journal helpers ──────────────────────────────────────────────────────────

const JOURNAL_DAILY_PROMPTS = [
  'Was wünschst du dir gerade von einer Verbindung?',
  'Was hast du heute über dich gelernt?',
  'Wann hast du dich zuletzt wirklich gesehen gefühlt?',
  'Was brauchst du gerade von dir selbst?',
  'Welche Begegnung hat dich zuletzt wirklich berührt — und warum?',
  'Was bewegt dich gerade?',
  'Wofür bist du heute dankbar?',
]

function getDailyPrompt() {
  return JOURNAL_DAILY_PROMPTS[Math.floor(Date.now() / 86_400_000) % JOURNAL_DAILY_PROMPTS.length]
}


function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })
}

// ─── Content types ────────────────────────────────────────────────────────────

interface ContentItem {
  id: string
  title: string
  description: string
  format: string
  access: 'free' | 'membership' | 'premium'
  icon: React.ReactNode
  tag?: string
}

// ─── Content sections ─────────────────────────────────────────────────────────

const CONTENT_SECTIONS = [
  {
    id: 'kenne-dich-selbst',
    label: 'Kenne dich selbst',
    icon: <User size={16} strokeWidth={1.8} />,
    items: [
      {
        id: 'was-mein-bindungstyp-bedeutet',
        title: 'Was mein Bindungstyp bedeutet',
        description: 'Nicht der Test nochmal — sondern eine tiefe Erklärung was das Ergebnis im Alltag und im Dating wirklich bedeutet. Für alle vier Typen separat.',
        format: 'Guide',
        access: 'membership',
        icon: <Heart size={20} strokeWidth={1.8} />,
        tag: 'Mitgliedschaft',
      },
      {
        id: 'love-language-leben',
        title: 'Meine Love Language leben',
        description: 'Wie man seine Love Language im Dating aktiv kommuniziert — und die des anderen erkennt, bevor man es ausspricht.',
        format: 'Guide',
        access: 'membership',
        icon: <Heart size={20} strokeWidth={1.8} />,
        tag: 'Mitgliedschaft',
      },
      {
        id: 'beziehungsmuster',
        title: 'Meine Beziehungsmuster',
        description: 'Kurze Fragen die helfen wiederkehrende Themen in vergangenen Beziehungen zu erkennen. 5–7 Reflexionsfragen, Antworten werden privat gespeichert.',
        format: 'Geführte Reflexion',
        access: 'premium',
        icon: <MessageSquare size={20} strokeWidth={1.8} />,
        tag: 'Premium',
      },
      {
        id: 'was-ich-wirklich-suche',
        title: 'Was ich wirklich suche',
        description: 'Tiefere Fragen zur eigenen Intention — über das Onboarding hinaus. Was brauche ich wirklich? Was habe ich mir bisher nicht erlaubt zu wollen?',
        format: 'Geführte Reflexion',
        access: 'membership',
        icon: <Sparkles size={20} strokeWidth={1.8} />,
        tag: 'Mitgliedschaft',
      },
      {
        id: 'grenzen-kennen',
        title: 'Meine Grenzen kennen',
        description: 'Ein kurzer Check zu eigenen Bedürfnissen und Grenzen in Beziehungen. Was ist mir nicht verhandelbar? Was brauche ich um mich sicher zu fühlen?',
        format: 'Reflexion',
        access: 'premium',
        icon: <User size={20} strokeWidth={1.8} />,
        tag: 'Premium',
      },
    ] as ContentItem[],
  },
  {
    id: 'begleitung',
    label: 'Begleitung',
    icon: <Compass size={16} strokeWidth={1.8} />,
    items: [
      {
        id: 'gedanke-des-tages',
        title: 'Gedanke des Tages',
        description: 'Ein Gedanke oder eine Frage täglich — zum bewussten Innehalten.',
        format: 'Tägliche Karte',
        access: 'free',
        icon: <Sparkles size={20} strokeWidth={1.8} />,
        tag: 'Kostenlos',
      },
      {
        id: 'nach-der-begegnung',
        title: 'Nach der Begegnung',
        description: 'Kurze Reflexionshilfe nach einem Gespräch oder Date. Was hat resoniert? Was hat sich komisch angefühlt? Wie war meine Energie danach?',
        format: 'Situativer Guide',
        access: 'membership',
        icon: <Moon size={20} strokeWidth={1.8} />,
        tag: 'Mitgliedschaft',
      },
      {
        id: 'wenn-es-schwer-wird',
        title: 'Wenn es schwer wird',
        description: 'Für Momente wie Ablehnung, Unsicherheit, Dating-Müdigkeit oder wenn man sich fragt ob es sich lohnt. Ehrlich, warm, ohne falsche Aufheiterung.',
        format: 'Guide',
        access: 'free',
        icon: <Heart size={20} strokeWidth={1.8} />,
        tag: 'Kostenlos',
      },
      {
        id: 'zwischen-zwei-begegnungen',
        title: 'Zwischen zwei Begegnungen',
        description: 'Was man in der Pause tun kann statt sofort weiterzusuchen. Über das Warten, die Stille und was sie uns sagen kann.',
        format: 'Guide',
        access: 'membership',
        icon: <Moon size={20} strokeWidth={1.8} />,
        tag: 'Mitgliedschaft',
      },
      {
        id: 'pause-bewusst-nutzen',
        title: 'Pause bewusst nutzen',
        description: 'Wenn der Pause-Modus aktiv ist — wie man diese Zeit wirklich für sich nutzt. Erscheint automatisch wenn der Pause-Modus aktiviert ist.',
        format: 'Kurzguide',
        access: 'free',
        icon: <Sparkles size={20} strokeWidth={1.8} />,
        tag: 'Kostenlos',
      },
    ] as ContentItem[],
  },
  {
    id: 'wissen',
    label: 'Wissen',
    icon: <BookOpen size={16} strokeWidth={1.8} />,
    items: [
      {
        id: 'bindungstypen-im-dating',
        title: 'Bindungstypen im Dating',
        description: 'Wie sich die vier Bindungstypen im Dating konkret verhalten — was man erkennen kann und wie man damit umgeht.',
        format: 'Artikel',
        access: 'membership',
        icon: <Heart size={20} strokeWidth={1.8} />,
        tag: 'Mitgliedschaft',
      },
      {
        id: 'gleiche-menschen',
        title: 'Warum ich immer die gleichen Menschen anziehe',
        description: 'Über Muster, Projektionen und unbewusste Anziehung. Ehrlich und ohne Schuld — aber klar.',
        format: 'Artikel',
        access: 'premium',
        icon: <Sparkles size={20} strokeWidth={1.8} />,
        tag: 'Premium',
      },
      {
        id: 'kunst-des-ersten-gesprächs',
        title: 'Die Kunst des ersten Gesprächs',
        description: 'Was bewusstes Kennenlernen bedeutet. Wie man präsent bleibt, echte Fragen stellt und sich selbst nicht verliert.',
        format: 'Guide',
        access: 'membership',
        icon: <MessageSquare size={20} strokeWidth={1.8} />,
        tag: 'Mitgliedschaft',
      },
      {
        id: 'koerper-und-intuition',
        title: 'Körper und Intuition',
        description: 'Über körperliche Intelligenz im Dating — was der Körper spürt bevor der Kopf es versteht.',
        format: 'Artikel',
        access: 'premium',
        icon: <Lightbulb size={20} strokeWidth={1.8} />,
        tag: 'Premium',
      },
      {
        id: 'conscious-dating',
        title: 'Conscious Dating — was es wirklich bedeutet',
        description: 'Was bewusstes Dating ist und was es nicht ist. Keine Perfektion — sondern Präsenz.',
        format: 'Einführungsartikel',
        access: 'free',
        icon: <BookOpen size={20} strokeWidth={1.8} />,
        tag: 'Kostenlos',
      },
      {
        id: 'sternzeichen-beziehungen',
        title: 'Dein Sternzeichen & Beziehungen',
        description: 'Was Sternzeichen und Aszendent über Beziehungsmuster sagen können — und was nicht. Ein nüchterner Blick mit echtem Erkenntnisgehalt.',
        format: 'Artikel',
        access: 'free',
        icon: <Sparkles size={20} strokeWidth={1.8} />,
        tag: 'Kostenlos',
      },
      {
        id: 'von-coaches',
        title: 'Von Coaches',
        description: 'Kurze Inhalte von Community-Coaches — Holistic Tantra und anderen Partnern. Mit Coach-Name und Community-Badge.',
        format: 'Gastbeiträge',
        access: 'membership',
        icon: <Star size={20} strokeWidth={1.8} />,
        tag: 'Mitgliedschaft',
      },
    ] as ContentItem[],
  },
]

// ─── Icon background colors ───────────────────────────────────────────────────

const ICON_BG: Record<string, string> = {
  // Kenne dich selbst — Herz & Rose
  'was-mein-bindungstyp-bedeutet': '#2D7A5F',
  'love-language-leben':           '#C08080',
  'beziehungsmuster':              '#7B4FA6',
  'was-ich-wirklich-suche':        '#2D7A5F',
  'grenzen-kennen':                '#C4603A',
  // Begleitung
  'gedanke-des-tages':             '#BF9B30',
  'nach-der-begegnung':            '#A05830',
  'wenn-es-schwer-wird':           '#C08080',
  'zwischen-zwei-begegnungen':     '#A05830',
  'pause-bewusst-nutzen':          '#BF9B30',
  // Wissen
  'bindungstypen-im-dating':       '#2D7A5F',
  'gleiche-menschen':              '#7B4FA6',
  'kunst-des-ersten-gesprächs':    '#3A5F8A',
  'koerper-und-intuition':         '#C4603A',
  'conscious-dating':              '#3A5F8A',
  'sternzeichen-beziehungen':      '#BF9B30',
  'von-coaches':                   '#7B4FA6',
}

// ─── Modal placeholder content ────────────────────────────────────────────────

const MODAL_CONTENT: Record<string, { title: string; body: React.ReactNode }> = {
  'was-mein-bindungstyp-bedeutet': {
    title: 'Was mein Bindungstyp bedeutet',
    body: (
      <div className="space-y-4">
        <p className="font-heading text-xl italic text-[#1A1410] leading-snug">
          &ldquo;Dein Bindungstyp ist kein Urteil — er ist eine Landkarte.&rdquo;
        </p>
        <p className="text-[#6B6058] text-sm leading-relaxed">
          Nicht der Test nochmal. Dieser Guide erklärt was dein Ergebnis im echten Leben bedeutet —
          im Dating, im ersten Gespräch, wenn es eng wird.
        </p>
        {[
          { typ: 'Sicher', color: '#2D7A5F', text: 'Du kannst Nähe zulassen ohne dich zu verlieren. Im Dating bist du präsent, klar und wenig reaktiv.' },
          { typ: 'Ängstlich-präoccupiert', color: '#C08080', text: 'Du sehnst dich tief nach Verbindung und bist sehr feinfühlig für Signale. Wichtig: Unterscheide Intuition von Angst.' },
          { typ: 'Vermeidend-distanziert', color: '#3A5F8A', text: 'Du schätzt Autonomie und tust dich schwer wenn Nähe zu schnell kommt. Echte Verbindung braucht dein eigenes Tempo.' },
          { typ: 'Desorganisiert', color: '#7B4FA6', text: 'Nähe löst gleichzeitig Sehnsucht und Alarm aus. Wachstum beginnt mit Sicherheit — in dir selbst.' },
        ].map((b) => (
          <div key={b.typ} className="p-4 bg-[#F5F0E8] rounded-2xl border-l-[3px]" style={{ borderLeftColor: b.color }}>
            <p className="font-body font-medium text-[#1A1410] text-sm mb-1">{b.typ}</p>
            <p className="text-[#6B6058] text-xs leading-relaxed">{b.text}</p>
          </div>
        ))}
        <p className="text-xs text-[#A09888] italic">Vollständiger interaktiver Guide folgt.</p>
      </div>
    ),
  },
  'love-language-leben': {
    title: 'Meine Love Language leben',
    body: (
      <div className="space-y-4">
        <p className="font-heading text-xl italic text-[#1A1410]">&ldquo;Nicht jeder liebt so wie du liebst.&rdquo;</p>
        <p className="text-[#6B6058] text-sm leading-relaxed">
          Den eigenen Liebesstil zu kennen ist nur der erste Schritt. Dieser Guide zeigt wie man
          ihn im Dating aktiv kommuniziert — und den des anderen erkennt.
        </p>
        {[
          { l: 'Worte der Wertschätzung', tip: 'Sag konkret was dir gefällt. Nicht nur „schön" — sondern warum.' },
          { l: 'Quality Time', tip: 'Handy weg. Wirklich zuhören. Das ist dein Geschenk.' },
          { l: 'Geschenke', tip: 'Es geht um Aufmerksamkeit, nicht um Wert. Was hast du wahrgenommen?' },
          { l: 'Hilfsbereitschaft', tip: 'Handlungen sprechen. Frag: Was würde dir gerade helfen?' },
          { l: 'Körperliche Berührung', tip: 'Frag nach Erlaubnis. Kleine Gesten bedeuten oft mehr als große.' },
        ].map((l) => (
          <div key={l.l} className="p-3 bg-[#F5F0E8] rounded-xl">
            <p className="font-medium text-[#1A1410] text-sm">{l.l}</p>
            <p className="text-[#6B6058] text-xs mt-0.5">{l.tip}</p>
          </div>
        ))}
        <p className="text-xs text-[#A09888] italic">Vollständiger Guide folgt.</p>
      </div>
    ),
  },
  'beziehungsmuster': {
    title: 'Meine Beziehungsmuster',
    body: (
      <div className="space-y-4">
        <p className="font-heading text-xl italic text-[#1A1410]">&ldquo;Was sich wiederholt, will gesehen werden.&rdquo;</p>
        <p className="text-[#6B6058] text-sm leading-relaxed">
          Diese Reflexionsfragen helfen dir wiederkehrende Themen zu erkennen.
          Deine Antworten werden privat gespeichert.
        </p>
        {[
          'Was endet in meinen Beziehungen immer auf ähnliche Weise?',
          'Welche Art von Menschen zieht mich immer wieder an — und warum?',
          'Wann fühle ich mich in Beziehungen am meisten sicher?',
          'Wann ziehe ich mich zurück — und was löst das aus?',
          'Was habe ich von meinen Eltern über Liebe gelernt?',
          'Was möchte ich diesmal anders machen?',
        ].map((q, i) => (
          <div key={i} className="p-3 bg-[#F5F0E8] rounded-xl flex gap-3">
            <span className="font-heading text-[#A09888] text-base">{i + 1}.</span>
            <p className="text-[#1A1410] text-sm leading-relaxed">{q}</p>
          </div>
        ))}
        <p className="text-xs text-[#A09888] italic">Antworten werden privat gespeichert. Folgt in Phase 2.</p>
      </div>
    ),
  },
  'was-ich-wirklich-suche': {
    title: 'Was ich wirklich suche',
    body: (
      <div className="space-y-4">
        <p className="font-heading text-xl italic text-[#1A1410]">&ldquo;Was du wirklich willst, liegt oft tiefer als du denkst.&rdquo;</p>
        <p className="text-[#6B6058] text-sm leading-relaxed">
          Über das Onboarding hinaus. Diese Fragen gehen dorthin wo Antworten nicht sofort kommen.
        </p>
        {[
          'Was fehlt mir in meinem Leben, das ich von einem Menschen erhoffe?',
          'Was wäre anders wenn ich bekäme was ich mir wünsche?',
          'Was habe ich mir in Beziehungen bisher nicht erlaubt zu wollen?',
          'Was bin ich bereit zu geben — wirklich?',
          'Was suche ich in jemandem, das ich auch in mir selbst brauche?',
        ].map((q, i) => (
          <div key={i} className="p-3 bg-[#F5F0E8] rounded-xl flex gap-3">
            <span className="font-heading text-[#A09888] text-base">{i + 1}.</span>
            <p className="text-[#1A1410] text-sm leading-relaxed">{q}</p>
          </div>
        ))}
        <p className="text-xs text-[#A09888] italic">Vollständige Reflexion folgt.</p>
      </div>
    ),
  },
  'grenzen-kennen': {
    title: 'Meine Grenzen kennen',
    body: (
      <div className="space-y-4">
        <p className="font-heading text-xl italic text-[#1A1410]">&ldquo;Grenzen sind kein Mauer — sie sind ein Einlass.&rdquo;</p>
        <p className="text-[#6B6058] text-sm leading-relaxed">
          Wer seine Grenzen kennt, kann wirklich präsent sein. Dieser Check hilft dir zu verstehen
          was dir nicht verhandelbar ist.
        </p>
        {[
          { q: 'Was ist mir in einer Beziehung absolut nicht verhandelbar?', hint: 'Denk an Werte, Verhalten, Kommunikation.' },
          { q: 'Was brauche ich um mich emotional sicher zu fühlen?', hint: 'Verlässlichkeit, Tempo, Ehrlichkeit, Raum?' },
          { q: 'Wann habe ich früher meine eigenen Grenzen überschritten?', hint: 'Ohne Urteil — nur Wahrnehmung.' },
          { q: 'Wie kommuniziere ich eine Grenze — jetzt, in diesem Moment?', hint: 'Klar, ruhig, direkt.' },
        ].map((item, i) => (
          <div key={i} className="p-3 bg-[#F5F0E8] rounded-xl">
            <p className="text-[#1A1410] text-sm font-medium leading-relaxed">{item.q}</p>
            <p className="text-[#A09888] text-xs mt-1 italic">{item.hint}</p>
          </div>
        ))}
        <p className="text-xs text-[#A09888] italic">Vollständige Reflexion folgt.</p>
      </div>
    ),
  },
  'gedanke-des-tages': {
    title: 'Gedanke des Tages',
    body: (() => {
      const gedanke = getDailyGedanke()
      return (
        <div className="text-center py-4 space-y-4">
          <p className="text-[#6B6058] text-sm">{new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <div className="rounded-2xl p-6" style={{ background: 'var(--bg-indigo)' }}>
            <p className="font-heading text-[22px] italic text-[#FDF5E8] leading-snug">
              &ldquo;{gedanke}&rdquo;
            </p>
          </div>
          <p className="text-xs text-[#A09888] leading-relaxed">
            Täglich wechselnd · ein Gedanke zum bewussten Innehalten.
          </p>
        </div>
      )
    })(),
  },
  'nach-der-begegnung': {
    title: 'Nach der Begegnung',
    body: (
      <div className="space-y-4">
        <p className="font-heading text-xl italic text-[#1A1410]">&ldquo;Was du nach einer Begegnung spürst, sagt mehr als du denkst.&rdquo;</p>
        <p className="text-[#6B6058] text-sm leading-relaxed">
          Eine kurze Reflexionshilfe — direkt danach, wenn der Eindruck noch frisch ist.
        </p>
        {[
          { q: 'Was hat resoniert?', hint: 'Was hat dich wirklich berührt oder überrascht?' },
          { q: 'Was hat sich komisch angefühlt?', hint: 'Kein Urteil — nur beobachten.' },
          { q: 'Wie war meine Energie danach?', hint: 'Aufgeladen, erschöpft, offen, geschlossen?' },
          { q: 'Was möchte ich davon mitnehmen?', hint: 'Eine Erkenntnis, eine Frage, eine Qualität.' },
        ].map((item, i) => (
          <div key={i} className="p-3 bg-[#F5F0E8] rounded-xl">
            <p className="text-[#1A1410] text-sm font-medium">{item.q}</p>
            <p className="text-[#A09888] text-xs mt-0.5 italic">{item.hint}</p>
          </div>
        ))}
        <p className="text-xs text-[#A09888] italic">Vollständiger Guide folgt.</p>
      </div>
    ),
  },
  'wenn-es-schwer-wird': {
    title: 'Wenn es schwer wird',
    body: (
      <div className="space-y-4">
        <p className="font-heading text-xl italic text-[#1A1410]">&ldquo;Es darf schwer sein. Das bedeutet nicht, dass es falsch ist.&rdquo;</p>
        <p className="text-[#6B6058] text-sm leading-relaxed">
          Für Ablehnung, Unsicherheit, Dating-Müdigkeit. Ehrlich, warm, ohne falsche Aufheiterung.
        </p>
        {[
          { titel: 'Wenn du abgelehnt wurdest', text: 'Ablehnung sagt nichts über deinen Wert. Sie sagt: nicht jetzt, nicht hier, nicht diese Person. Das darf trotzdem wehtun.' },
          { titel: 'Wenn du nicht mehr weißt warum', text: 'Dating kann sich sinnlos anfühlen. Das ist kein Zeichen dass du aufgeben sollst — es ist ein Zeichen dass du eine Pause brauchst.' },
          { titel: 'Wenn Müdigkeit kommt', text: 'Chronische Dating-Müdigkeit ist real. Der Körper sendet ein Signal. Hör hin, bevor er lauter werden muss.' },
          { titel: 'Wenn du dich fragst ob es sich lohnt', text: 'Das lohnt sich, weil du dir lohnst. Nicht weil es einfach ist.' },
        ].map((item) => (
          <div key={item.titel} className="p-4 bg-[#F5F0E8] rounded-2xl">
            <p className="font-body font-medium text-[#1A1410] text-sm mb-1.5">{item.titel}</p>
            <p className="text-[#6B6058] text-xs leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>
    ),
  },
  'zwischen-zwei-begegnungen': {
    title: 'Zwischen zwei Begegnungen',
    body: (
      <div className="space-y-4">
        <p className="font-heading text-xl italic text-[#1A1410]">&ldquo;Was du in der Stille findest, bringst du in jede Begegnung mit.&rdquo;</p>
        <p className="text-[#6B6058] text-sm leading-relaxed">
          Über das Warten, die Pause und was sie dir sagen kann — wenn du ihr zuhörst.
        </p>
        {[
          'Statt sofort weiterzusuchen: Was hat die letzte Begegnung in dir bewegt?',
          'Nutze die Stille um zu spüren, was du wirklich willst — nicht was du glaubst suchen zu müssen.',
          'Tue etwas das dir gut tut. Dating beginnt bei dir.',
          'Schreib ins Journal. Was ist gerade echt?',
        ].map((tip, i) => (
          <div key={i} className="flex gap-3 p-3 bg-[#F5F0E8] rounded-xl items-start">
            <span className="text-[#BF9B30] text-base leading-none mt-0.5">✦</span>
            <p className="text-[#1A1410] text-sm leading-relaxed">{tip}</p>
          </div>
        ))}
        <p className="text-xs text-[#A09888] italic">Vollständiger Guide folgt.</p>
      </div>
    ),
  },
  'pause-bewusst-nutzen': {
    title: 'Pause bewusst nutzen',
    body: (
      <div className="space-y-4">
        <p className="font-heading text-xl italic text-[#1A1410]">&ldquo;Pause ist keine Niederlage. Sie ist eine Entscheidung.&rdquo;</p>
        <p className="text-[#6B6058] text-sm leading-relaxed">
          Wenn der Pause-Modus aktiv ist — wie du diese Zeit wirklich für dich nutzt.
        </p>
        {[
          { titel: 'Spür erstmal nach', text: 'Was hat dazu geführt? Müdigkeit, ein bestimmtes Erlebnis, ein inneres Signal?' },
          { titel: 'Ohne Schuldgefühle', text: 'Eine Pause ist kein Versagen. Sie ist bewusstes Selbst-Management.' },
          { titel: 'Was jetzt helfen kann', text: 'Journal schreiben. Einen der Reflexions-Guides nutzen. Dein echtes Leben leben.' },
          { titel: 'Wann du zurückkommst', text: 'Wenn du es willst — nicht wenn du es glaubst zu müssen.' },
        ].map((item) => (
          <div key={item.titel} className="p-3 bg-[#F5F0E8] rounded-xl">
            <p className="font-medium text-[#1A1410] text-sm mb-1">{item.titel}</p>
            <p className="text-[#6B6058] text-xs leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>
    ),
  },
  'bindungstypen-im-dating': {
    title: 'Bindungstypen im Dating',
    body: (
      <div className="space-y-4">
        <p className="font-heading text-xl italic text-[#1A1410]">&ldquo;Wie man liebt, lässt sich erkennen — wenn man weiß, wonach man schaut.&rdquo;</p>
        <p className="text-[#6B6058] text-sm leading-relaxed">
          Wie sich die vier Typen im Dating konkret verhalten — und was das für dich bedeutet.
        </p>
        {[
          { typ: 'Sicher', color: '#2D7A5F', verhalten: 'Kommuniziert klar, lässt Nähe zu, gibt Raum ohne Distanz zu schaffen.' },
          { typ: 'Ängstlich-präoccupiert', color: '#C08080', verhalten: 'Sehr feinfühlig, liest Signale intensiv, braucht Bestätigung um sich sicher zu fühlen.' },
          { typ: 'Vermeidend-distanziert', color: '#3A5F8A', verhalten: 'Wirkt unabhängig, zieht sich bei zu viel Nähe zurück, öffnet sich langsam.' },
          { typ: 'Desorganisiert', color: '#7B4FA6', verhalten: 'Wechselt zwischen Nähe und Distanz, schwer vorhersehbar, oft tiefes Trauma zugrunde.' },
        ].map((b) => (
          <div key={b.typ} className="p-4 bg-[#F5F0E8] rounded-2xl border-l-[3px]" style={{ borderLeftColor: b.color }}>
            <p className="font-body font-medium text-[#1A1410] text-sm mb-1">{b.typ}</p>
            <p className="text-[#6B6058] text-xs leading-relaxed">{b.verhalten}</p>
          </div>
        ))}
        <p className="text-xs text-[#A09888] italic">Vollständiger Artikel folgt.</p>
      </div>
    ),
  },
  'gleiche-menschen': {
    title: 'Warum ich immer die gleichen Menschen anziehe',
    body: (
      <div className="space-y-4">
        <p className="font-heading text-xl italic text-[#1A1410]">&ldquo;Muster wiederholen sich bis sie gesehen werden.&rdquo;</p>
        <p className="text-[#6B6058] text-sm leading-relaxed">
          Über Muster, Projektionen und unbewusste Anziehung. Ehrlich, ohne Schuld — aber klar.
        </p>
        <div className="p-4 bg-[#F5F0E8] rounded-2xl">
          <p className="text-[#1A1410] text-sm leading-relaxed">
            Wir ziehen an, was vertraut ist — nicht was gut für uns ist. Das Nervensystem
            kennt Vertrautheit als Sicherheit, auch wenn sie es nicht ist.
          </p>
        </div>
        <div className="p-4 bg-[#F5F0E8] rounded-2xl">
          <p className="font-medium text-[#1A1410] text-sm mb-1">Was hilft</p>
          <p className="text-[#6B6058] text-xs leading-relaxed">
            Muster benennen ohne sich zu verurteilen. Therapie oder Coaching. Langsamer werden —
            Anziehung hinterfragen bevor man ihr folgt.
          </p>
        </div>
        <p className="text-xs text-[#A09888] italic">Vollständiger Artikel folgt.</p>
      </div>
    ),
  },
  'kunst-des-ersten-gesprächs': {
    title: 'Die Kunst des ersten Gesprächs',
    body: (
      <div className="space-y-4">
        <p className="font-heading text-xl italic text-[#1A1410]">&ldquo;Ein gutes Gespräch beginnt mit echter Neugier.&rdquo;</p>
        {[
          { titel: 'Präsent sein', text: 'Nicht in Bewertungsmodus — sondern wirklich da. Was nimmst du an dieser Person wahr?' },
          { titel: 'Echte Fragen stellen', text: 'Nicht „was machst du so?" — sondern was dich wirklich interessiert.' },
          { titel: 'Sich selbst zeigen', text: 'Verletzlichkeit schafft Verbindung. Teile etwas von dir — authentisch, nicht performativ.' },
          { titel: 'Pausen zulassen', text: 'Stille ist kein Problem. Sie ist Raum.' },
        ].map((item) => (
          <div key={item.titel} className="p-3 bg-[#F5F0E8] rounded-xl">
            <p className="font-medium text-[#1A1410] text-sm mb-1">{item.titel}</p>
            <p className="text-[#6B6058] text-xs">{item.text}</p>
          </div>
        ))}
        <p className="text-xs text-[#A09888] italic">Vollständiger Guide folgt.</p>
      </div>
    ),
  },
  'koerper-und-intuition': {
    title: 'Körper und Intuition',
    body: (
      <div className="space-y-4">
        <p className="font-heading text-xl italic text-[#1A1410]">&ldquo;Dein Körper weiß mehr als du glaubst.&rdquo;</p>
        <p className="text-[#6B6058] text-sm leading-relaxed">
          Körperliche Intelligenz im Dating — was der Körper spürt bevor der Kopf es benennt.
        </p>
        {[
          { signal: 'Weitung im Brustkorb', bedeutung: 'Offenheit, Sicherheit, Resonanz.' },
          { signal: 'Enge im Bauch', bedeutung: 'Alarm, Dissonanz, etwas stimmt nicht.' },
          { signal: 'Erschöpfung nach Begegnungen', bedeutung: 'Energetische Inkompatibilität oder emotionale Anstrengung.' },
          { signal: 'Leichtigkeit', bedeutung: 'Echt, stimmig, sicher.' },
        ].map((item) => (
          <div key={item.signal} className="p-3 bg-[#F5F0E8] rounded-xl flex gap-3">
            <span className="text-[#C4603A] text-lg leading-none mt-0.5">○</span>
            <div>
              <p className="font-medium text-[#1A1410] text-sm">{item.signal}</p>
              <p className="text-[#6B6058] text-xs">{item.bedeutung}</p>
            </div>
          </div>
        ))}
        <p className="text-xs text-[#A09888] italic">Vollständiger Artikel folgt.</p>
      </div>
    ),
  },
  'conscious-dating': {
    title: 'Conscious Dating — was es wirklich bedeutet',
    body: (
      <div className="space-y-4">
        <p className="font-heading text-xl italic text-[#1A1410]">&ldquo;Bewusstes Dating ist keine Perfektion. Es ist Präsenz.&rdquo;</p>
        <p className="text-[#6B6058] text-sm leading-relaxed">
          Was bewusstes Dating ist — und was es nicht ist.
        </p>
        {[
          { titel: 'Was es ist', punkte: ['Sich selbst kennen lernen während man andere kennenlernt.', 'Ehrlichkeit — mit sich und anderen.', 'Präsenz statt Performance.', 'Langsam genug um wirklich zu spüren.'] },
          { titel: 'Was es nicht ist', punkte: ['Perfekt sein oder perfekte Partner finden.', 'Jede Begegnung analysieren.', 'Keine negativen Gefühle haben.', 'Immer "entwickelt" wirken.'] },
        ].map((item) => (
          <div key={item.titel} className="p-4 bg-[#F5F0E8] rounded-2xl">
            <p className="font-body font-medium text-[#1A1410] text-sm mb-2">{item.titel}</p>
            <ul className="space-y-1">
              {item.punkte.map((p) => (
                <li key={p} className="text-[#6B6058] text-xs flex gap-2">
                  <span className="text-[#3A5F8A] mt-0.5">•</span>{p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    ),
  },
  'sternzeichen-beziehungen': {
    title: 'Dein Sternzeichen & Beziehungen',
    body: (
      <div className="space-y-4">
        <p className="font-heading text-xl italic text-[#1A1410]">&ldquo;Was die Sterne zeigen — und was du daraus machst.&rdquo;</p>
        <p className="text-[#6B6058] text-sm leading-relaxed">
          Sternzeichen und Aszendent können interessante Muster beschreiben. Hier: ein nüchterner Blick auf das was dran ist — ohne Mystik, mit echtem Erkenntnisgehalt.
        </p>
        {[
          { sign: 'Feuerzeichen', signs: 'Widder · Löwe · Schütze', text: 'Direkt, leidenschaftlich, manchmal ungeduldig. In Beziehungen: sie initiieren gerne, brauchen aber Raum für Autonomie.' },
          { sign: 'Erdzeichen', signs: 'Stier · Jungfrau · Steinbock', text: 'Verlässlich, beständig, körpernah. In Beziehungen: aufgebaut auf Vertrauen und konkreten Gesten.' },
          { sign: 'Luftzeichen', signs: 'Zwillinge · Waage · Wassermann', text: 'Kommunikativ, neugierig, manchmal distanziert. In Beziehungen: intellektuelle Verbindung ist genauso wichtig wie emotionale.' },
          { sign: 'Wasserzeichen', signs: 'Krebs · Skorpion · Fische', text: 'Tief fühlend, intuitiv, intensiv. In Beziehungen: sie suchen echte Tiefe — und brauchen emotionale Sicherheit.' },
        ].map((b) => (
          <div key={b.sign} className="p-4 bg-[#F5F0E8] rounded-2xl">
            <p className="font-body font-medium text-[#1A1410] text-sm mb-0.5">{b.sign}</p>
            <p className="text-[#A09888] text-[11px] mb-1.5 uppercase tracking-wide">{b.signs}</p>
            <p className="text-[#6B6058] text-xs leading-relaxed">{b.text}</p>
          </div>
        ))}
        <p className="text-xs text-[#A09888] italic">Vollständiger Artikel folgt.</p>
      </div>
    ),
  },
  'von-coaches': {
    title: 'Von Coaches',
    body: (
      <div className="space-y-4">
        <p className="text-[#6B6058] text-sm leading-relaxed">
          Kurze Inhalte von Community-Coaches — Holistic Tantra und anderen Partnern.
          Erscheinen mit Coach-Name und Community-Badge.
        </p>
        <div className="p-5 bg-[#F5F0E8] rounded-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#7B4FA6] flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-body font-medium text-[#1A1410] text-sm">Anna & Yves</p>
              <p className="text-[#A09888] text-xs">Holistic Tantra</p>
            </div>
          </div>
          <p className="text-[#6B6058] text-sm leading-relaxed italic">
            &ldquo;Erste Gastbeiträge erscheinen mit dem nächsten Update.&rdquo;
          </p>
        </div>
        <p className="text-xs text-[#A09888] italic">Coach-Beiträge folgen in Phase 2.</p>
      </div>
    ),
  },
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
  const [activeTab, setActiveTab] = useState('kenne-dich-selbst')
  const [openModal, setOpenModal] = useState<string | null>(null)
  const dailyGedanke = getDailyGedanke()

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
      setMainTab('journal')
    }
  }, [])

  function canAccess(item: ContentItem): boolean {
    if (item.access === 'free') return true
    if (item.access === 'membership') return tier !== 'free'
    if (item.access === 'premium') return tier === 'premium'
    return false
  }

  function handleOpen(item: ContentItem) {
    if (!canAccess(item)) {
      toastLib('Upgrade erforderlich')
      return
    }
    setOpenModal(item.id)
  }

  function tagColor(access: ContentItem['access']) {
    if (access === 'free') return 'bg-[rgba(45,122,95,0.12)] text-[#2D7A5F]'
    if (access === 'membership') return 'bg-[rgba(122,62,30,0.12)] text-[#4A2010]'
    if (access === 'premium') return 'bg-[rgba(123,79,166,0.12)] text-[#5B3A8A]'
    return 'bg-[rgba(122,62,30,0.07)] text-[#6B6058]'
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
      <div className="max-w-2xl mx-auto min-h-screen bg-[#FDF5E8] flex flex-col">
        <div className="flex items-center gap-3 px-4 pt-5 pb-4">
          <button
            onClick={() => { setWritingMode(false); setDraft('') }}
            className="w-9 h-9 rounded-full bg-white border border-[rgba(30,20,10,0.08)] flex items-center justify-center text-[#6B6058]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-[#6B6058] font-body text-sm">Dein Journal</span>
        </div>
        {draftPrompt && (
          <div className="mx-4 mb-5 rounded-2xl p-5" style={{ background: 'var(--bg-indigo)' }}>
            <p className="font-heading text-lg italic text-[#FDF5E8]/80 leading-snug">
              &ldquo;{draftPrompt}&rdquo;
            </p>
          </div>
        )}
        <div className="flex-1 px-4">
          <textarea
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Schreib, was dir gerade in den Sinn kommt…"
            className="w-full h-64 bg-white rounded-2xl p-5 text-sm font-body text-[#1A1410] placeholder:text-[#A09888] leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-[#7A3E1E]/20"
            style={{ boxShadow: '0 2px 16px rgba(26,20,16,0.07)' }}
          />
          <p className="text-right text-xs text-[#A09888] mt-2 font-body">{draft.length} Zeichen</p>
        </div>
        <div className="px-4 pb-10 pt-4">
          <button
            onClick={saveEntry}
            disabled={!draft.trim() || saving}
            className="w-full py-4 rounded-full bg-[#7A3E1E] text-[#FDF5E8] font-body text-[14px] tracking-wide flex items-center justify-center gap-2 disabled:opacity-40 transition-opacity"
          >
            {saving ? <span className="opacity-60">Speichern…</span> : <><Check className="w-4 h-4" />Eintrag speichern</>}
          </button>
        </div>
      </div>
    )
  }

  // ── Entry detail view ──
  if (openEntry) {
    return (
      <div className="max-w-2xl mx-auto min-h-screen bg-[#FDF5E8] flex flex-col">
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
            <p className="font-heading text-lg italic text-[#FDF5E8]/80 leading-snug">
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

        {/* Main tab toggle: Journal | Für dich */}
        <div className="flex gap-1 bg-[rgba(122,62,30,0.06)] rounded-full p-1 w-full">
          <button
            onClick={() => setMainTab('journal')}
            className={cn(
              'flex-1 px-4 py-2 rounded-full text-sm font-body transition-all',
              mainTab === 'journal' ? 'bg-[#7A3E1E] text-[#FDF5E8]' : 'text-[#6B6058]'
            )}
          >
            Journal
          </button>
          <button
            onClick={() => setMainTab('content')}
            className={cn(
              'flex-1 px-4 py-2 rounded-full text-sm font-body transition-all',
              mainTab === 'content' ? 'bg-[#7A3E1E] text-[#FDF5E8]' : 'text-[#6B6058]'
            )}
          >
            Für dich
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
              <div className="rounded-2xl p-5 mb-6 bg-white" style={{ boxShadow: '0 4px 24px rgba(26,20,16,0.10)' }}>
                <div className="flex items-start gap-4 mb-4">
                  <span className="text-3xl leading-none mt-0.5">{cfg.icon}</span>
                  <div className="flex-1">
                    <p className="text-[#1A1410] leading-snug mb-2" style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '20px' }}>
                      {cfg.title}
                    </p>
                    <p className="text-[#6B6058] text-sm leading-relaxed" style={{ fontFamily: 'var(--font-body)', fontWeight: 300 }}>
                      {cfg.body}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => { dismiss(); startWriting(cfg.journalPrompt) }}
                    className="flex-1 py-2.5 rounded-full bg-[#7A3E1E] text-[#FDF5E8] font-body text-[13px] transition-opacity hover:opacity-90">
                    {cfg.positive ? 'Das freut mich ✦' : 'Im Journal erforschen →'}
                  </button>
                  <button onClick={dismiss}
                    className="px-4 py-2.5 rounded-full border border-[rgba(122,62,30,0.20)] text-[#6B6058] font-body text-[13px] transition-colors hover:border-[#7A3E1E]/40">
                    Danke, ich weiß
                  </button>
                </div>
              </div>
            )
          })()}

          {/* Daily prompt card */}
          <div className="rounded-2xl p-6 mb-6 relative overflow-hidden" style={{ background: 'var(--bg-indigo)' }}>
            <p className="font-body text-[11px] uppercase tracking-[0.14em] text-[#FDF5E8]/45 mb-3">Tagesimpuls</p>
            <p className="font-heading text-[22px] italic text-[#FDF5E8] leading-snug mb-5">
              &ldquo;{dailyPrompt}&rdquo;
            </p>
            <button onClick={() => startWriting(dailyPrompt)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#FDF5E8] text-[#7A3E1E] font-body text-[13px] transition-opacity hover:opacity-90">
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
                <button key={entry.id} onClick={() => setOpenEntry(entry)}
                  className="w-full text-left bg-white rounded-2xl px-5 py-4 transition-all active:scale-[0.98]"
                  style={{ boxShadow: '0 2px 12px rgba(26,20,16,0.07)' }}>
                  <p className="text-[#6B6058] font-body text-[11px] uppercase tracking-[0.12em] mb-1.5">
                    {formatDate(entry.created_at)}
                  </p>
                  {entry.prompt && (
                    <p className="font-heading text-base italic text-[#A09888] mb-1 leading-snug line-clamp-1">{entry.prompt}</p>
                  )}
                  <p className="font-heading text-[18px] text-[#1A1410] leading-snug line-clamp-2">{entry.content}</p>
                </button>
              ))}
            </div>
          )}

          {/* FAB */}
          <button onClick={() => startWriting('')}
            className="fixed bottom-24 right-5 md:bottom-8 md:right-8 w-14 h-14 rounded-full bg-[#7A3E1E] flex items-center justify-center z-30 transition-transform active:scale-95"
            style={{ boxShadow: '0 4px 20px rgba(122,62,30,0.35)' }}>
            <Plus className="w-6 h-6 text-[#FDF5E8]" />
          </button>
        </div>
      )}

      {/* ── CONTENT TAB ── */}
      {mainTab === 'content' && (
        <div className="px-4">

          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-hide">
            {CONTENT_SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveTab(s.id)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-body whitespace-nowrap transition-all',
                  activeTab === s.id
                    ? 'bg-[#7A3E1E] text-[#FDF5E8]'
                    : 'border border-[rgba(122,62,30,0.15)] text-[#6B6058] hover:border-[#7A3E1E]/40'
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

              {/* Special: Gedanke des Tages featured card (Begleitung only) */}
              {activeTab === 'begleitung' && (
                <button
                  onClick={() => handleOpen(activeSection.items.find(i => i.id === 'gedanke-des-tages')!)}
                  className="w-full text-left rounded-2xl overflow-hidden active:scale-[0.98] transition-transform duration-150"
                  style={{ background: 'var(--bg-indigo)' }}
                >
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[#BF9B30] text-base">✦</span>
                      <p className="font-body text-[11px] uppercase tracking-[0.14em] text-[#FDF5E8]/50">Gedanke des Tages</p>
                      <span className="ml-auto text-[10px] font-body px-2 py-0.5 rounded-full bg-[rgba(45,122,95,0.25)] text-[#7EB89A]">Kostenlos</span>
                    </div>
                    <p className="font-heading text-[22px] italic text-[#FDF5E8] leading-snug mb-4">
                      &ldquo;{dailyGedanke}&rdquo;
                    </p>
                    <p className="text-[#FDF5E8]/40 font-body text-xs">Täglich wechselnd</p>
                  </div>
                </button>
              )}

              {/* Regular content cards */}
              {activeSection.items
                .filter(item => !(activeTab === 'begleitung' && item.id === 'gedanke-des-tages'))
                .map((item) => {
                  const accessible = canAccess(item)
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleOpen(item)}
                      className={cn(
                        'bg-white rounded-2xl p-5 w-full text-left flex gap-4 items-start transition-all active:scale-[0.98] duration-150',
                        !accessible && 'opacity-60'
                      )}
                      style={{ boxShadow: '0 2px 12px rgba(26,20,16,0.07)' }}
                    >
                      {/* Icon */}
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: accessible ? (ICON_BG[item.id] ?? '#7A3E1E') : 'rgba(122,62,30,0.10)',
                          color: '#FFFFFF',
                        }}
                      >
                        {item.icon}
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 flex-wrap mb-0.5">
                          <h3 className="font-heading text-[20px] text-[#1A1410] leading-tight">{item.title}</h3>
                        </div>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-[10px] font-body text-[#A09888] uppercase tracking-wide">{item.format}</span>
                          {item.tag && (
                            <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-body font-medium', tagColor(item.access))}>
                              {item.tag}
                            </span>
                          )}
                        </div>
                        <p className="text-[#6B6058] font-body text-sm leading-relaxed">{item.description}</p>
                      </div>

                      {/* Action icon */}
                      <div className="flex-shrink-0 mt-1">
                        {accessible
                          ? <ChevronRight className="w-4 h-4 text-[#A09888]" />
                          : <Lock className="w-4 h-4 text-[#C0B0A0]" />
                        }
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
