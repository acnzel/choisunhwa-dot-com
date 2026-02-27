'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

const NAV_ITEMS = [
  { href: '/speakers', label: '연사 라인업' },
  { href: '/lectures', label: '인사이트' },
  { href: '/inquiry', label: '강연 의뢰하기' },
  { href: '/support/about', label: '소개' },
]

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const isActive = (href: string) => pathname.startsWith(href)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!dropdownOpen) return
    const close = () => setDropdownOpen(false)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [dropdownOpen])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const displayName = user?.user_metadata?.full_name
    || user?.user_metadata?.name
    || user?.email?.split('@')[0]
    || '사용자'

  return (
    <header
      style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        zIndex: 100,
        height: 'var(--nav-height)',
        backgroundColor: 'var(--color-bg)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--space-page)',
      }}
    >
      {/* 로고 */}
      <Link
        href="/"
        style={{
          fontFamily: 'var(--font-english)',
          fontSize: '18px',
          letterSpacing: '0.06em',
          color: 'var(--color-ink)',
          lineHeight: 1,
        }}
      >
        CHOISUNHWA.COM
      </Link>

      {/* 데스크톱 네비 */}
      <nav className="hidden md:flex" style={{ gap: '32px', listStyle: 'none', alignItems: 'center' }}>
        {NAV_ITEMS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              fontWeight: 500,
              letterSpacing: '0.06em',
              color: isActive(href) ? 'var(--color-ink)' : 'var(--color-subtle)',
              transition: 'color 0.2s',
              position: 'relative',
              paddingBottom: '2px',
              borderBottom: isActive(href) ? '1px solid var(--color-ink)' : '1px solid transparent',
            }}
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* 우측: 로그인/프로필 + CTA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {user ? (
          <div style={{ position: 'relative' }}>
            <button
              onClick={(e) => { e.stopPropagation(); setDropdownOpen(!dropdownOpen) }}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: 500,
                color: 'var(--color-subtle)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                letterSpacing: '0.04em',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span
                style={{
                  width: '24px', height: '24px',
                  borderRadius: '50%',
                  background: 'var(--color-green)',
                  color: 'var(--color-bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: 700,
                }}
              >
                {displayName.charAt(0).toUpperCase()}
              </span>
              {displayName}
              <span style={{ fontSize: '10px' }}>▾</span>
            </button>

            {dropdownOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  minWidth: '140px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  zIndex: 200,
                }}
              >
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '12px 16px',
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px', fontWeight: 500,
                    color: 'var(--color-subtle)',
                    background: 'none', border: 'none',
                    cursor: 'pointer',
                    borderTop: '1px solid var(--color-border)',
                  }}
                >
                  로그아웃
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/auth/login"
            className="hidden md:block"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px', fontWeight: 500,
              letterSpacing: '0.06em',
              color: 'var(--color-subtle)',
            }}
          >
            로그인
          </Link>
        )}

        <Link
          href="/inquiry"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px', fontWeight: 700,
            letterSpacing: '0.1em',
            color: 'var(--color-bg)',
            background: 'var(--color-green)',
            padding: '9px 20px',
            transition: 'background 0.2s',
            whiteSpace: 'nowrap',
            display: 'inline-block',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-rust)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-green)')}
        >
          매칭 시작하기 →
        </Link>

        {/* 모바일 햄버거 */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
          aria-label="메뉴"
        >
          <div style={{ width: '22px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <span style={{ display: 'block', height: '1px', background: 'var(--color-ink)', transition: 'transform 0.2s', transform: menuOpen ? 'translateY(6px) rotate(45deg)' : 'none' }} />
            <span style={{ display: 'block', height: '1px', background: 'var(--color-ink)', opacity: menuOpen ? 0 : 1, transition: 'opacity 0.2s' }} />
            <span style={{ display: 'block', height: '1px', background: 'var(--color-ink)', transition: 'transform 0.2s', transform: menuOpen ? 'translateY(-6px) rotate(-45deg)' : 'none' }} />
          </div>
        </button>
      </div>

      {/* 모바일 드로어 */}
      {menuOpen && (
        <div
          style={{
            position: 'fixed', top: 'var(--nav-height)', left: 0, right: 0,
            background: 'var(--color-bg)',
            borderBottom: '1px solid var(--color-border)',
            padding: '24px var(--space-page) 32px',
            zIndex: 99,
          }}
        >
          {NAV_ITEMS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              style={{
                display: 'block',
                fontFamily: 'var(--font-body)',
                fontSize: '16px', fontWeight: 500,
                color: 'var(--color-ink)',
                padding: '14px 0',
                borderBottom: '1px solid var(--color-border)',
                letterSpacing: '-0.01em',
              }}
            >
              {label}
            </Link>
          ))}
          {!user && (
            <Link
              href="/auth/login"
              onClick={() => setMenuOpen(false)}
              style={{
                display: 'block',
                fontFamily: 'var(--font-body)',
                fontSize: '16px', fontWeight: 500,
                color: 'var(--color-muted)',
                padding: '14px 0',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              로그인
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
