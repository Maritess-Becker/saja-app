import Link from 'next/link'
import { SajaLogo } from '@/components/ui/SajaLogo'

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="px-6 py-5 max-w-4xl mx-auto flex items-center gap-2">
        <Link href="/"><SajaLogo size="sm" /></Link>
      </nav>
      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="font-heading text-5xl text-[#1A1410] mb-8">Datenschutzerklärung</h1>
        <div className="prose prose-sm text-[#1A1410] space-y-4">
          <p className="text-[#1A1410] font-medium">Platzhalter — wird vor Launch vervollständigt.</p>
          <p>
            Diese Datenschutzerklärung informiert dich über die Verarbeitung deiner personenbezogenen Daten
            bei der Nutzung von Saja gemäß DSGVO (EU) 2016/679.
          </p>
          <h2 className="font-heading text-2xl text-[#1A1410]">Verantwortliche Stelle</h2>
          <p>[Name und Adresse folgen]</p>
          <h2 className="font-heading text-2xl text-[#1A1410]">Erhobene Daten</h2>
          <p>E-Mail-Adresse, Profildaten (Name, Alter, Fotos, Bio etc.), Nutzungsverhalten auf der Plattform.</p>
          <h2 className="font-heading text-2xl text-[#1A1410]">Deine Rechte</h2>
          <p>
            Du hast jederzeit das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung,
            Datenübertragbarkeit und Widerspruch. Wende dich dafür an: [E-Mail folgt]
          </p>
        </div>
      </main>
    </div>
  )
}
