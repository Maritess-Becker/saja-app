import Link from 'next/link'
import { SajaLogo } from '@/components/ui/SajaLogo'

export default function AgbPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="px-6 py-5 max-w-4xl mx-auto flex items-center gap-2">
        <Link href="/"><SajaLogo size="sm" /></Link>
      </nav>
      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="font-heading text-5xl text-dark mb-8">Allgemeine Geschäftsbedingungen</h1>
        <div className="text-text/70 space-y-4">
          <p className="text-primary font-medium">Platzhalter — wird vor Launch vervollständigt.</p>
          <p>Diese AGB regeln die Nutzung der Plattform Saja.</p>
          <h2 className="font-heading text-2xl text-dark">§ 1 Geltungsbereich</h2>
          <p>Diese AGB gelten für alle Nutzer der Plattform Saja.</p>
          <h2 className="font-heading text-2xl text-dark">§ 2 Leistungen</h2>
          <p>Saja stellt eine Online-Plattform zur Verfügung, die es Nutzern ermöglicht,
          sich kennenzulernen und miteinander zu kommunizieren.</p>
        </div>
      </main>
    </div>
  )
}
