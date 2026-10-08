import type { Metadata } from 'next'
import Link from 'next/link'
import { pageMeta } from '@/lib/seo'

export const metadata: Metadata = pageMeta({
  title: '문의하기',
  description: '강연 기획·강사 섭외 문의와 강사 등록 문의를 접수합니다. 문의 후 1~2 영업일 이내에 담당자가 연락드립니다.',
  path: '/inquiry',
})

const INQUIRY_TYPES = [
  {
    href: '/inquiry/lecture',
    emoji: '🎤',
    title: '강연기획 / 강사섭외 문의',
    desc: '기업 교육, 특강, 세미나를 위한 강연 기획 및 강사 섭외를 원하시면 여기서 문의해주세요.',
    cta: '강연 문의하기',
    bg: 'bg-[#1a1a2e]',
    textColor: 'text-white',
    descColor: 'text-gray-400',
    btnClass: 'bg-white text-[#1a1a2e] hover:bg-gray-100',
  },
  {
    href: '/inquiry/register',
    emoji: '📋',
    title: '강사 등록 문의',
    desc: '강사로 등록하고 싶으신 분들을 위한 문의 채널입니다. 이력서와 강연 주제를 함께 보내주세요.',
    cta: '강사 등록 신청',
    bg: 'bg-white',
    textColor: 'text-[#1a1a2e]',
    descColor: 'text-gray-500',
    btnClass: 'bg-[#1a1a2e] text-white hover:bg-[#16213e]',
  },
]

export default function InquiryPage() {
  return (
    <div className="min-h-screen">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl font-bold text-[#1a1a2e]">문의하기</h1>
          <p className="mt-2 text-gray-500 text-sm">어떤 도움이 필요하신가요?</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {INQUIRY_TYPES.map(({ href, emoji, title, desc, cta, bg, textColor, descColor, btnClass }) => (
            <div
              key={href}
              className={`${bg} rounded-3xl p-8 border border-gray-100 flex flex-col`}
            >
              <span className="text-4xl mb-5">{emoji}</span>
              <h2 className={`text-xl font-bold ${textColor} mb-3`}>{title}</h2>
              <p className={`text-sm ${descColor} leading-relaxed flex-1 mb-8`}>{desc}</p>
              <Link
                href={href}
                className={`inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${btnClass}`}
              >
                {cta} →
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-400">
            문의 후 <strong className="text-gray-600">1~2 영업일 이내</strong>에 담당자가 연락드립니다.
          </p>
        </div>
      </div>
    </div>
  )
}
