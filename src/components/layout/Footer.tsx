import Link from 'next/link'

const FOOTER_LINKS = {
  서비스: [
    { href: '/speakers', label: '강사 소개' },
    { href: '/lectures', label: '강연 커리큘럼' },
    { href: '/inquiry/lecture', label: '강연기획 문의' },
    { href: '/inquiry/register', label: '강사등록 문의' },
  ],
  고객지원: [
    { href: '/support/faq', label: 'FAQ' },
    { href: '/support/notice', label: '공지사항' },
    { href: '/support/about', label: '회사소개' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-[#1a1a2e] text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 브랜드 */}
          <div className="md:col-span-2">
            <Link href="/" className="text-white text-xl font-bold tracking-tight">
              최선화닷컴
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-gray-500">
              강연 기획의 새로운 기준.<br />
              검증된 강사와 기업을 연결하는 전문 플랫폼입니다.
            </p>
            <p className="mt-4 text-xs text-gray-600">
              문의: contact@choisunhwa.com
            </p>
          </div>

          {/* 링크 */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-gray-300 mb-3">{category}</h3>
              <ul className="space-y-2">
                {links.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} 최선화닷컴. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-gray-600">
            <Link href="/support/about" className="hover:text-gray-400 transition-colors">
              이용약관
            </Link>
            <Link href="/support/about" className="hover:text-gray-400 transition-colors">
              개인정보처리방침
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
