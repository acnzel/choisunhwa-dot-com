import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const pathname = request.nextUrl.pathname
  const isAdminRoute = pathname.startsWith('/mong-bab')
  const isAdminLoginRoute = pathname === '/mong-bab/login'

  // 어드민 라우트 보호
  if (isAdminRoute && !isAdminLoginRoute) {
    const { data: { user } } = await supabase.auth.getUser()

    // 1. 비로그인 → 어드민 로그인 페이지로
    if (!user) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/mong-bab/login'
      return NextResponse.redirect(redirectUrl)
    }

    // 2. 로그인했지만 role !== 'admin' → 메인으로 차단
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/'
      redirectUrl.searchParams.set('error', 'unauthorized')
      return NextResponse.redirect(redirectUrl)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/mong-bab/:path*',
  ],
}
