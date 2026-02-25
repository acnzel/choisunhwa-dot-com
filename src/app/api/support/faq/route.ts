import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/support/faq
 * 공개 FAQ 목록. 카테고리별 분류 포함.
 */
export async function GET(_request: NextRequest) {
  const supabase = await createClient()

  // 카테고리 목록
  const { data: categories, error: catError } = await supabase
    .from('faq_categories')
    .select('id, name, sort_order')
    .order('sort_order', { ascending: true })

  if (catError) {
    return NextResponse.json({ error: catError.message }, { status: 500 })
  }

  // 공개 FAQ (카테고리 join)
  const { data: faqs, error: faqError } = await supabase
    .from('faqs')
    .select('id, category_id, question, answer, sort_order')
    .eq('is_visible', true)
    .order('sort_order', { ascending: true })

  if (faqError) {
    return NextResponse.json({ error: faqError.message }, { status: 500 })
  }

  return NextResponse.json({
    data: {
      categories: categories ?? [],
      faqs: faqs ?? [],
    },
  })
}
