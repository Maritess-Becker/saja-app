'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Heart } from 'lucide-react'
import { SajaLogo } from '@/components/ui/SajaLogo'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [mode, setMode] = useState<'password' | 'magic'>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [magicSent, setMagicSent] = useState(false)

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
    } else {
      router.push('/discover')
      router.refresh()
    }
    setLoading(false)
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
      },
    })
    if (error) {
      toast.error(error.message)
    } else {
      setMagicSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex justify-center mb-6">
            <SajaLogo size="lg" showTagline={true} />
          </Link>
          <h1 className="font-heading text-4xl font-light text-[#1A1410]">Willkommen zurück</h1>
          <p className="text-[#6B6058] mt-2 font-body">Schön, dich wieder zu sehen.</p>
        </div>

        <div className="card">
          {/* Mode Toggle */}
          <div className="flex rounded-xl bg-[#EDE8E0] p-1 mb-8">
            <button
              onClick={() => setMode('password')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'password' ? 'bg-white text-[#1A1410] shadow-sm' : 'text-[#6B6058]'
              }`}
            >
              Passwort
            </button>
            <button
              onClick={() => setMode('magic')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'magic' ? 'bg-white text-[#1A1410] shadow-sm' : 'text-[#6B6058]'
              }`}
            >
              Magic Link
            </button>
          </div>

          {magicSent ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-[#FDF8F2] rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-[#221080]" />
              </div>
              <h3 className="font-heading text-2xl text-[#1A1410] mb-2">Link gesendet!</h3>
              <p className="text-[#6B6058] text-sm">
                Schau in dein Postfach ({email}) und klicke auf den Link zum Anmelden.
              </p>
            </div>
          ) : (
            <form onSubmit={mode === 'password' ? handlePasswordLogin : handleMagicLink}>
              <div className="space-y-4">
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

                {mode === 'password' && (
                  <div>
                    <label className="label">Passwort</label>
                    <input
                      type="password"
                      className="input"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full mt-2"
                >
                  {loading
                    ? 'Einen Moment...'
                    : mode === 'password'
                    ? 'Anmelden'
                    : 'Magic Link senden'}
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-[#6B6058] text-sm mt-6">
          Noch kein Konto?{' '}
          <Link href="/register" className="text-[#221080] hover:underline">
            Jetzt registrieren
          </Link>
        </p>
      </div>
    </div>
  )
}
