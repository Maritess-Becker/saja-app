import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PaywallClient } from './PaywallClient'

export default async function PaywallPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('trial_started_at, trial_active, onboarding_phase')
    .eq('user_id', user.id)
    .single()

  // Trial stats
  const trialStarted = profile?.trial_started_at ? new Date(profile.trial_started_at) : null
  const trialDaysUsed = trialStarted ? Math.min(14, Math.floor((Date.now() - trialStarted.getTime()) / 86_400_000)) : 14
  const trialDaysLeft = Math.max(0, 14 - trialDaysUsed)
  const trialExpired = trialDaysLeft === 0

  // Fetch usage stats for summary
  const { count: matchCount } = await supabase
    .from('matches')
    .select('id', { count: 'exact', head: true })
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .not('status', 'eq', 'ended')

  const { count: encounterCount } = await supabase
    .from('encounters')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { count: journalCount } = await supabase
    .from('journal_entries')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  return (
    <PaywallClient
      trialExpired={trialExpired}
      trialDaysLeft={trialDaysLeft}
      trialDaysUsed={trialDaysUsed}
      matchCount={matchCount ?? 0}
      encounterCount={encounterCount ?? 0}
      journalCount={journalCount ?? 0}
    />
  )
}
