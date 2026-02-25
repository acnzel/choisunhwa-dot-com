import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

type Params = { params: Promise<{ id: string }> }

const PatchSchema = z.object({
  status: z.enum(['active', 'inactive']).optional(),
  memo: z.string().max(500).optional(),
})

export async function GET(_req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const supabase = createAdminClient()

  const { data: profile, error: dbError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (dbError || !profile) return NextResponse.json({ error: '회원을 찾을 수 없습니다' }, { status: 404 })

  // auth 이메일 조회
  const { data: { user: authUser } } = await supabase.auth.admin.getUserById(id)

  // 문의 이력
  const { data: inquiries } = await supabase
    .from('inquiries')
    .select('id, type, status, created_at')
    .eq('email', authUser?.email ?? '')
    .order('created_at', { ascending: false })

  return NextResponse.json({
    data: {
      ...profile,
      email: authUser?.email ?? '',
      inquiries: inquiries ?? [],
    },
  })
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params
  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다' }, { status: 400 })
  }

  const parsed = PatchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: '입력값을 확인해주세요', details: parsed.error.flatten() }, { status: 422 })
  }

  const supabase = createAdminClient()
  const { data, error: dbError } = await supabase
    .from('profiles')
    .update({ status: parsed.data.status })
    .eq('id', id)
    .select()
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ data })
}
