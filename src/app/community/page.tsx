import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppNav } from '@/components/layout/AppNav'
import { CommunityClient } from './CommunityClient'

export default async function CommunityPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('subscription_tier')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="md:pl-64 pb-20 md:pb-0">
        <CommunityClient tier={(userData?.subscription_tier ?? 'free') as 'free' | 'membership' | 'premium'} />
      </main>
    </div>
  )
}
