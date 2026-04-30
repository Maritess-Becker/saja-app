'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail } from 'lucide-react'
import { SajaLogo } from '@/components/ui/SajaLogo'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      toast.error('Passwörter stimmen nicht überein.')
      return
    }
    if (password.length < 8) {
      toast.error('Passwort muss mindestens 8 Zeichen haben.')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
      },
    })
    if (error) {
      toast.error(error.message)
    } else {
      setDone(true)
    }
    setLoading(false)
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-indigo)' }}>
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-[rgba(253,248,242,0.10)] rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-10 h-10 text-[#FDF8F2]/70" />
          </div>
          <h1 className="font-heading text-4xl text-[#FDF8F2] mb-4">Fast geschafft!</h1>
          <p className="text-[#FDF8F2]/50 leading-relaxed font-body text-sm">
            Wir haben dir eine Bestätigungs-E-Mail an{' '}
            <strong className="text-[#FDF8F2]/80">{email}</strong> gesendet.
            Bitte bestätige deine Adresse, um mit dem Onboarding zu beginnen.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: 'var(--bg-indigo)' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex justify-center mb-6">
            <SajaLogo size="lg" showTagline={true} />
          </Link>
          <h1 className="font-heading text-4xl font-light text-[#FDF8F2]">Konto erstellen</h1>
          <p className="text-[#FDF8F2]/50 mt-2 font-body text-sm">Kostenlos und unverbindlich starten.</p>
        </div>

        <div className="card">
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="label">E-Mail-Adresse</label>
              <input
                type="email"
                className="input"
                placeholder="du@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Passwort</label>
              <input
                type="password"
                className="input"
                placeholder="Mindestens 8 Zeichen"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Passwort bestätigen</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>

            <p className="text-xs text-[#FDF8F2]/30 leading-relaxed font-body">
              Mit der Registrierung stimmst du unseren{' '}
              <Link href="/agb" className="text-[#FDF8F2]/60 hover:text-[#FDF8F2]/80 underline underline-offset-2 transition-colors">AGB</Link> und der{' '}
              <Link href="/datenschutz" className="text-[#FDF8F2]/60 hover:text-[#FDF8F2]/80 underline underline-offset-2 transition-colors">Datenschutzerklärung</Link> zu.
            </p>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Registrierung...' : 'Konto erstellen'}
            </button>
          </form>
        </div>

        <p className="text-center text-[#FDF8F2]/40 text-sm mt-6 font-body">
          Bereits registriert?{' '}
          <Link href="/login" className="text-[#FDF8F2]/80 hover:text-[#FDF8F2] underline underline-offset-2 transition-colors">
            Anmelden
          </Link>
        </p>
      </div>
    </div>
  )
}
