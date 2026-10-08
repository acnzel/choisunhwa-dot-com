import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import InquiryForm from './InquiryForm'
import { pageMeta } from '@/lib/seo'

export const metadata: Metadata = pageMeta({
  title: '강연기획 / 강사섭외 문의',
  description: '기업 교육, 특강, 세미나 강사 섭외를 문의하세요. 강연 목적·대상·예산을 알려주시면 1~2 영업일 내 맞춤 강사를 제안드립니다.',
  path: '/inquiry/lecture',
})

interface Props {
  searchParams: Promise<{ speaker?: string; lecture?: string }>
}

export default async function LectureInquiryPage({ searchParams }: Props) {
  const params = await searchParams

  // F-4: 로그인 상태이면 이름/이메일 자동 채움
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let defaultName = ''
  const defaultEmail = user?.email ?? ''

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single()
    defaultName = profile?.name || user.user_metadata?.full_name || user.user_metadata?.name || ''
  }

  return (
    <div className="min-h-screen">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-sm text-gray-400 mb-1">문의하기</p>
          <h1 className="text-3xl font-bold text-[#1a1a2e]">강연기획 / 강사섭외 문의</h1>
          <p className="mt-2 text-gray-500 text-sm">
            아래 양식을 작성해주시면 1~2 영업일 내에 연락드립니다.
          </p>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <InquiryForm
          defaultSpeaker={params.speaker ?? ''}
          defaultLecture={params.lecture ?? ''}
          defaultName={defaultName}
          defaultEmail={defaultEmail}
        />
      </div>
    </div>
  )
}
