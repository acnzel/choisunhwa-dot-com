import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { LectureSchema } from '@/lib/validations'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const supabase = createAdminClient()

  const { data, error: dbError } = await supabase
    .from('lectures')
    .select('*, speakers(id, name)')
    .eq('id', id)
    .single()

  if (dbError || !data) return NextResponse.json({ error: '강연을 찾을 수 없습니다' }, { status: 404 })
  return NextResponse.json({ data })
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params
  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다' }, { status: 400 })
  }

  const parsed = LectureSchema.partial().safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: '입력값을 확인해주세요', details: parsed.error.flatten() }, { status: 422 })
  }

  const supabase = createAdminClient()
  const { data, error: dbError } = await supabase
    .from('lectures')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const supabase = createAdminClient()
  const { error: dbError } = await supabase.from('lectures').delete().eq('id', id)
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}
