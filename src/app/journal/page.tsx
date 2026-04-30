import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppNav } from '@/components/layout/AppNav'
import { JournalClient } from './JournalClient'
import type { JournalEntry } from '@/types'

export default async function JournalPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: entries } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="min-h-screen bg-creme">
      <AppNav />
      <main className="md:pl-64 pb-24 md:pb-0">
        <JournalClient
          initialEntries={(entries ?? []) as JournalEntry[]}
          userId={user.id}
        />
      </main>
    </div>
  )
}
