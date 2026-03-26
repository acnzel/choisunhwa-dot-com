'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'

const NAV_ITEMS = [
  { href: '/mong-bab/dashboard', label: '대시보드', icon: '📊' },
  { href: '/mong-bab/speakers',              label: '강사 관리',    icon: '🎤' },
  { href: '/mong-bab/speaker-applications', label: '강사 신청 검토', icon: '📝' },
  { href: '/mong-bab/featured-speakers',    label: '에디터 픽',  icon: '⭐' },
  { href: '/mong-bab/lectures',  label: '강연 관리', icon: '📋' },
  { href: '/mong-bab/insights',  label: '인사이트 관리', icon: '✍️' },
  { href: '/mong-bab/trend-briefing/pending', label: '트렌드 브리핑', icon: '🤖' },
  { href: '/mong-bab/inquiries', label: '문의 관리', icon: '💬' },
  { href: '/mong-bab/members',   label: '회원 관리', icon: '👥' },
  { href: '/mong-bab/support',   label: 'FAQ/공지',  icon: '📢' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const [open, setOpen] = useState(false)

  // 라우트 변경 시 모바일 메뉴 자동 닫기
  useEffect(() => { setOpen(false) }, [pathname])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/mong-bab/login')
  }

  if (pathname === '/mong-bab/login') return null

  const currentNav = NAV_ITEMS.find(n => pathname.startsWith(n.href))

  const NavContent = () => (
    <>
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <div>
          <Link
            href="/mong-bab/dashboard"
            className="text-base font-bold text-[#1a1a2e]"
            onClick={() => setOpen(false)}
          >
            어드민
          </Link>
          <p className="text-xs text-gray-400 mt-0.5">최선화닷컴</p>
        </div>
        {/* 모바일 닫기 버튼 */}
        <button
          onClick={() => setOpen(false)}
          className="md:hidden p-1 text-gray-400 hover:text-gray-600"
          aria-label="메뉴 닫기"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? 'bg-[#1a1a2e] text-white'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-[#1a1a2e]'
              }`}
            >
              <span className="text-base">{icon}</span>
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
    </>
  )

  return (
    <>
      {/* ── 데스크탑 사이드바 ── */}
      <aside className="hidden md:flex w-56 bg-white border-r border-gray-100 flex-col shrink-0 min-h-screen">
        <NavContent />
      </aside>

      {/* ── 모바일 상단 헤더 바 ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 flex items-center px-4 h-14 gap-3">
        <button
          onClick={() => setOpen(true)}
          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg"
          aria-label="메뉴 열기"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <span className="text-sm font-semibold text-[#1a1a2e] truncate">
          {currentNav ? `${currentNav.icon} ${currentNav.label}` : '어드민'}
        </span>
        <Link href="/" className="ml-auto text-xs text-gray-400 hover:text-gray-600">
          사이트 →
        </Link>
      </div>

      {/* ── 모바일 드로어 오버레이 ── */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/30"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── 모바일 드로어 ── */}
      <aside
        className={`md:hidden fixed top-0 left-0 bottom-0 z-50 w-64 bg-white flex flex-col transition-transform duration-250 ease-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <NavContent />
      </aside>
    </>
  )
}
