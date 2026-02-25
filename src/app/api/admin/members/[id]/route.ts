import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

type Params = { params: Promise<{ id: string }> }

const UpdateMemberSchema = z.object({
  status: z.enum(['active', 'inactive']).optional(),
  memo: z.string().max(500).optional(),
})

export async function GET(_request: NextRequest, { params }: Params) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const supabase = createAdminClient()

  const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(id)
  if (authError || !authUser.user) {
    return NextResponse.json({ error: '회원을 찾을 수 없습니다' }, { status: 404 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  // 해당 회원의 문의 이력
  const { data: inquiries } = await supabase
    .from('inquiries')
    .select('id, type, status, created_at')
    .eq('email', authUser.user.email!)
    .order('created_at', { ascending: false })

  return NextResponse.json({
    data: {
      id: authUser.user.id,
      email: authUser.user.email,
      email_confirmed_at: authUser.user.email_confirmed_at,
      ...profile,
      inquiries: inquiries ?? [],
    },
  })
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const body = await request.json()
  const parsed = UpdateMemberSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: '입력값을 확인해주세요', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()
  const updateData: Record<string, unknown> = {}
  if (parsed.data.status) updateData.status = parsed.data.status

  const { data, error: dbError } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ data })
}
