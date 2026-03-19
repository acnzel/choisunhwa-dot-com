/**
 * Excel col6 (강연주제) → lecture_histories 임포트
 * - 각 줄을 강연주제 한 항목으로 저장 (string array)
 * - 이미 lecture_histories가 있는 강사는 덮어씀
 */
const { createClient } = require('@supabase/supabase-js')
const XLSX = require('/usr/local/lib/node_modules/xlsx')

const supabase = createClient(
  'https://ahcrxdegumqfdwvafhvc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoY3J4ZGVndW1xZmR3dmFmaHZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk4MzY4OCwiZXhwIjoyMDg3NTU5Njg4fQ.wu5EFLI0Ec_nWZeD1A_Ae-n2SOTrM6ajRl6_At4eNCY'
)

const EXCEL_PATH = '/Users/com/.openclaw/media/inbound/file_58---75e326ee-1c4f-4ec4-9792-9482428b4fa4.xlsx'

function parseTopics(topicStr) {
  if (!topicStr) return []
  return topicStr
    .split('\n')
    .map(s => s.trim().replace(/^[-·•]\s*/, '').trim())
    .filter(Boolean)
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function main() {
  console.log('Excel 읽는 중...')
  const wb = XLSX.readFile(EXCEL_PATH)
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 })

  // DB 기존 이름→id 맵
  const { data: existing } = await supabase.from('speakers').select('id, name')
  const nameMap = {}
  for (const s of existing) {
    nameMap[s.name] = s.id
  }

  let updated = 0
  let skipped = 0
  let noTopics = 0

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    const name = String(row[1] || '').trim()
    if (!name) continue

    const topicStr = String(row[6] || '').trim()
    const topics = parseTopics(topicStr)

    if (topics.length === 0) {
      noTopics++
      continue
    }

    const id = nameMap[name]
    if (!id) {
      skipped++
      continue
    }

    const { error } = await supabase
      .from('speakers')
      .update({ lecture_histories: topics })
      .eq('id', id)

    if (error) {
      console.error(`[ERROR] ${name}:`, error.message)
    } else {
      updated++
      if (updated % 50 === 0) console.log(`  ${updated}명 완료...`)
    }

    await sleep(20)
  }

  console.log(`\n완료: ${updated}명 업데이트, ${skipped}명 이름 미매칭, ${noTopics}명 강연주제 없음`)
}

main()
