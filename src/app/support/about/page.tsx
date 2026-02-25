import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '회사소개',
  description: '최선화닷컴을 소개합니다.',
}

const VALUES = [
  { label: '미션', content: '올바른 강사와 기업을 연결하여 교육의 실질적 성과를 만든다.' },
  { label: '비전', content: '대한민국 강연 기획의 새로운 기준이 되는 플랫폼' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <div className="bg-[#1a1a2e] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h1 className="text-4xl font-bold">회사소개</h1>
          <p className="mt-4 text-gray-300 text-lg max-w-xl">
            최선화닷컴은 강연 기획의 새로운 기준을 만드는 전문 플랫폼입니다.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* 미션/비전 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-16">
          {VALUES.map(({ label, content }) => (
            <div key={label} className="bg-white rounded-2xl p-8 border border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">{label}</p>
              <p className="text-xl font-bold text-[#1a1a2e] leading-relaxed">{content}</p>
            </div>
          ))}
        </div>

        {/* 소개 */}
        <div className="max-w-3xl mb-16">
          <h2 className="text-2xl font-bold text-[#1a1a2e] mb-5">왜 최선화닷컴인가요?</h2>
          <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
            <p>
              기업 교육의 효과는 강사의 역량과 강연 기획의 질에 달려 있습니다.
              최선화닷컴은 단순한 강사 소개 플랫폼이 아닙니다.
              기업의 교육 목표를 분석하고, 최적의 강사와 커리큘럼을 설계하는
              강연 기획 전문 파트너입니다.
            </p>
            <p>
              소악마처럼 날카롭게 문제를 짚고, 최선처럼 최선의 해답을 찾습니다.
              검증된 강사진, 투명한 프로세스, 사후 관리까지 — 최선화닷컴이 함께합니다.
            </p>
          </div>
        </div>

        {/* 연락처 */}
        <div className="bg-[#fafafa] rounded-2xl p-8 border border-gray-100">
          <h2 className="text-lg font-bold text-[#1a1a2e] mb-5">연락처</h2>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex gap-3">
              <span className="w-16 text-gray-400 flex-shrink-0">이메일</span>
              <a href="mailto:contact@choisunhwa.com" className="text-[#1a1a2e] hover:underline">
                contact@choisunhwa.com
              </a>
            </div>
            <div className="flex gap-3">
              <span className="w-16 text-gray-400 flex-shrink-0">웹사이트</span>
              <a href="https://choisunhwa-dot-com.vercel.app" className="text-[#1a1a2e] hover:underline">
                choisunhwa-dot-com.vercel.app
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
