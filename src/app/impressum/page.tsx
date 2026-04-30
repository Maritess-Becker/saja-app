import Link from 'next/link'
import { SajaLogo } from '@/components/ui/SajaLogo'

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="px-6 py-5 max-w-4xl mx-auto flex items-center gap-2">
        <Link href="/"><SajaLogo size="sm" /></Link>
      </nav>
      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="font-heading text-5xl text-[#1A1410] mb-8">Impressum</h1>
        <div className="text-[#1A1410] space-y-4">
          <p className="text-[#1A1410] font-medium">Platzhalter — wird vor Launch vervollständigt.</p>
          <p>Angaben gemäß § 5 TMG</p>
          <p>[Name]<br />[Straße Hausnummer]<br />[PLZ Ort]</p>
          <p>E-Mail: [folgt]</p>
        </div>
      </main>
    </div>
  )
}
