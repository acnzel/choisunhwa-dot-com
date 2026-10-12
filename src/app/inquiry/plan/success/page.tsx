import type { Metadata } from 'next'
import { NOINDEX } from '@/lib/seo'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '기획안 요청 접수 완료',
  ...NOINDEX,
}

export default function PlanRequestSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[#1a1a2e]">기획안 요청이 접수되었습니다!</h1>
        <p className="mt-3 text-sm text-gray-500 leading-relaxed">
          영업일 기준 <strong className="text-gray-700">2일 이내</strong>에 최선화가 검토한 교육 기획안을 보내드립니다.
        </p>
        <div className="flex flex-col gap-2 mt-8">
          <Link
            href="/"
            className="px-5 py-2.5 bg-[#1a1a2e] text-white text-sm font-semibold rounded-full hover:bg-[#16213e] transition-colors"
          >
            홈으로 돌아가기
          </Link>
          <Link
            href="/speakers"
            className="px-5 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-full hover:bg-gray-50 transition-colors"
          >
            강사 라인업 둘러보기
          </Link>
        </div>
      </div>
    </div>
  )
}
