import type { Metadata } from 'next'
import RegisterForm from './RegisterForm'

export const metadata: Metadata = {
  title: '강사 등록 문의',
  description: '강사 등록을 위한 문의 폼입니다.',
}

export default function SpeakerRegisterPage() {
  return (
    <div className="min-h-screen">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-sm text-gray-400 mb-1">문의하기</p>
          <h1 className="text-3xl font-bold text-[#1a1a2e]">강사 등록 문의</h1>
          <p className="mt-2 text-gray-500 text-sm">
            강사로 등록을 원하시면 아래 양식을 작성해주세요. 검토 후 연락드립니다.
          </p>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <RegisterForm />
      </div>
    </div>
  )
}
