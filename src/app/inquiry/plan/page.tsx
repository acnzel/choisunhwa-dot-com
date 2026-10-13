import type { Metadata } from 'next'
import PlanRequestForm from './PlanRequestForm'
import { pageMeta } from '@/lib/seo'

export const metadata: Metadata = pageMeta({
  title: '교육 기획안 무료로 받기',
  description: '교육 인원과 대상, 조직의 고민을 알려주시면 최선화가 검토한 교육 기획안을 영업일 2일 이내에 메일로 보내드립니다. 추천 강사와 커리큘럼이 담긴, 결재에 바로 올릴 수 있는 기획안입니다.',
  path: '/inquiry/plan',
})

// 이슈 뉴스레터 CTA 는 ?ref=briefing-<id>&topic=<프로그램 이름> 으로 들어온다.
const REF_PATTERN = /^briefing-[0-9a-f-]{36}$/

export default async function PlanRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; topic?: string }>
}) {
  const { ref, topic } = await searchParams
  const refCode = ref && REF_PATTERN.test(ref) ? ref : undefined
  const defaultConcern = refCode && topic ? `뉴스레터에서 본 '${topic.slice(0, 50)}' 프로그램을 우리 회사에 맞춰 보고 싶습니다.` : undefined

  return (
    <div className="min-h-screen">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-sm text-gray-400 mb-1">문의하기</p>
          <h1 className="text-3xl font-bold text-[#1a1a2e]">교육 기획안 무료로 받기</h1>
          <p className="mt-2 text-gray-500 text-sm leading-relaxed">
            세 가지만 알려주세요. 최선화가 직접 검토한 교육 기획안을 영업일 2일 이내에 메일로 보내드립니다.
            <br />
            교육 목적, 추천 강사, 커리큘럼이 담겨 있어 결재에 바로 올릴 수 있습니다.
          </p>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PlanRequestForm refCode={refCode} defaultConcern={defaultConcern} />
      </div>
    </div>
  )
}
