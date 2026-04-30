import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppNav } from '@/components/layout/AppNav'
import { EditProfileClient } from './EditProfileClient'

export default async function EditProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/onboarding')

  return (
    <div className="min-h-screen bg-[#221080]">
      <AppNav />
      <main className="md:pl-64 pb-20 md:pb-0">
        <EditProfileClient profile={profile} userId={user.id} />
      </main>
    </div>
  )
}
