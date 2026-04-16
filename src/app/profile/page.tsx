import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppNav } from '@/components/layout/AppNav'
import Link from 'next/link'
import { Edit, Shield, Star, User, Bell, LogOut, ChevronRight } from 'lucide-react'
import { photoUrl } from '@/lib/utils'

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

  const settingsItems = [
    { label: 'Konto', icon: User, href: '#' },
    { label: 'Benachrichtigungen', icon: Bell, href: '#' },
    { label: 'Abonnement', icon: Star, href: '/pricing' },
    { label: 'Datenschutz', icon: Shield, href: '/datenschutz' },
    { label: 'Impressum', icon: Shield, href: '/impressum' },
    { label: 'Abmelden', icon: LogOut, href: '#', danger: true },
  ]

  return (
    <div className="min-h-screen bg-[#FAF8F4]">
      <AppNav />
      <main className="md:pl-64 pb-20 md:pb-0">
        <div className="max-w-2xl mx-auto px-4 pt-8 pb-32">
          <h1 className="font-heading text-[52px] font-light text-[#1A1410] tracking-[-0.5px] leading-none mb-8">Mein Profil</h1>

          {/* Profile card */}
          <div className="bg-white rounded-2xl border border-[#E2DAD0] p-6 mb-6 relative">
            {/* Edit button top-right */}
            <Link
              href="/onboarding"
              className="absolute top-4 right-4 flex items-center gap-1.5 border border-[#E2DAD0] text-[#9E6B47] hover:bg-[#9E6B47]/5 rounded-full text-xs py-1.5 px-3 font-body transition-colors duration-200"
            >
              <Edit className="w-3.5 h-3.5" /> Bearbeiten
            </Link>

            {/* Centered avatar */}
            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#E2DAD0] mx-auto flex items-center justify-center bg-[#F6F2EC]">
                {photoUrl(profile?.photos?.[0]) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoUrl(profile?.photos?.[0])}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg viewBox="0 0 512 512" width="40" height="40">
                    <path
                      d="M 68 444 A 212 212 0 1 1 444 444"
                      stroke="#E2DAD0"
                      strokeWidth="44"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                )}
              </div>

              {/* Name + age */}
              <h2 className="font-heading text-2xl text-[#1A1410] text-center mt-3">
                {profile?.name ?? 'Kein Name'}{profile?.age && !profile?.hide_age ? `, ${profile.age}` : ''}
              </h2>

              {/* Location */}
              {profile?.location && !profile?.hide_location && (
                <p className="text-[#A89888] text-sm text-center mt-0.5">{profile.location}</p>
              )}

              {/* Tier badge */}
              <p className="text-[#9E6B47] text-xs font-body text-center mt-1">
                {tier === 'premium' ? '✦ Premium' : tier === 'membership' ? '✦ Mitgliedschaft' : 'Kostenlos'}
              </p>
            </div>

            {/* Bio */}
            {profile?.bio && (
              <p className="text-[#6E6560] text-sm leading-relaxed mb-4 text-center">{profile.bio}</p>
            )}

            {/* Interests */}
            {profile?.interests && profile.interests.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                {profile.interests.map((i: string) => (
                  <span key={i} className="bg-[#EDE8E0] text-[#8B6040] text-xs px-2.5 py-1 rounded-full font-body">
                    {i}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Upgrade banner */}
          {tier !== 'premium' && (
            <div className="bg-[#7A4E30] rounded-2xl p-6 mb-6 text-[#F6F2EC]">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-5 h-5 text-[#9E6B47]" />
                <span className="font-heading text-xl">Premium freischalten</span>
              </div>
              <p className="text-[#F6F2EC]/60 text-sm mb-4 leading-relaxed">
                Love Language Test, 36 Fragen, 50 Tiefen-Fragen, Kompatibilitäts-Score und mehr.
              </p>
              <Link href="/pricing" className="btn-primary text-sm py-2.5 inline-block">
                Upgrade — Preise folgen
              </Link>
            </div>
          )}

          {/* Settings */}
          <div className="bg-white rounded-2xl border border-[#E2DAD0] p-6">
            <h3 className="font-heading text-xl text-[#1A1410] mb-4">Einstellungen</h3>
            <div className="space-y-1">
              {settingsItems.map(({ label, icon: Icon, href, danger }) => (
                <Link
                  key={label}
                  href={href}
                  className={`flex items-center gap-3 py-3 px-1 rounded-xl transition-colors hover:bg-[#FAF8F4] text-sm font-body ${
                    danger ? 'text-red-400' : 'text-[#6E6560]'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{label}</span>
                  <ChevronRight className="w-4 h-4 text-[#E2DAD0]" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
