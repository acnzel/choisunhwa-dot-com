import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/support/faq
 * 공개 FAQ 목록 (카테고리 포함)
 */
export async function GET() {
  const supabase = await createClient()

  // FAQ 카테고리 목록
  const { data: categories, error: catError } = await supabase
    .from('faq_categories')
    .select('*')
    .order('sort_order', { ascending: true })

  if (catError) {
    return NextResponse.json({ error: catError.message }, { status: 500 })
  }

  // 공개 FAQ 목록
  const { data: faqs, error: faqError } = await supabase
    .from('faqs')
    .select('id, category_id, question, answer, sort_order')
    .eq('is_visible', true)
    .order('sort_order', { ascending: true })

  if (faqError) {
    return NextResponse.json({ error: faqError.message }, { status: 500 })
  }

  // 카테고리별 그룹핑
  const grouped = (categories ?? []).map((cat) => ({
    ...cat,
    faqs: (faqs ?? []).filter((f) => f.category_id === cat.id),
  }))

  // 카테고리 없는 FAQ도 포함
  const uncategorized = (faqs ?? []).filter((f) => !f.category_id)
  if (uncategorized.length > 0) {
    grouped.push({ id: null, name: '기타', sort_order: 999, faqs: uncategorized })
  }

  return NextResponse.json({ data: grouped })
}
