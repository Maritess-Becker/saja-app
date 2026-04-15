import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppNav } from '@/components/layout/AppNav'
import Link from 'next/link'
import { Heart, Edit, Shield, Star } from 'lucide-react'

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const { data: userData } = await supabase
    .from('users')
    .select('subscription_tier')
    .eq('id', user.id)
    .single()

  const tier = userData?.subscription_tier ?? 'free'

  const tierLabel: Record<string, string> = {
    free: 'Kostenlos',
    membership: 'Mitgliedschaft',
    premium: 'Premium',
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="md:pl-64 pb-20 md:pb-0">
        <div className="max-w-2xl mx-auto px-4 pt-8">
          <h1 className="font-heading text-3xl text-dark mb-8">Mein Profil</h1>

          {/* Profile card */}
          <div className="card mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-2xl bg-sand flex items-center justify-center overflow-hidden">
                {profile?.photos?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.photos[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Heart className="w-10 h-10 text-primary/30" />
                )}
              </div>
              <div>
                <h2 className="font-heading text-2xl text-dark">
                  {profile?.name ?? 'Kein Name'}
                  {profile?.age && !profile?.hide_age ? `, ${profile.age}` : ''}
                </h2>
                {profile?.location && !profile?.hide_location && (
                  <p className="text-text/40 text-sm">{profile.location}</p>
                )}
                <span className={`inline-block mt-1 text-xs px-2.5 py-1 rounded-full ${
                  tier === 'premium' ? 'bg-dark text-light' :
                  tier === 'membership' ? 'bg-primary text-white' :
                  'bg-sand text-text/60'
                }`}>
                  {tierLabel[tier]}
                </span>
              </div>
              <Link href="/onboarding" className="ml-auto btn-ghost text-sm flex items-center gap-1.5 py-2 px-3">
                <Edit className="w-4 h-4" /> Bearbeiten
              </Link>
            </div>

            {profile?.bio && (
              <p className="text-text/60 text-sm leading-relaxed mb-4">{profile.bio}</p>
            )}

            {profile?.interests && profile.interests.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((i: string) => (
                  <span key={i} className="text-xs bg-sand text-text/60 px-2.5 py-1 rounded-full">{i}</span>
                ))}
              </div>
            )}
          </div>

          {/* Upgrade */}
          {tier !== 'premium' && (
            <div className="bg-dark rounded-2xl p-6 mb-6 text-light">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-5 h-5 text-primary" />
                <span className="font-heading text-xl">Premium freischalten</span>
              </div>
              <p className="text-light/60 text-sm mb-4 leading-relaxed">
                Love Language Test, 36 Fragen, 50 Tiefen-Fragen, Kompatibilitäts-Score und mehr.
              </p>
              <button className="btn-primary text-sm py-2.5">
                Upgrade — Preise folgen
              </button>
            </div>
          )}

          {/* Settings */}
          <div className="card space-y-3">
            <h3 className="font-heading text-xl text-dark mb-1">Einstellungen</h3>
            {[
              { label: 'Datenschutz', icon: Shield, href: '/datenschutz' },
              { label: 'Impressum', icon: Shield, href: '/impressum' },
            ].map(({ label, icon: Icon, href }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-3 text-text/60 hover:text-text transition-colors text-sm py-1"
              >
                <Icon className="w-4 h-4" /> {label}
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
