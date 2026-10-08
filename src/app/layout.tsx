import type { Metadata } from 'next'
import './globals.css'
import ConditionalLayout from '@/components/layout/ConditionalLayout'
import ScrollToTop from '@/components/ScrollToTop'
import JsonLd from '@/components/seo/JsonLd'
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, DEFAULT_OG_IMAGE, organizationJsonLd } from '@/lib/seo'

// canonical 은 여기서 정하지 않는다 — 루트에 두면 canonical 을 지정하지 않은 모든 하위 페이지가 홈을 가리키게 된다.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: '최선화닷컴 — 강연 기획의 새로운 기준',
    template: '%s | 최선화닷컴',
  },
  description: SITE_DESCRIPTION,
  keywords: ['강연기획', '강사섭외', '기업교육', '강사추천', '최선화닷컴'],
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: SITE_NAME,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: { card: 'summary_large_image' },
  // 검색엔진 소유 확인 — 각 서비스에서 발급받은 값을 Vercel 환경변수로 넣으면 메타 태그가 출력된다
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION
      ? { 'naver-site-verification': process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION }
      : undefined,
  },
}

const siteJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    organizationJsonLd,
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      inLanguage: 'ko-KR',
      publisher: { '@id': `${SITE_URL}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_URL}/speakers?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
        <JsonLd data={siteJsonLd} />
        <ScrollToTop />
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  )
}
