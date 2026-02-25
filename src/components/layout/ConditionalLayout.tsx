'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'

/**
 * 어드민(/mong-bab) 라우트에서는 메인 Header/Footer를 렌더하지 않음.
 * 어드민은 자체 AdminSidebar 레이아웃 사용.
 */
export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/mong-bab')

  if (isAdmin) {
    return <>{children}</>
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  )
}
