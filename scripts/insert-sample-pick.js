/**
 * 샘플 "이달의 강사" pick 데이터 삽입 스크립트
 * 실행: node scripts/insert-sample-pick.js
 *
 * 사전 조건: 007_insights_table.sql 마이그레이션 적용 완료 후 실행
 */

const { createClient } = require('@supabase/supabase-js')

const sb = createClient(
  'https://ahcrxdegumqfdwvafhvc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoY3J4ZGVndW1xZmR3dmFmaHZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk4MzY4OCwiZXhwIjoyMDg3NTU5Njg4fQ.wu5EFLI0Ec_nWZeD1A_Ae-n2SOTrM6ajRl6_At4eNCY'
)

async function main() {
  // 1. 서은국 교수 ID 확인
  const { data: speaker, error: spErr } = await sb
    .from('speakers')
    .select('id, name, photo_url, title, company')
    .eq('name', '서은국')
    .single()

  if (spErr || !speaker) {
    console.error('강사 조회 실패:', spErr)
    process.exit(1)
  }

  console.log('대상 강사:', speaker.name, speaker.id)

  // 2. 이달의 강사 pick 1건 삽입
  const now = new Date().toISOString()
  const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]

  const { data: pick, error: pickErr } = await sb
    .from('insights')
    .insert({
      type: 'pick',
      title: `이달의 강사 — ${speaker.name}`,
      summary: '행복을 연구하는 심리학자, 연세대 서은국 교수',
      status: 'published',
      published_at: now,
      home_featured: true,
      meta: {
        speaker_id: speaker.id,
        reason: '행복이란 무엇인가? 30년간 행복을 연구해온 대한민국 대표 심리학자. 조직에 활력을 불어넣는 강의로 기업·기관에서 끊임없이 찾는 강사입니다.',
        topics: [
          '행복과 긍정심리학 — 일하는 이유를 다시 찾는 법',
          '감정지능과 팀 분위기 — 리더가 만드는 조직 에너지',
          '번아웃 예방과 회복탄력성 — 지속 가능한 성과의 조건',
        ],
        start_date: new Date().toISOString().split('T')[0],
        end_date: endOfMonth,
      },
    })
    .select()
    .single()

  if (pickErr) {
    console.error('pick 삽입 실패:', JSON.stringify(pickErr, null, 2))
    process.exit(1)
  }

  console.log('✅ 샘플 pick 삽입 완료:', pick.id)
  console.log('확인 URL: https://choisunhwa-dot-com.vercel.app/insights/pick')
}

main()
