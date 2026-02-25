import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/auth/callback
 * 구글 OAuth & 이메일 인증 콜백 처리
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent(error)}`
    )
  }

  if (code) {
    const supabase = await createClient()
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (!exchangeError && data.user) {
      // 신규 유저면 profiles에 upsert
      const user = data.user
      const provider = (user.app_metadata?.provider as string) ?? 'email'

      await supabase.from('profiles').upsert(
        {
          id: user.id,
          name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? '',
          provider: provider === 'google' ? 'google' : 'email',
          status: 'active',
          last_login_at: new Date().toISOString(),
        },
        { onConflict: 'id', ignoreDuplicates: false }
      )

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

  return NextResponse.redirect(`${origin}/auth/login?error=인증에_실패했습니다`)
}
