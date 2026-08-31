/**
 * 썸네일 이미지가 없는 게시된 인사이트에 Pexels 이미지를 채워 넣는 일회성 스크립트
 * 실행: npx tsx scripts/backfill-thumbnails.ts
 */
import { createClient } from '@supabase/supabase-js'
import { fetchArticleImage } from '../src/lib/trend-briefing/image'

const TAG_QUERY: Record<string, string> = {
  HR: 'human resources office',
  리더십: 'leadership business',
  조직문화: 'company culture team',
  동기부여: 'motivation employee',
  경영전략: 'business strategy meeting',
  소통: 'communication teamwork',
  IT: 'technology office',
  ESG: 'sustainability business',
  창업: 'startup entrepreneur',
  심리: 'psychology mind',
  경제: 'economy finance',
  자기계발: 'self improvement growth',
  인문학: 'humanities books',
  교육: 'education training',
  건강: 'health wellness',
  창의: 'creativity innovation',
  팀워크: 'teamwork collaboration',
  비즈니스매너: 'business etiquette',
  행복: 'happiness lifestyle',
  힐링: 'relaxation wellness',
}
const FALLBACK_QUERY = 'business office team'

function buildQuery(tags: unknown): string {
  if (!Array.isArray(tags)) return FALLBACK_QUERY
  for (const t of tags) {
    if (typeof t === 'string' && TAG_QUERY[t]) return TAG_QUERY[t]
  }
  return FALLBACK_QUERY
}

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data: rows, error } = await supabase
    .from('insights')
    .select('id, title, meta')
    .is('thumbnail_url', null)
    .eq('status', 'published')

  if (error) throw error
  console.log(`[backfill] 대상: ${rows?.length ?? 0}건`)

  let updated = 0
  for (const row of rows ?? []) {
    const query = buildQuery((row.meta as { tags?: unknown } | null)?.tags)
    const imageUrl = await fetchArticleImage(query)

    if (!imageUrl) {
      console.warn(`[backfill] 이미지 못 찾음: ${row.title} (query: ${query})`)
      continue
    }

    const { error: updateError } = await supabase
      .from('insights')
      .update({ thumbnail_url: imageUrl })
      .eq('id', row.id)

    if (updateError) {
      console.error(`[backfill] 업데이트 실패: ${row.title}`, updateError)
      continue
    }

    updated++
    console.log(`[backfill] ✅ ${row.title} → ${imageUrl}`)
  }

  console.log(`[backfill] 완료: ${updated}/${rows?.length ?? 0}건 업데이트`)
}

main()
