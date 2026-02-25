import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/auth/callback
 * Supabase OAuth / 이메일 인증 콜백 처리
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // 구글 로그인: 최초 가입 시 profiles에 provider=google 기록
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const provider = user.app_metadata?.provider ?? 'email'
        // upsert — 이미 있으면 last_login_at만 갱신
        await supabase.from('profiles').upsert(
          {
            id: user.id,
            name: user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? '',
            provider,
            status: 'active',
            last_login_at: new Date().toISOString(),
          },
          { onConflict: 'id', ignoreDuplicates: false }
        )
      }

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // 인증 실패 시 로그인 페이지로
  return NextResponse.redirect(
    `${origin}/auth/login?error=auth_callback_failed`
  )
}
