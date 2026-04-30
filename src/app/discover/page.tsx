import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppNav } from '@/components/layout/AppNav'
import { DiscoverClient } from './DiscoverClient'
import type { Profile } from '@/types'

export default async function DiscoverPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch full viewer profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Redirect to onboarding if Phase 1 not done
  if (!profile?.is_complete || (profile?.onboarding_phase ?? 0) < 1) {
    redirect('/onboarding')
  }

  // Check trial / paywall
  const trialStarted = profile?.trial_started_at ? new Date(profile.trial_started_at) : null
  const trialExpired = trialStarted
    ? (Date.now() - trialStarted.getTime()) > 14 * 24 * 60 * 60 * 1000
    : false

  // Load subscription tier
  const { data: userData } = await supabase
    .from('users')
    .select('subscription_tier')
    .eq('id', user.id)
    .single()
  const tier = (userData?.subscription_tier ?? 'free') as 'free' | 'membership' | 'premium'

  // If trial expired AND no paid tier → paywall (still let them browse, block liking client-side)
  const isPaidUser = tier === 'membership' || tier === 'premium'
  const trialActive = !trialExpired || isPaidUser

  // Check if user is in active connection (One Connection Rule)
  const { data: activeConnection } = await supabase
    .from('connections')
    .select('id, match_id')
    .eq('status', 'active')
    .or(`requested_by.eq.${user.id}`)
    .maybeSingle()

  // Load profiles to discover
  const { data: likedIds } = await supabase
    .from('likes')
    .select('to_user_id')
    .eq('from_user_id', user.id)

  const excludeIds = [user.id, ...(likedIds?.map((l) => l.to_user_id) ?? [])]

  const { data: rawProfiles } = await supabase
    .from('profiles')
    .select('*')
    .eq('is_complete', true)
    .eq('profile_paused', false)
    .not('user_id', 'in', `(${excludeIds.join(',')})`)
    .limit(25)

  const profiles = (rawProfiles ?? []) as Profile[]

  // ── 20% Serendipity: mark 2 out of every 10 profiles ──────────────
  // Pick 2 random indices from the full list to be "surprise" profiles
  const serendipityCount = Math.max(0, Math.floor(profiles.length / 5))
  const serendipitySet = new Set<string>()
  if (profiles.length > serendipityCount) {
    // Shuffle indices and pick last N as serendipity
    const indices = profiles.map((_, i) => i).sort(() => Math.random() - 0.5)
    indices.slice(0, serendipityCount).forEach((i) => serendipitySet.add(profiles[i].user_id))
  }
  const serendipityIds = Array.from(serendipitySet)

  return (
    <div className="min-h-screen bg-creme">
      <AppNav />
      <main className="md:pl-64 pb-20 md:pb-0">
        <DiscoverClient
          initialProfiles={profiles}
          currentUserId={user.id}
          isInConnection={!!activeConnection}
          connectionId={activeConnection?.match_id}
          tier={tier}
          viewerSexualityVisible={profile?.sexuality_visible ?? false}
          viewerProfile={profile}
          onboardingPhase={profile?.onboarding_phase ?? 1}
          serendipityIds={serendipityIds}
          trialActive={trialActive}
          trialDaysLeft={trialStarted ? Math.max(0, 14 - Math.floor((Date.now() - trialStarted.getTime()) / 86400000)) : 14}
        />
      </main>
    </div>
  )
}
