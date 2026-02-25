import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { SpeakerSchema } from '@/lib/validations'

type Params = { params: Promise<{ id: string }> }

/**
 * GET /api/admin/speakers/:id
 * PATCH /api/admin/speakers/:id
 * DELETE /api/admin/speakers/:id
 */
export async function GET(_request: NextRequest, { params }: Params) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const supabase = createAdminClient()

  const { data, error: dbError } = await supabase
    .from('speakers')
    .select('*, lectures(id, title, is_visible)')
    .eq('id', id)
    .single()

  if (dbError || !data) {
    return NextResponse.json({ error: '강사를 찾을 수 없습니다' }, { status: 404 })
  }
  return NextResponse.json({ data })
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const body = await request.json()
  const parsed = SpeakerSchema.partial().safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: '입력값을 확인해주세요', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()
  const { data, error: dbError } = await supabase
    .from('speakers')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const supabase = createAdminClient()

  const { error: dbError } = await supabase.from('speakers').delete().eq('id', id)
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
