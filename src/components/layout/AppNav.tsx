'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Search, BookOpen, User, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import { SajaLogo } from '@/components/ui/SajaLogo'

const NAV_ITEMS = [
  { href: '/discover',        icon: 'search',     label: 'Entdecken' },
  { href: '/verbindungsraum', icon: 'connection',  label: 'Verbindungsraum' },
  { href: '/journal',         icon: 'book',        label: 'Journal' },
  { href: '/profile',         icon: 'user',        label: 'Profil' },
]

function NavIcon({ iconKey, isActive }: { iconKey: string; isActive: boolean }) {
  const activeColor   = '#6B7B5A'
  const inactiveColor = 'rgba(44,26,14,0.30)'
  const color = isActive ? activeColor : inactiveColor

  if (iconKey === 'connection') {
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
  if (iconKey === 'search') return <Search className="w-5 h-5" strokeWidth={1.5} style={{ color }} />
  if (iconKey === 'book')   return <BookOpen className="w-5 h-5" strokeWidth={1.5} style={{ color }} />
  if (iconKey === 'user')   return <User className="w-5 h-5" strokeWidth={1.5} style={{ color }} />
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
      <aside className="hidden md:flex flex-col w-64 min-h-screen fixed left-0 top-0 px-4 py-6"
        style={{ background: '#EAE0D5', borderRight: '0.5px solid rgba(44,26,14,0.08)' }}>
        <Link href="/discover" className="mb-10 px-2">
          <SajaLogo size="md" showTagline={true} onDark={false} />
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
                    ? 'bg-[rgba(107,123,90,0.12)] text-[#6B7B5A] font-normal'
                    : 'text-[rgba(44,26,14,0.45)] hover:bg-[rgba(44,26,14,0.05)] hover:text-[#2C1A0E]'
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
          className="flex items-center gap-3 px-4 py-3 text-[rgba(44,26,14,0.35)] hover:text-[#2C1A0E] transition-colors text-sm font-body"
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
          background: '#EAE0D5',
          borderTop: '0.5px solid rgba(44,26,14,0.08)',
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
                )}
              >
                <NavIcon iconKey={icon} isActive={isActive} />
                {isActive
                  ? <span className="text-[8px] font-body font-light tracking-wide" style={{ color: '#6B7B5A' }}>{label}</span>
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
