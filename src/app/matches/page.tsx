import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppNav } from '@/components/layout/AppNav'
import { MatchesClient } from './MatchesClient'

export default async function MatchesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('subscription_tier')
    .eq('id', user.id)
    .single()
  const tier = (userData?.subscription_tier ?? 'free') as 'free' | 'membership' | 'premium'

  // Load all matches for current user
  const { data: matches } = await supabase
    .from('matches')
    .select(`
      *,
      connections(*)
    `)
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  // Load other profiles for matches
  const matchesWithProfiles = await Promise.all(
    (matches ?? []).map(async (match) => {
      const otherId = match.user1_id === user.id ? match.user2_id : match.user1_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', otherId)
        .single()
      return { ...match, other_profile: profile }
    })
  )

  // Check if in active connection
  const activeMatch = matchesWithProfiles.find((m) =>
    m.connections?.some((c: { status: string }) => c.status === 'active')
  )

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="md:pl-64 pb-20 md:pb-0">
        <MatchesClient
          matches={matchesWithProfiles}
          currentUserId={user.id}
          activeMatchId={activeMatch?.id}
          tier={tier}
        />
      </main>
    </div>
  )
}
