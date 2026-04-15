import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { AppNav } from '@/components/layout/AppNav'
import { ConnectionClient } from './ConnectionClient'

export default async function ConnectionPage({ params }: { params: { matchId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Load match + connection
  const { data: match } = await supabase
    .from('matches')
    .select('*, connections(*)')
    .eq('id', params.matchId)
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .single()

  if (!match) notFound()

  const connection = match.connections?.[0]
  if (!connection || connection.status !== 'active') {
    redirect('/matches')
  }

  // Load other profile
  const otherId = match.user1_id === user.id ? match.user2_id : match.user1_id
  const { data: otherProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', otherId)
    .single()

  // Load messages
  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('connection_id', connection.id)
    .order('created_at', { ascending: true })

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="md:pl-64 h-screen flex flex-col">
        <ConnectionClient
          connection={connection}
          otherProfile={otherProfile}
          initialMessages={messages ?? []}
          currentUserId={user.id}
          matchId={params.matchId}
        />
      </main>
    </div>
  )
}
