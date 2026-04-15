import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppNav } from '@/components/layout/AppNav'
import { ContentClient } from './ContentClient'

export default async function ContentPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('subscription_tier')
    .eq('id', user.id)
    .single()

  const { data: purchases } = await supabase
    .from('purchases')
    .select('product_id')
    .eq('user_id', user.id)

  const tier = userData?.subscription_tier ?? 'free'
  const purchasedIds = purchases?.map((p) => p.product_id) ?? []

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="md:pl-64 pb-20 md:pb-0">
        <ContentClient tier={tier} purchasedIds={purchasedIds} userId={user.id} />
      </main>
    </div>
  )
}
