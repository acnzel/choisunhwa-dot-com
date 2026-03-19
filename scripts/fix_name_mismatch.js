/**
 * 이름 불일치로 skip된 강사 사진 수동 매핑 업로드
 * PDF페이지 → DB이름 직접 지정
 */

const { spawnSync } = require('child_process')
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const SUPABASE_URL = 'https://ahcrxdegumqfdwvafhvc.supabase.co'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoY3J4ZGVndW1xZmR3dmFmaHZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk4MzY4OCwiZXhwIjoyMDg3NTU5Njg4fQ.wu5EFLI0Ec_nWZeD1A_Ae-n2SOTrM6ajRl6_At4eNCY'
const supabase = createClient(SUPABASE_URL, SERVICE_KEY)
const PDF_PATH = '/Users/com/.openclaw/media/inbound/file_new_gdrive_589pages.pdf'
const WORK_DIR = '/tmp/pdf_fix_mismatch'

// PDF페이지 → DB이름 매핑
const MANUAL_MAP = [
  { page: 272, dbName: '타일러 라쉬' },   // PDF: 타일러
  { page: 302, dbName: '줄리안 퀸타르트' }, // PDF: 줄리안
  { page: 514, dbName: '송용진(쏭내관)' },  // PDF: 송용진
]

fs.mkdirSync(WORK_DIR, { recursive: true })

async function uploadPhoto(imagePath) {
  const buffer = fs.readFileSync(imagePath)
  const timestamp = Date.now()
  const random = Math.random().toString(36).slice(2, 7)
  const storagePath = `2026/03/${timestamp}_${random}.jpg`
  const { error } = await supabase.storage.from('speakers').upload(storagePath, buffer, { contentType: 'image/jpeg', upsert: false })
  if (error) throw new Error(error.message)
  const { data: { publicUrl } } = supabase.storage.from('speakers').getPublicUrl(storagePath)
  return publicUrl
}

async function main() {
  for (const { page, dbName } of MANUAL_MAP) {
    console.log(`\n처리: p${page} → DB[${dbName}]`)

    // DB에서 강사 조회
    const { data: speakers } = await supabase.from('speakers').select('id,name,photo_url').ilike('name', dbName).limit(1)
    if (!speakers || speakers.length === 0) { console.log('  DB에 없음, skip'); continue }
    const speaker = speakers[0]
    if (speaker.photo_url) { console.log('  이미 사진 있음, skip'); continue }

    // 이미지 추출
    const outPrefix = path.join(WORK_DIR, `p${page}`)
    spawnSync('pdfimages', ['-j', '-f', String(page), '-l', String(page), PDF_PATH, outPrefix], { timeout: 20000 })
    const files = fs.readdirSync(WORK_DIR)
      .filter(f => f.startsWith(`p${page}`) && (f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png')))
      .map(f => ({ name: f, size: fs.statSync(path.join(WORK_DIR, f)).size }))
      .sort((a, b) => b.size - a.size)

    if (files.length === 0 || files[0].size < 10000) { console.log('  이미지 없음, skip'); continue }

    const imgPath = path.join(WORK_DIR, files[0].name)
    const photoUrl = await uploadPhoto(imgPath)
    await supabase.from('speakers').update({ photo_url: photoUrl }).eq('id', speaker.id)
    console.log(`  ✅ ${dbName} 업로드 완료`)
    try { fs.unlinkSync(imgPath) } catch {}
  }
  console.log('\n완료')
}

main().catch(console.error)
