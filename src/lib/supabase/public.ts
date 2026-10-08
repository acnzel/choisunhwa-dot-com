import { createClient } from '@supabase/supabase-js'

// 공개 페이지 조회용 클라이언트. 쿠키를 읽지 않으므로 페이지가 ISR 로 캐시된다.
// anon key 로 조회하므로 비로그인 방문자와 같은 권한(RLS)이 적용된다.
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
