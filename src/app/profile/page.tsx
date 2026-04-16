import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppNav } from '@/components/layout/AppNav'
import { ProfileSelfView } from './ProfileSelfView'

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

  if (!profile) redirect('/onboarding')

  return (
    <div className="min-h-screen bg-[#FAF8F4]">
      <AppNav />
      <main className="md:pl-64 pb-20 md:pb-0">
        <div className="max-w-lg mx-auto pb-32">
          <ProfileSelfView profile={profile} tier={tier} />
        </div>
      </main>
    </div>
  )
}
