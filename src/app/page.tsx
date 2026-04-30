import Link from 'next/link'
import { Sparkles, Users, Heart, Check, Lock, ExternalLink } from 'lucide-react'
import { SajaLogo } from '@/components/ui/SajaLogo'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <SajaLogo size="md" />
        <div className="flex items-center gap-4">
          <Link href="/login" className="btn-ghost text-sm py-2">
            Anmelden
          </Link>
          <Link href="/register" className="btn-primary text-sm py-2">
            Kostenlos starten
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-32 text-center">
        <p className="text-[#221080] font-body text-sm uppercase tracking-widest mb-6">
          Bewusstes Dating
        </p>
        <h1 className="font-heading text-6xl md:text-7xl font-light text-[#1A1410] leading-tight mb-8">
          Bewusstes Dating
          <br />
          <em>für echte Verbindung</em>
        </h1>
        <p className="font-body text-lg text-[#6B6058] max-w-2xl mx-auto mb-12 leading-relaxed">
          Saja bringt bewusste Menschen zusammen —
          für tiefe Begegnungen, die wirklich zählen. Keine unendlichen Swipes,
          keine oberflächlichen Matches.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register" className="btn-primary text-base px-10 py-4">
            Jetzt kostenlos registrieren
          </Link>
          <Link href="#wie-es-funktioniert" className="btn-secondary text-base px-10 py-4">
            Wie es funktioniert
          </Link>
        </div>
        <p className="text-[#A09888] text-xs mt-10">Saja · Bewusstes Dating</p>
      </section>

      {/* One Connection Rule */}
      <section className="bg-[#221080] text-[#FDF8F2] py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Sparkles className="w-8 h-8 text-[#221080] mx-auto mb-6" />
          <h2 className="font-heading text-5xl font-light mb-6">
            The One Connection Rule
          </h2>
          <p className="font-body text-[#FDF8F2]/70 text-lg max-w-2xl mx-auto leading-relaxed">
            Bei Saja bist du immer nur mit <strong className="text-[#221080]">einer Person gleichzeitig</strong> in
            der Begegnung. Volle Aufmerksamkeit, echte Präsenz — so entstehen
            tiefe Verbindungen.
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="wie-es-funktioniert" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-heading text-5xl font-light text-center text-[#1A1410] mb-16">
            Wie es funktioniert
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="w-8 h-8 text-[#221080]" />,
                title: 'Profil erstellen',
                desc: 'Teile deine Werte, deinen Bindungstyp und was du wirklich suchst. Tiefgang statt Oberfläche.',
              },
              {
                icon: <Heart className="w-8 h-8 text-[#221080]" />,
                title: 'Bewusst swipen',
                desc: 'Entdecke Profile, die wirklich zu dir passen. Bei gegenseitigem Interesse entsteht ein Match.',
              },
              {
                icon: <Sparkles className="w-8 h-8 text-[#221080]" />,
                title: 'Begegnung starten',
                desc: 'Taucht gemeinsam in die Begegnung ein — mit Tiefenfragen, Frage des Tages und vollem Fokus.',
              },
            ].map((f) => (
              <div key={f.title} className="card text-center">
                <div className="flex justify-center mb-5">{f.icon}</div>
                <h3 className="font-heading text-2xl text-[#1A1410] mb-3">{f.title}</h3>
                <p className="font-body text-[#6B6058] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="bg-[#EDE8E0] py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-heading text-5xl font-light text-center text-[#1A1410] mb-4">
            Dein Zugang
          </h2>
          <p className="text-center text-[#6B6058] font-body mb-16 max-w-xl mx-auto">
            Starte kostenlos und entscheide selbst, wie tief du eintauchen möchtest.
          </p>

          <div className="grid md:grid-cols-3 gap-6 items-start">

            {/* KOSTENLOS */}
            <div className="card border-2 border-[rgba(30,20,10,0.08)]/80">
              <p className="text-xs text-[#A09888] uppercase tracking-widest mb-2">Einstieg</p>
              <h3 className="font-heading text-3xl text-[#1A1410] mb-1">Kostenlos</h3>
              <div className="mb-1">
                <span className="font-heading text-4xl text-[#1A1410]">0 €</span>
              </div>
              <p className="text-[#6B6058] text-sm mb-6">Lerne dich selbst kennen — bevor du jemand anderen kennenlernst.</p>

              <ul className="space-y-3 mb-8">
                {[
                  { text: 'Profil erstellen', included: true },
                  { text: 'Quiz: Was hält mich zurück?', included: true },
                  { text: 'Einblick in die App', included: true },
                  { text: 'Swipen & Matches', included: false },
                  { text: 'Begegnung & Chat', included: false },
                  { text: 'Tests & Guides', included: false },
                ].map((item) => (
                  <li key={item.text} className={`flex items-start gap-2.5 text-sm ${item.included ? 'text-[#1A1410]' : 'text-[#A09888]'}`}>
                    {item.included
                      ? <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                      : <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    }
                    {item.text}
                  </li>
                ))}
              </ul>

              <Link href="/register" className="btn-secondary w-full text-center text-sm py-3 block">
                Kostenlos starten
              </Link>
            </div>

            {/* MITGLIEDSCHAFT */}
            <div className="card border-2 border-primary shadow-xl scale-[1.03] relative">
              <p className="text-xs text-[#221080] font-medium uppercase tracking-widest mb-2">Empfohlen</p>
              <h3 className="font-heading text-3xl text-[#1A1410] mb-1">Mitgliedschaft</h3>
              <div className="mb-1 flex items-end gap-1.5">
                <span className="font-heading text-4xl text-[#1A1410]">29 €</span>
                <span className="text-[#A09888] text-sm mb-1">/Monat</span>
              </div>
              <p className="text-xs text-[#A09888] mb-4">oder 290 €/Jahr — spare 2 Monate</p>
              <p className="text-[#6B6058] text-sm mb-6">Alle App-Funktionen plus das Wissen, das echte Verbindung ermöglicht.</p>

              <ul className="space-y-3 mb-8">
                {[
                  'Swipen & Profile entdecken',
                  'Matches & Begegnung',
                  'One Connection Rule',
                  'Bindungstyp-Test',
                  'Love Language Quiz',
                  'Beziehungsmodell-Check',
                  'Alles aus Kostenlos',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-[#1A1410]">
                    <Check className="w-4 h-4 text-[#221080] flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link href="/pricing" className="btn-primary w-full text-center text-sm py-3 block">
                Mitglied werden
              </Link>
            </div>

            {/* PREMIUM */}
            <div className="card border-2 border-dark/20">
              <p className="text-xs text-[#221080] font-medium uppercase tracking-widest mb-2">Empfohlen</p>
              <h3 className="font-heading text-3xl text-[#1A1410] mb-1">Premium</h3>
              <div className="mb-1 flex items-end gap-1.5">
                <span className="font-heading text-4xl text-[#1A1410]">69 €</span>
                <span className="text-[#A09888] text-sm mb-1">/Monat</span>
              </div>
              <p className="text-xs text-[#A09888] mb-4">oder 690 €/Jahr — spare 2 Monate</p>
              <p className="text-[#6B6058] text-sm mb-6">Coaching, Community & Tiefgang — für alle, die bewusstes Dating wirklich leben wollen.</p>

              <ul className="space-y-3 mb-8">
                {[
                  { text: 'Frage des Tages im Chat' },
                  { text: '36 Fragen der Nähe' },
                  { text: 'Meditations-Audio zur Vorbereitung' },
                  { text: 'Guide: Bewusstes erstes Treffen' },
                  { text: 'Wöchentliche Impulse & Rituale' },
                  { text: 'Mini-Coaching Inhalte' },
                  { text: 'Community-Gruppen', highlight: true },
                  { text: 'Alles aus Mitgliedschaft' },
                ].map((f) => (
                  <li key={f.text} className={`flex items-start gap-2.5 text-sm ${f.highlight ? 'text-[#1A1410] font-medium' : 'text-[#1A1410]'}`}>
                    <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${f.highlight ? 'text-[#221080]' : 'text-[#1A1410]/50'}`} />
                    {f.text}
                  </li>
                ))}
              </ul>

              <Link href="/pricing" className="btn-secondary w-full text-center text-sm py-3 block">
                Premium starten
              </Link>
            </div>

          </div>

          {/* Jahresabo Hinweis */}
          <div className="mt-10 bg-[#FDF8F2] rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-medium text-[#1A1410] text-sm">Jährlich zahlen — 2 Monate gratis</p>
              <p className="text-[#6B6058] text-sm mt-0.5">
                Mitgliedschaft: 290 €/Jahr (statt 348 €) · Premium: 690 €/Jahr (statt 828 €)
              </p>
            </div>
            <Link href="/pricing" className="btn-primary text-sm py-2.5 px-6 flex-shrink-0">
              Jetzt sparen
            </Link>
          </div>

          <p className="text-center mt-6 text-sm text-[#A09888]">
            14 Tage Geld-zurück-Garantie · Keine versteckten Kosten ·{' '}
            <Link href="/pricing" className="text-[#221080] hover:underline">Alle Pakete & Preise ansehen</Link>
          </p>
        </div>
      </section>

      {/* Einmalig kaufbar */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs text-[#A09888] uppercase tracking-widest mb-2">Ohne Abo-Bindung</p>
            <h2 className="font-heading text-4xl font-light text-[#1A1410] mb-3">Einmalig kaufbar</h2>
            <p className="text-[#6B6058] max-w-lg mx-auto">
              Einmal kaufen — für immer in deinem Konto verfügbar. Unabhängig vom Abo.
            </p>
          </div>

          {/* Saja Guides */}
          <h3 className="font-heading text-2xl text-[#1A1410] mb-5">Saja Guides</h3>
          <div className="grid md:grid-cols-3 gap-4 mb-12">
            {[
              { title: 'Werte & Zukunft abgleichen', desc: 'Wie passen eure Lebensziele und Werte zusammen? Ein tiefer Selbst- und Paarcheck.', price: '49 €' },
              { title: 'Bedürfnisse & Grenzen', desc: 'Lerne, deine Bedürfnisse klar zu benennen und Grenzen liebevoll zu setzen.', price: '49 €' },
              { title: 'Konflikt als Wachstum', desc: 'Wie ihr als Paar aus Konflikten gestärkt hervorgeht — konkrete Tools und Reflexionen.', price: '49 €' },
            ].map((g) => (
              <div key={g.title} className="card border border-[rgba(30,20,10,0.08)]/80">
                <span className="inline-block bg-[#FDF8F2] text-[#221080] text-xs px-2.5 py-1 rounded-full mb-3 font-medium">Saja Guide</span>
                <h4 className="font-heading text-xl text-[#1A1410] mb-2">{g.title}</h4>
                <p className="text-[#1A1410]/55 text-sm leading-relaxed mb-5">{g.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="font-heading text-2xl text-[#1A1410]">{g.price}</span>
                  <Link href="/pricing" className="btn-primary text-xs py-2 px-4">Kaufen</Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <h2 className="font-heading text-5xl font-light text-[#1A1410] mb-6">
          Bereit für echte Verbindung?
        </h2>
        <p className="font-body text-[#6B6058] mb-10 max-w-lg mx-auto">
          Starte kostenlos und erlebe, wie bewusstes Dating sich anfühlt.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register" className="btn-primary text-base px-12 py-4">
            Jetzt kostenlos starten
          </Link>
          <Link href="/pricing" className="btn-secondary text-base px-12 py-4">
            Pakete ansehen
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[rgba(30,20,10,0.08)] py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <SajaLogo size="sm" />
          <div className="flex gap-6 text-sm text-[#6B6058]">
            <Link href="/datenschutz" className="hover:text-[#221080] transition-colors">
              Datenschutz
            </Link>
            <Link href="/impressum" className="hover:text-[#221080] transition-colors">
              Impressum
            </Link>
            <Link href="/agb" className="hover:text-[#221080] transition-colors">
              AGB
            </Link>
          </div>
          <p className="text-xs" style={{ color: '#9C9088' }}>© 2026 Saja</p>
        </div>
      </footer>
    </div>
  )
}
