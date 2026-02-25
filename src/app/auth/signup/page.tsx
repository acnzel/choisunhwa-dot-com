import type { Metadata } from 'next'
import Link from 'next/link'
import SignupForm from './SignupForm'

export const metadata: Metadata = {
  title: '회원가입',
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-[#1a1a2e]">
            최선화닷컴
          </Link>
          <p className="mt-2 text-sm text-gray-500">새 계정을 만들어보세요</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
          <SignupForm />

          <p className="text-center text-xs text-gray-500 mt-5">
            이미 계정이 있으신가요?{' '}
            <Link href="/auth/login" className="text-[#1a1a2e] font-medium hover:underline">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
