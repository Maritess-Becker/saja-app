import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppNav } from '@/components/layout/AppNav'
import { DiscoverClient } from './DiscoverClient'

export default async function DiscoverPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Check if profile is complete + fetch viewer settings
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_complete, name, sexuality_visible')
    .eq('user_id', user.id)
    .single()

  if (!profile?.is_complete) {
    redirect('/onboarding')
  }

  // Load subscription tier
  const { data: userData } = await supabase
    .from('users')
    .select('subscription_tier')
    .eq('id', user.id)
    .single()
  const tier = (userData?.subscription_tier ?? 'free') as 'free' | 'membership' | 'premium'

  // Check if user is in active connection (One Connection Rule)
  const { data: activeConnection } = await supabase
    .from('connections')
    .select('id, match_id')
    .eq('status', 'active')
    .or(`requested_by.eq.${user.id}`)
    .maybeSingle()

  // Load profiles to discover (exclude already liked/disliked)
  const { data: likedIds } = await supabase
    .from('likes')
    .select('to_user_id')
    .eq('from_user_id', user.id)

  const excludeIds = [user.id, ...(likedIds?.map((l) => l.to_user_id) ?? [])]

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .eq('is_complete', true)
    .eq('profile_paused', false)
    .not('user_id', 'in', `(${excludeIds.join(',')})`)
    .limit(20)

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="md:pl-64 pb-20 md:pb-0">
        <DiscoverClient
          initialProfiles={profiles ?? []}
          currentUserId={user.id}
          isInConnection={!!activeConnection}
          connectionId={activeConnection?.match_id}
          tier={tier}
          viewerSexualityVisible={profile?.sexuality_visible ?? false}
        />
      </main>
    </div>
  )
}
