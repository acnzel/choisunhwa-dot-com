import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * 현재 세션 유저 반환. 없으면 null.
 */
export async function getSessionUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/**
 * 어드민 여부 확인. 어드민이 아니면 401/403 Response 반환.
 * 어드민이면 { user, supabase } 반환.
 */
export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return {
      error: NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 }),
      user: null,
      supabase: null,
    }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return {
      error: NextResponse.json({ error: '권한이 없습니다' }, { status: 403 }),
      user: null,
      supabase: null,
    }
  }

  return { error: null, user, supabase }
}
