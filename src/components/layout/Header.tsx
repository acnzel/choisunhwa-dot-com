'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const NAV_ITEMS = [
  { href: '/speakers', label: '강사 소개' },
  { href: '/lectures', label: '강연 커리큘럼' },
  { href: '/inquiry', label: '문의하기' },
  { href: '/support/faq', label: '고객지원' },
]

export default function Header() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const isActive = (href: string) => pathname.startsWith(href)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-xl font-bold text-[#1a1a2e] tracking-tight group-hover:text-gray-700 transition-colors">
              최선화닷컴
            </span>
          </Link>

          {/* 데스크탑 네비게이션 */}
          <nav className="hidden md:flex items-center gap-8" aria-label="주요 메뉴">
            {NAV_ITEMS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`text-sm font-medium transition-colors ${
                  isActive(href)
                    ? 'text-[#1a1a2e]'
                    : 'text-gray-500 hover:text-[#1a1a2e]'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* 데스크탑 인증 버튼 */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-gray-600 hover:text-[#1a1a2e] transition-colors"
            >
              로그인
            </Link>
            <Link
              href="/auth/signup"
              className="text-sm font-medium bg-[#1a1a2e] text-white px-4 py-2 rounded-full hover:bg-[#16213e] transition-colors"
            >
              회원가입
            </Link>
          </div>

          {/* 모바일 햄버거 */}
          <button
            className="md:hidden p-2 text-gray-500 hover:text-[#1a1a2e] transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="메뉴 열기"
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* 모바일 메뉴 */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col gap-1" aria-label="모바일 메뉴">
              {NAV_ITEMS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`px-2 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive(href)
                      ? 'text-[#1a1a2e] bg-gray-50'
                      : 'text-gray-600 hover:text-[#1a1a2e] hover:bg-gray-50'
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                <Link
                  href="/auth/login"
                  className="flex-1 text-center text-sm font-medium py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  로그인
                </Link>
                <Link
                  href="/auth/signup"
                  className="flex-1 text-center text-sm font-medium py-2 bg-[#1a1a2e] text-white rounded-lg hover:bg-[#16213e] transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  회원가입
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
