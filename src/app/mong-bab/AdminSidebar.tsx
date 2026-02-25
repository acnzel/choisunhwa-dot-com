'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/mong-bab/dashboard', label: '대시보드', icon: '📊' },
  { href: '/mong-bab/speakers', label: '강사 관리', icon: '🎤' },
  { href: '/mong-bab/lectures', label: '강연 관리', icon: '📋' },
  { href: '/mong-bab/inquiries', label: '문의 관리', icon: '💬' },
  { href: '/mong-bab/members', label: '회원 관리', icon: '👥' },
  { href: '/mong-bab/support', label: 'FAQ/공지', icon: '📢' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/mong-bab/login')
  }

  if (pathname === '/mong-bab/login') return null

  return (
    <aside className="w-56 bg-white border-r border-gray-100 flex flex-col shrink-0">
      <div className="p-5 border-b border-gray-100">
        <Link href="/mong-bab/dashboard" className="text-base font-bold text-[#1a1a2e]">
          어드민
        </Link>
        <p className="text-xs text-gray-400 mt-0.5">최선화닷컴</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? 'bg-[#1a1a2e] text-white'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-[#1a1a2e]'
              }`}
            >
              <span>{icon}</span>
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-gray-100">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
        >
          <span>🚪</span> 로그아웃
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← 사이트로 돌아가기
        </Link>
      </div>
    </aside>
  )
}
