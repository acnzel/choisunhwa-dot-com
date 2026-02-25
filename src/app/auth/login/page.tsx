import type { Metadata } from 'next'
import LoginForm from './LoginForm'
import GoogleLoginButton from '@/components/auth/GoogleLoginButton'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '로그인',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-[#1a1a2e]">
            최선화닷컴
          </Link>
          <p className="mt-2 text-sm text-gray-500">계정에 로그인하세요</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
          <LoginForm />

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center text-xs text-gray-400">
              <span className="px-3 bg-white">또는</span>
            </div>
          </div>

          <GoogleLoginButton redirectTo="/" />

          <p className="text-center text-xs text-gray-500 mt-5">
            계정이 없으신가요?{' '}
            <Link href="/auth/signup" className="text-[#1a1a2e] font-medium hover:underline">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
