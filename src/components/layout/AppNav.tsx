'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Search, Heart, BookOpen, User, LogOut, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import { SajaLogo } from '@/components/ui/SajaLogo'

const NAV_ITEMS = [
  { href: '/discover', icon: 'search', label: 'Entdecken' },
  { href: '/matches', icon: 'heart', label: 'Matches' },
  { href: '/begegnung', icon: 'saja', label: 'Begegnung' },
  { href: '/content', icon: 'book', label: 'Inhalte' },
  { href: '/profile', icon: 'user', label: 'Profil' },
]

function NavIcon({ iconKey, isActive }: { iconKey: string; isActive: boolean }) {
  const color = isActive ? '#FDF8F2' : 'rgba(253,248,242,0.28)'

  if (iconKey === 'saja') {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ transform: 'rotate(135deg)', transformOrigin: 'center' }}>
        <path
          d="M 4.8 19.2 A 10.2 10.2 0 1 1 19.2 19.2"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    )
  }
  if (iconKey === 'search') return <Search className="w-5 h-5" strokeWidth={1.5} />
  if (iconKey === 'heart') return <Heart className="w-5 h-5" strokeWidth={1.5} />
  if (iconKey === 'users') return <Users className="w-5 h-5" strokeWidth={1.5} />
  if (iconKey === 'book') return <BookOpen className="w-5 h-5" strokeWidth={1.5} />
  if (iconKey === 'user') return <User className="w-5 h-5" strokeWidth={1.5} />
  return null
}

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
      <aside className="hidden md:flex flex-col w-64 min-h-screen bg-[#120850] fixed left-0 top-0 px-4 py-6">
        <Link href="/discover" className="mb-10 px-2">
          <SajaLogo size="md" showTagline={true} onDark={true} />
        </Link>

        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map(({ href, icon, label }) => {
            const isActive = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-body text-sm',
                  isActive
                    ? 'bg-[rgba(253,248,242,0.14)] text-[#FDF8F2] font-normal'
                    : 'text-[rgba(253,248,242,0.38)] hover:bg-[rgba(253,248,242,0.07)] hover:text-[#FDF8F2]'
                )}
              >
                <NavIcon iconKey={icon} isActive={isActive} />
                {label}
              </Link>
            )
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-[rgba(253,248,242,0.35)] hover:text-[#FDF8F2] transition-colors text-sm font-body"
        >
          <LogOut className="w-5 h-5" strokeWidth={1.5} />
          Abmelden
        </button>
      </aside>

      {/* Mobile bottom bar */}
      <nav
        data-mobile-nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: 'var(--bg-nav)',
          borderTop: '0.5px solid rgba(253,248,242,0.08)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div className="flex">
          {NAV_ITEMS.map(({ href, icon, label }) => {
            const isActive = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                title={label}
                className={cn(
                  'flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors',
                  isActive ? 'text-[#FDF8F2]' : 'text-[rgba(253,248,242,0.28)]'
                )}
              >
                <NavIcon iconKey={icon} isActive={isActive} />
                {isActive
                  ? <span className="text-[8px] font-body font-light tracking-wide text-[#FDF8F2]">{label}</span>
                  : <div className="h-[8px]" />
                }
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
