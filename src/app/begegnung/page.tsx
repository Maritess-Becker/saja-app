import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppNav } from '@/components/layout/AppNav'
import { BegegnungClient } from './BegegnungClient'

export default async function BegegnungPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('subscription_tier')
    .eq('id', user.id)
    .single()
  const tier = (userData?.subscription_tier ?? 'free') as 'free' | 'membership' | 'premium'

  // Aktive Begegnung laden
  const { data: matches } = await supabase
    .from('matches')
    .select('*, connections(*)')
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .eq('status', 'active')

  // Finde das Match das eine aktive Connection hat
  let activeMatch = null
  let activeConnection = null
  for (const match of matches ?? []) {
    const conn = match.connections?.find(
      (c: { status: string }) => c.status === 'active'
    )
    if (conn) {
      activeMatch = match
      activeConnection = conn
      break
    }
  }

  let otherProfile = null
  let messages = []

  if (activeMatch && activeConnection) {
    const otherId =
      activeMatch.user1_id === user.id
        ? activeMatch.user2_id
        : activeMatch.user1_id

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', otherId)
      .single()

    otherProfile = profile

    const { data: msgs } = await supabase
      .from('messages')
      .select('*')
      .eq('connection_id', activeConnection.id)
      .order('created_at', { ascending: true })

    messages = msgs ?? []
  }

  return (
    <div className="bg-background">
      <AppNav />
      <main className="md:pl-64 flex flex-col overflow-hidden">
        <BegegnungClient
          activeMatch={activeMatch}
          activeConnection={activeConnection}
          otherProfile={otherProfile}
          initialMessages={messages}
          currentUserId={user.id}
          tier={tier}
        />
      </main>
    </div>
  )
}
