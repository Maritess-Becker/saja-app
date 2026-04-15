'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Search, Heart, Sparkles, BookOpen, User, LogOut, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import { SajaLogo } from '@/components/ui/SajaLogo'

const NAV_ITEMS = [
  { href: '/discover', icon: Search, label: 'Entdecken' },
  { href: '/matches', icon: Heart, label: 'Matches' },
  { href: '/begegnung', icon: Sparkles, label: 'Begegnung' },
  { href: '/community', icon: Users, label: 'Community' },
  { href: '/content', icon: BookOpen, label: 'Inhalte' },
  { href: '/profile', icon: User, label: 'Profil' },
]

export function AppNav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    toast.success('Abgemeldet.')
    router.push('/')
    router.refresh()
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 min-h-screen bg-white border-r border-sand fixed left-0 top-0 px-4 py-6">
        <Link href="/discover" className="mb-10 px-2">
          <SajaLogo size="md" showTagline={true} />
        </Link>

        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-body text-sm',
                pathname.startsWith(href)
                  ? 'bg-light text-primary font-medium'
                  : 'text-text/60 hover:bg-sand hover:text-text'
              )}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-text/40 hover:text-text transition-colors text-sm font-body"
        >
          <LogOut className="w-5 h-5" />
          Abmelden
        </button>
      </aside>

      {/* Mobile bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-sand z-50">
        <div className="flex">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              title={label}
              className={cn(
                'flex-1 flex flex-col items-center justify-center py-3 transition-colors',
                pathname.startsWith(href) ? 'text-primary' : 'text-text/40'
              )}
            >
              <Icon className="w-5 h-5" />
            </Link>
          ))}
        </div>
      </nav>
    </>
  )
}
