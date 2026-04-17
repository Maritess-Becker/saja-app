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
    .select('sexuality_visible')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="md:pl-64 pb-20 md:pb-0">
        <ProfileDetailClient
          profile={profile}
          viewerSexualityVisible={viewerProfile?.sexuality_visible ?? false}
        />
      </main>
    </div>
  )
}
