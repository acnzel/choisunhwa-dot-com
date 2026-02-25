import type { Metadata } from 'next'
import './globals.css'
import ConditionalLayout from '@/components/layout/ConditionalLayout'

export const metadata: Metadata = {
  title: {
    default: '최선화닷컴 — 강연 기획의 새로운 기준',
    template: '%s | 최선화닷컴',
  },
  description:
    '최선화닷컴은 검증된 강사와 기업을 연결하는 강연 기획 전문 플랫폼입니다. AI 매칭 기반의 정확한 강사 섭외, 강연 기획부터 사후 관리까지 원스톱으로.',
  keywords: ['강연기획', '강사섭외', '기업교육', '강사추천', '최선화닷컴'],
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: '최선화닷컴',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen flex flex-col bg-[#fafafa]">
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  )
}
