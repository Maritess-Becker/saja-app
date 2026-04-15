import { createClient } from '@/lib/supabase/server'
import { PricingClient } from './PricingClient'

export default async function PricingPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return <PricingClient isLoggedIn={!!user} />
}
