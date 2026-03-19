'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

type SubItem = { href: string; label: string }
type NavItem  = { href: string; label: string; submenu?: SubItem[] }

const NAV_ITEMS: NavItem[] = [
  {
    href: '/speakers',
    label: '강사 라인업',
    submenu: [
      { href: '/speakers',              label: '전체보기' },
      { href: '/speakers?view=field',   label: '주제로 찾기' },
      { href: '/speakers?view=trending', label: '지금 뜨는' },
    ],
  },
  {
    href: '/insights',
    label: '강연 인사이트',
    submenu: [
      { href: '/insights/issue',     label: '인사이트' },
      { href: '/insights/report',    label: '현장 스토리' },
      { href: '/insights/featured',  label: '에디터 픽' },
    ],
  },
  { href: '/matching?step=1', label: '강사 매칭 신청' },
  { href: '/support/about',   label: '최선화닷컴 이야기' },
]

export default function Header() {
  const pathname = usePathname()
  const router   = useRouter()
  const [menuOpen,      setMenuOpen]      = useState(false)
  const [mobileExpand,  setMobileExpand]  = useState<string | null>(null) // 모바일 서브메뉴 열린 항목 href
  const [hoverItem,     setHoverItem]     = useState<string | null>(null) // 데스크탑 hover
  const [user,          setUser]          = useState<User | null>(null)
  const [dropdownOpen,  setDropdownOpen]  = useState(false)
  const hoverTimeout    = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isActive = (href: string) => {
    if (href === '/matching?step=1') return pathname.startsWith('/matching')
    return pathname.startsWith(href)
  }

  /* auth */
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null))
    return () => subscription.unsubscribe()
  }, [])

  /* 외부 클릭 시 유저 드롭다운 닫기 */
  useEffect(() => {
    if (!dropdownOpen) return
    const close = () => setDropdownOpen(false)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [dropdownOpen])

  /* hover 딜레이 핸들러 — 마우스가 서브메뉴로 이동할 시간 확보 */
  const onNavMouseEnter = (href: string) => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current)
    setHoverItem(href)
  }
  const onNavMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => setHoverItem(null), 120)
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name      ||
    user?.email?.split('@')[0]     ||
    '사용자'

  return (
    <>
      <style>{`
        /* 서브메뉴 드롭다운 */
        .nav-dropdown {
          position: absolute;
          top: calc(100% + 1px);
          left: 50%;
          transform: translateX(-50%);
          min-width: 160px;
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          box-shadow: 0 8px 24px -4px rgba(28,23,18,0.10);
          z-index: 200;
          opacity: 0;
          pointer-events: none;
          transform: translateX(-50%) translateY(-6px);
          transition: opacity 0.18s ease, transform 0.18s ease;
        }
        .nav-dropdown.open {
          opacity: 1;
          pointer-events: auto;
          transform: translateX(-50%) translateY(0);
        }
        .nav-dropdown-item {
          display: block;
          padding: 11px 18px;
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 400;
          letter-spacing: 0.01em;
          color: var(--color-subtle);
          transition: background 0.12s, color 0.12s;
          border-bottom: 1px solid var(--color-border);
          white-space: nowrap;
        }
        .nav-dropdown-item:last-child { border-bottom: none; }
        .nav-dropdown-item:hover {
          background: var(--color-surface);
          color: var(--color-ink);
        }
        .nav-dropdown-item.active {
          color: var(--color-ink);
          font-weight: 600;
        }
        /* 모바일 서브메뉴 */
        .mobile-sub-item {
          display: block;
          padding: 12px 0 12px 16px;
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 400;
          color: var(--color-subtle);
          border-bottom: 1px solid var(--color-border);
          letter-spacing: -0.01em;
          position: relative;
        }
        .mobile-sub-item::before {
          content: '';
          position: absolute;
          left: 0; top: 50%; transform: translateY(-50%);
          width: 3px; height: 14px;
          background: var(--color-border);
        }
      `}</style>

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
            fontSize: 'clamp(13px, 3.5vw, 18px)',
            letterSpacing: '0.05em',
            color: 'var(--color-ink)',
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          CHOISUNHWA.COM
        </Link>

        {/* 데스크탑 네비 */}
        <nav className="hidden md:flex" style={{ gap: '32px', listStyle: 'none', alignItems: 'center' }}>
          {NAV_ITEMS.map(({ href, label, submenu }) => {
            const active = isActive(href)
            const hasSubmenu = !!submenu
            const isOpen = hoverItem === href

            return (
              <div
                key={href}
                style={{ position: 'relative' }}
                onMouseEnter={() => hasSubmenu ? onNavMouseEnter(href) : undefined}
                onMouseLeave={() => hasSubmenu ? onNavMouseLeave() : undefined}
              >
                <Link
                  href={href}
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '16px',
                    fontWeight: active ? 600 : 500,
                    letterSpacing: '0.02em',
                    color: active ? 'var(--color-ink)' : 'var(--color-subtle)',
                    transition: 'color 0.2s',
                    position: 'relative',
                    paddingBottom: '2px',
                    borderBottom: active ? '1px solid var(--color-ink)' : '1px solid transparent',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {label}
                  {hasSubmenu && (
                    <span style={{
                      fontSize: '9px',
                      color: 'var(--color-muted)',
                      transition: 'transform 0.15s',
                      display: 'inline-block',
                      transform: isOpen ? 'rotate(180deg)' : 'none',
                    }}>▾</span>
                  )}
                </Link>

                {/* 드롭다운 */}
                {hasSubmenu && submenu && (
                  <div
                    className={`nav-dropdown ${isOpen ? 'open' : ''}`}
                    onMouseEnter={() => onNavMouseEnter(href)}
                    onMouseLeave={() => onNavMouseLeave()}
                  >
                    {submenu.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className={`nav-dropdown-item${pathname.startsWith(sub.href) ? ' active' : ''}`}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* 우측: 로그인/프로필 + CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={(e) => { e.stopPropagation(); setDropdownOpen(!dropdownOpen) }}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px', fontWeight: 500,
                  color: 'var(--color-subtle)',
                  background: 'none', border: 'none',
                  cursor: 'pointer', letterSpacing: '0.04em',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}
              >
                <span style={{
                  width: '24px', height: '24px',
                  borderRadius: '50%',
                  background: 'var(--color-green)',
                  color: 'var(--color-bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: 700,
                }}>
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
            href="/matching?step=1"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px', fontWeight: 700,
              letterSpacing: '0.08em',
              color: 'var(--color-bg)',
              background: 'var(--color-green)',
              padding: '8px 14px',
              transition: 'background 0.2s',
              whiteSpace: 'nowrap',
              display: 'inline-block',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-rust)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-green)')}
          >
            <span className="hidden sm:inline">매칭 시작하기 →</span>
            <span className="sm:hidden">매칭 →</span>
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
            {NAV_ITEMS.map(({ href, label, submenu }) => (
              <div key={href}>
                {submenu ? (
                  /* 서브메뉴 있는 항목 — 탭으로 펼치기 */
                  <>
                    <button
                      onClick={() => setMobileExpand(mobileExpand === href ? null : href)}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        width: '100%',
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontFamily: 'var(--font-body)',
                        fontSize: '16px', fontWeight: 500,
                        color: isActive(href) ? 'var(--color-ink)' : 'var(--color-ink)',
                        padding: '14px 0',
                        borderBottom: '1px solid var(--color-border)',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      <span>{label}</span>
                      <span style={{
                        fontSize: '10px', color: 'var(--color-muted)',
                        transition: 'transform 0.15s',
                        transform: mobileExpand === href ? 'rotate(180deg)' : 'none',
                      }}>▾</span>
                    </button>
                    {mobileExpand === href && (
                      <div style={{ background: 'var(--color-surface)' }}>
                        {submenu.map((sub) => (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            className="mobile-sub-item"
                            onClick={() => setMenuOpen(false)}
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
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
                )}
              </div>
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
    </>
  )
}
