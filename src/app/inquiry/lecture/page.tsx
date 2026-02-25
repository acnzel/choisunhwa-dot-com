import type { Metadata } from 'next'
import InquiryForm from './InquiryForm'

export const metadata: Metadata = {
  title: '강연기획 / 강사섭외 문의',
  description: '강연 기획 및 강사 섭외를 위한 문의 폼입니다.',
}

interface Props {
  searchParams: Promise<{ speaker?: string; lecture?: string }>
}

export default async function LectureInquiryPage({ searchParams }: Props) {
  const params = await searchParams
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
        />
      </div>
    </div>
  )
}
