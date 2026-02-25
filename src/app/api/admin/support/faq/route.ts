import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { FaqSchema } from '@/lib/validations'

export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  const supabase = createAdminClient()

  const { data: categories } = await supabase
    .from('faq_categories')
    .select('*')
    .order('sort_order', { ascending: true })

  const { data: faqs, error: dbError } = await supabase
    .from('faqs')
    .select('*')
    .order('sort_order', { ascending: true })

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

  return NextResponse.json({ data: { categories: categories ?? [], faqs: faqs ?? [] } })
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const body = await request.json()
  const parsed = FaqSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: '입력값을 확인해주세요', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()
  const { data, error: dbError } = await supabase
    .from('faqs')
    .insert(parsed.data)
    .select()
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
