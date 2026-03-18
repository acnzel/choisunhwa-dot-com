/**
 * 엑셀 기준 전체 강사 upsert
 * - 이름으로 기존 강사 검색 → 있으면 update, 없으면 insert
 * - 중복 이름은 첫 번째 엑셀 항목만 사용
 */
const { createClient } = require('@supabase/supabase-js')
const XLSX = require('/usr/local/lib/node_modules/xlsx')

const supabase = createClient(
  'https://ahcrxdegumqfdwvafhvc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoY3J4ZGVndW1xZmR3dmFmaHZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk4MzY4OCwiZXhwIjoyMDg3NTU5Njg4fQ.wu5EFLI0Ec_nWZeD1A_Ae-n2SOTrM6ajRl6_At4eNCY'
)

// ─── 카테고리 매핑 ───────────────────────────────────────────
const CAT_MAP = {
  '경영전략':'경영전략','비즈니스':'경영전략','산업':'경영전략','혁신':'경영전략',
  'ESG':'ESG','기후변화':'ESG','환경':'ESG',
  '경제':'경제','경제전망':'경제',
  '투자':'재테크','재테크':'재테크',
  '리더십':'리더십','코칭':'리더십',
  '영업':'영업','마케팅':'영업','CS':'영업','협상':'영업',
  'HR':'HR','인사':'HR','노무':'HR','성과':'HR','조직관리':'HR','조직':'HR',
  'IT':'IT','미래':'IT','트렌드':'IT','빅데이터':'IT','빅데이':'IT','AI':'IT','디지털':'IT',
  '소통':'소통','커뮤니케이션':'소통','스피치':'소통',
  '업무스킬':'업무스킬','기획력':'업무스킬','보고서':'업무스킬','문해력':'업무스킬',
  '동기부여':'동기부여','열정':'동기부여','도전':'동기부여','임파워먼트':'동기부여',
  '인문학':'인문학','문화':'인문학','예술':'인문학','역사':'인문학','문학':'인문학','과학':'인문학',
  '건강':'건강',
  '심리':'심리','스트레스':'심리','멘탈':'심리','스트레스관리':'심리',
  '창의':'창의','뇌과학':'창의','창의력':'창의',
  '교육':'교육','자녀교육':'교육',
  '취업':'취업','면접':'취업',
  '라이프':'라이프',
  '법정필수':'법정필수','법률':'법정필수','법정':'법정필수',
  '정치':'정치','사회':'정치',
  '창업':'창업','스타트업':'창업',
  '힐링':'힐링','명상':'힐링',
  '자기계발':'자기계발',
  '행복':'행복','가족':'행복',
  '팀워크':'팀워크','팀빌딩':'팀워크',
  '비즈니스매너':'비즈니스매너','매너':'비즈니스매너',
  '갈등관리':'갈등관리','문제해결':'갈등관리','변화관리':'갈등관리',
  '위기관리':'위기관리',
}

function parseFields(catStr) {
  if (!catStr) return []
  const result = new Set()
  // 쉼표, slash 분리 후 trim
  const tokens = catStr
    .replace(/["""]/g, '')
    .split(/[,，、]/)
    .flatMap(s => s.split('/'))
    .map(s => s.trim())
  for (const t of tokens) {
    if (CAT_MAP[t]) result.add(CAT_MAP[t])
  }
  return [...result]
}

function parseLines(str) {
  if (!str) return []
  return str.split('\n').map(s => s.trim().replace(/^[-·•]\s*/, '').trim()).filter(Boolean)
}

function parseCareers(careerStr, eduStr) {
  const list = []
  // 학력 먼저
  parseLines(eduStr).forEach(l => list.push({ year: '', content: '[학력] ' + l }))
  // 경력
  parseLines(careerStr).forEach(l => list.push({ year: '', content: l }))
  return list
}

function parseMediaLinks(urlStr, titleStr) {
  if (!urlStr) return []
  const urls = urlStr.split('\n').map(s => s.trim()).filter(s => s.startsWith('http'))
  const titles = parseLines(titleStr)
  return urls.map((url, i) => ({ title: titles[i] || url, url }))
}

function buildPayload(row, isFirstRow = false) {
  // row 0 구조: [이름, "한글 이름"(label), 이미지명, 소속, ...]
  // row 1+ 구조: [번호, 이름, 이미지명, 소속, ...]
  const name = isFirstRow ? String(row[0] || '').trim() : String(row[1] || '').trim()
  const company = String(row[3] || '').trim()
  const catStr = String(row[4] || '').trim()
  const topicStr = String(row[6] || '').trim()
  const eduStr = String(row[7] || '').trim()
  const careerStr = String(row[8] || '').trim()
  const bookStr = String(row[9] || '').trim()
  const urlStr = String(row[10] || '').trim()
  const titleStr = String(row[11] || '').trim()

  const bioLines = topicStr.split('\n').map(s => s.trim()).filter(Boolean)

  return {
    name,
    company,
    title: '',
    bio_short: bioLines[0]?.slice(0, 100) || '',
    bio_full: topicStr,
    fields: parseFields(catStr),
    careers: parseCareers(careerStr, eduStr),
    lecture_histories: [],
    news_links: parseLines(bookStr),
    media_links: parseMediaLinks(urlStr, titleStr),
    photo_url: null,
    fee_range: null,
    is_visible: true,
    is_best: false,
    sort_order: 9999,
  }
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function main() {
  // DB 기존 이름→id 맵
  const { data: existing } = await supabase.from('speakers').select('id, name')
  const nameToId = {}
  for (const s of existing) nameToId[s.name.trim()] = s.id
  console.log('기존 DB 강사:', Object.keys(nameToId).length)

  // 엑셀 파싱
  const wb = XLSX.readFile('/Users/com/.openclaw/media/inbound/file_55---79302e19-9f3d-4556-a9fd-80bd197ba1a7.xlsx')
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 })

  // 중복 이름 제거: 이름 기준 첫 번째만 사용
  const seen = new Set()
  const payloads = []

  // row 0: 이름이 index 0
  if (rows[0] && typeof rows[0][0] === 'string' && rows[0][0] !== '번호') {
    const p = buildPayload(rows[0], true)
    if (p.name && !seen.has(p.name)) { seen.add(p.name); payloads.push(p) }
  }
  // row 1~
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (!row || typeof row[1] !== 'string' || !row[1].trim()) continue
    const p = buildPayload(row, false)
    if (p.name && !seen.has(p.name)) { seen.add(p.name); payloads.push(p) }
  }
  console.log('엑셀 고유 강사:', payloads.length)

  let updated = 0, inserted = 0, errors = 0
  const BATCH = 20

  for (let i = 0; i < payloads.length; i += BATCH) {
    const batch = payloads.slice(i, i + BATCH)
    for (const p of batch) {
      const existingId = nameToId[p.name]
      if (existingId) {
        const { error } = await supabase.from('speakers').update(p).eq('id', existingId)
        if (error) { console.error('UPDATE 실패:', p.name, error.message); errors++ }
        else updated++
      } else {
        const { error } = await supabase.from('speakers').insert(p)
        if (error) { console.error('INSERT 실패:', p.name, error.message); errors++ }
        else inserted++
      }
    }
    process.stdout.write(`\r진행: ${Math.min(i + BATCH, payloads.length)}/${payloads.length}`)
    await sleep(100)
  }

  console.log('\n\n=== 완료 ===')
  console.log('업데이트:', updated, '/ 신규 삽입:', inserted, '/ 에러:', errors)

  const { count } = await supabase.from('speakers').select('*', { count: 'exact', head: true })
  console.log('최종 DB 강사 수:', count)
}

main()
