/**
 * bio_short 2~3줄 자동생성 스크립트
 *
 * 대상: created_at 순서 21번 이후 강사 (1~20번은 수동 작성 예정, 건드리지 않음)
 *
 * 생성 포맷:
 *   1줄: {company} {title} · {최고 학력 한 줄}
 *   2줄: 대표 경력 1~2개 (학력 제외)
 *   3줄: 강연 핵심 메시지 (bio_full 첫 줄 또는 기존 bio_short)
 *
 * 실행:
 *   node scripts/generate-bio-short.js            → dry-run (preview only)
 *   node scripts/generate-bio-short.js --apply    → DB 실제 업데이트
 *   node scripts/generate-bio-short.js --from 50  → 50번부터 (재시작용)
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const APPLY = process.argv.includes('--apply')
const FROM_ARG = process.argv.find(a => a.startsWith('--from='))
const FROM_INDEX = FROM_ARG ? parseInt(FROM_ARG.split('=')[1]) - 1 : 20  // 0-indexed, default skip first 20

const sb = createClient(
  'https://ahcrxdegumqfdwvafhvc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoY3J4ZGVndW1xZmR3dmFmaHZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk4MzY4OCwiZXhwIjoyMDg3NTU5Njg4fQ.wu5EFLI0Ec_nWZeD1A_Ae-n2SOTrM6ajRl6_At4eNCY'
)

/**
 * 2~3줄 bio_short 생성
 */
function generateBioShort(speaker) {
  const { name, title, company, bio_full, careers, fields, news_links } = speaker

  // ── 1줄: 직함 + 소속 ──────────────────────────────────────
  const positionLine = [company, title].filter(Boolean).join(' ') || name

  // ── 2줄: 대표 경력 ────────────────────────────────────────
  // careers에서 학력 제외한 첫 번째 경력
  const careerItems = Array.isArray(careers) ? careers : []
  const realCareers = careerItems
    .filter(c => c.content && !c.content.startsWith('[학력]'))
    .map(c => c.content.replace(/^[-·•]\s*/, '').trim())

  // 현재 직책 제외하고 직전 경력 (현직이 이미 1줄에 있으면 2줄에는 이전 경력)
  const prevCareers = realCareers.filter(c => !c.includes(company || '__none__')).slice(0, 2)
  const careerLine = prevCareers.length > 0
    ? prevCareers.join(' · ')
    : realCareers.slice(0, 1).join('')  // fallback: 첫 번째 경력이라도

  // ── 3줄: 강연 핵심 메시지 ────────────────────────────────
  // bio_full 첫 줄 (강연주제 제목) 사용
  const bioLines = (bio_full || '').split('\n').map(l => l.trim()).filter(Boolean)
  let messageLine = bioLines[0] || ''

  // bio_full이 너무 짧거나 없으면 fields 활용
  if (!messageLine || messageLine.length < 5) {
    const fieldStr = Array.isArray(fields) ? fields.slice(0, 3).join(' · ') : ''
    messageLine = fieldStr ? `${fieldStr} 전문 강사` : ''
  }

  // 저서 필터링 — 직책/수상/직위 키워드 제외, 10자 이상만 유효 책 제목으로 인정
  const NON_BOOK_KEYWORDS = ['교수', '위원', '수상', '표창', '협회', '대학교', '대학원', '연구소', '센터', '이사', '회장', '부회장', '팀장', '자문', '아나운서', '기자', '원장']
  const books = Array.isArray(news_links)
    ? news_links.filter(b => {
        if (!b || b.length < 8) return false
        // 직책/수상 키워드 포함 시 저서 아님
        if (NON_BOOK_KEYWORDS.some(kw => b.includes(kw))) return false
        return true
      })
    : []
  const bookHint = books.length > 0 ? ` | 저서 《${books[0]}》` : ''

  // ── 조합 ─────────────────────────────────────────────────
  const lines = [positionLine, careerLine, messageLine + bookHint]
    .filter(l => l && l.trim().length > 1)

  return lines.join('\n')
}

async function main() {
  console.log(`\n🔧 bio_short 2~3줄 생성기`)
  console.log(`모드: ${APPLY ? '🟠 APPLY (실제 업데이트)' : '🔵 DRY-RUN (미리보기만)'}`)
  console.log(`시작 인덱스: ${FROM_INDEX + 1}번부터\n`)

  // 전체 강사 created_at 순으로 가져오기
  const allSpeakers = []
  let page = 0
  const PAGE_SIZE = 200
  while (true) {
    const { data, error } = await sb
      .from('speakers')
      .select('id, name, title, company, bio_full, careers, fields, news_links, bio_short')
      .order('created_at')
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
    if (error) { console.error('조회 실패:', error); process.exit(1) }
    if (!data || data.length === 0) break
    allSpeakers.push(...data)
    if (data.length < PAGE_SIZE) break
    page++
  }

  console.log(`전체 강사: ${allSpeakers.length}명`)
  const targets = allSpeakers.slice(FROM_INDEX)
  console.log(`처리 대상: ${targets.length}명 (${FROM_INDEX + 1}번~${allSpeakers.length}번)\n`)

  const preview = []
  let updated = 0
  let skipped = 0
  let errors = 0

  for (let i = 0; i < targets.length; i++) {
    const speaker = targets[i]
    const idx = FROM_INDEX + i + 1
    const newBio = generateBioShort(speaker)

    preview.push({
      idx,
      id: speaker.id,
      name: speaker.name,
      old: speaker.bio_short || '',
      new: newBio,
    })

    if (!APPLY) continue

    // 기존과 동일하면 스킵
    if (speaker.bio_short === newBio) { skipped++; continue }

    const { error } = await sb
      .from('speakers')
      .update({ bio_short: newBio })
      .eq('id', speaker.id)

    if (error) {
      console.error(`❌ ${idx} ${speaker.name}:`, error.message)
      errors++
    } else {
      process.stdout.write(`✅ ${idx} ${speaker.name}\n`)
      updated++
    }

    // Rate limiting 방지
    if ((i + 1) % 50 === 0) await new Promise(r => setTimeout(r, 500))
  }

  // ── 결과 저장 (dry-run 시에만) ──────────────────────────
  if (!APPLY) {
    const outPath = path.join(__dirname, 'bio-short-preview.json')
    fs.writeFileSync(outPath, JSON.stringify(preview, null, 2), 'utf-8')
    console.log(`📄 미리보기 저장: ${outPath}`)
    console.log(`\n── 샘플 (처음 5명) ──`)
    preview.slice(0, 5).forEach(p => {
      console.log(`\n[${p.idx}] ${p.name}`)
      console.log('  기존:', p.old)
      console.log('  새로:', p.new.split('\n').map(l => '  ' + l).join('\n  '))
    })
  } else {
    console.log(`\n완료: 업데이트 ${updated}건, 스킵 ${skipped}건, 에러 ${errors}건`)
  }
}

main().catch(console.error)
