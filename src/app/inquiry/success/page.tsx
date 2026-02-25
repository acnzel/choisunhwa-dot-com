import Link from 'next/link'

export default function InquirySuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[#1a1a2e]">문의가 접수되었습니다!</h1>
        <p className="mt-3 text-sm text-gray-500 leading-relaxed">
          입력하신 이메일로 접수 확인 메일을 발송했습니다.
          <br />
          영업일 기준 <strong className="text-gray-700">1~2일 이내</strong>에 담당자가 연락드립니다.
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
            다른 강사 더 보기
          </Link>
        </div>
      </div>
    </div>
  )
}
