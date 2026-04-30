import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppNav } from '@/components/layout/AppNav'
import { ProfileDetailClient } from './ProfileDetailClient'

export default async function ProfileDetailPage({ params }: { params: { userId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', params.userId)
    .single()

  if (!profile) redirect('/matches')

  const { data: viewerProfile } = await supabase
    .from('profiles')
    .select('sexuality_visible, onboarding_phase')
    .eq('user_id', user.id)
    .single()

  // Check if viewer has a mutual match with this profile (for Layer 2)
  const { data: match } = await supabase
    .from('matches')
    .select('id')
    .or(
      `and(user1_id.eq.${user.id},user2_id.eq.${params.userId}),and(user1_id.eq.${params.userId},user2_id.eq.${user.id})`
    )
    .not('status', 'eq', 'ended')
    .maybeSingle()

  const isMatched = !!match

  // Phase 3 completion for Layer 3
  const viewerPhase3Complete = (viewerProfile?.onboarding_phase ?? 0) >= 3
  const profilePhase3Complete = (profile?.onboarding_phase ?? 0) >= 3

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="md:pl-64 pb-20 md:pb-0">
        <ProfileDetailClient
          profile={profile}
          viewerSexualityVisible={viewerProfile?.sexuality_visible ?? false}
          isMatched={isMatched}
          viewerPhase3Complete={viewerPhase3Complete}
          profilePhase3Complete={profilePhase3Complete}
        />
      </main>
    </div>
  )
}
