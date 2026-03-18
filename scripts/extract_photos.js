/**
 * PDF 강사 프로필에서 사진 자동 추출 → Supabase Storage 업로드 → DB 업데이트
 *
 * 구조: 각 PDF 페이지 = 한 명의 강사 프로필 (PPT 슬라이드)
 * - 페이지 텍스트 첫 2~3번째 단어 = 강사 이름
 * - 페이지 내 가장 큰 JPG = 강사 사진
 */

const { execSync, spawnSync } = require('child_process')
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const SUPABASE_URL = 'https://ahcrxdegumqfdwvafhvc.supabase.co'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoY3J4ZGVndW1xZmR3dmFmaHZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk4MzY4OCwiZXhwIjoyMDg3NTU5Njg4fQ.wu5EFLI0Ec_nWZeD1A_Ae-n2SOTrM6ajRl6_At4eNCY'
const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

const INBOUND_DIR = '/Users/com/.openclaw/media/inbound'
const WORK_DIR = '/tmp/pdf_extract/work'

// 큰 PDF만 처리 (2MB 이상 = 이미지 포함된 강사 프로필)
const MIN_SIZE = 2 * 1024 * 1024

// 결과 로그
const results = { uploaded: [], notFound: [], noPhoto: [], errors: [] }

async function loadAllSpeakers() {
  const { data } = await supabase
    .from('speakers')
    .select('id, name, photo_url')
    .order('name')
  return data || []
}

function extractPageText(pdfPath, pageNum) {
  try {
    const result = spawnSync('pdftotext', [
      '-f', String(pageNum), '-l', String(pageNum),
      '-layout', pdfPath, '-'
    ], { encoding: 'utf8', timeout: 10000 })
    return result.stdout || ''
  } catch { return '' }
}

function extractSpeakerName(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)
  // "강연분야 : ..." 다음 줄이 이름+소속
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('강연분야')) {
      // 다음 비어있지 않은 줄 찾기
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        const line = lines[j]
        if (line.length > 1) {
          // 이름은 보통 첫 번째 단어 (2-4자 한글 이름)
          const match = line.match(/^([가-힣]{2,4})[\s\u00A0]/)
          if (match) return match[1]
        }
      }
    }
  }
  // fallback: 첫 번째 짧은 한글 단어
  for (const line of lines.slice(0, 10)) {
    const match = line.match(/^([가-힣]{2,4})[\s\u00A0]/)
    if (match) return match[1]
  }
  return null
}

function extractLargestImage(pdfPath, pageNum, outPrefix) {
  try {
    spawnSync('pdfimages', [
      '-j', '-f', String(pageNum), '-l', String(pageNum),
      pdfPath, outPrefix
    ], { timeout: 15000 })

    // 추출된 파일 중 가장 큰 JPG 찾기
    const dir = path.dirname(outPrefix)
    const prefix = path.basename(outPrefix)
    const files = fs.readdirSync(dir)
      .filter(f => f.startsWith(prefix) && (f.endsWith('.jpg') || f.endsWith('.jpeg')))
      .map(f => ({ name: f, size: fs.statSync(path.join(dir, f)).size }))
      .sort((a, b) => b.size - a.size)

    if (files.length === 0) return null
    if (files[0].size < 5000) return null // 너무 작은 이미지 제외 (아이콘 등)

    return path.join(dir, files[0].name)
  } catch { return null }
}

async function uploadPhoto(imagePath, speakerId) {
  const buffer = fs.readFileSync(imagePath)
  const ext = path.extname(imagePath).slice(1) || 'jpg'
  const timestamp = Date.now()
  const random = Math.random().toString(36).slice(2, 7)
  const storagePath = `${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2,'0')}/${timestamp}_${random}.${ext}`

  const { error } = await supabase.storage
    .from('speakers')
    .upload(storagePath, buffer, {
      contentType: 'image/jpeg',
      upsert: false,
    })

  if (error) throw new Error(error.message)

  const { data: { publicUrl } } = supabase.storage
    .from('speakers')
    .getPublicUrl(storagePath)

  return publicUrl
}

async function main() {
  console.log('=== 강사 사진 PDF 추출 시작 ===\n')

  // 1. DB 강사 목록 로드
  console.log('DB 강사 목록 로드 중...')
  const speakers = await loadAllSpeakers()
  console.log(`  강사 ${speakers.length}명 로드됨`)

  // 이름 → 강사 객체 매핑
  const speakerByName = {}
  for (const s of speakers) {
    speakerByName[s.name] = s
  }

  // 2. 큰 PDF 파일 목록
  const pdfFiles = fs.readdirSync(INBOUND_DIR)
    .filter(f => f.endsWith('.pdf'))
    .map(f => path.join(INBOUND_DIR, f))
    .filter(f => fs.statSync(f).size >= MIN_SIZE)
    .sort()

  console.log(`\n처리할 PDF: ${pdfFiles.length}개`)

  fs.mkdirSync(WORK_DIR, { recursive: true })

  let pageCount = 0
  let matched = 0

  for (const pdfPath of pdfFiles) {
    // PDF 페이지 수 확인
    let totalPages = 0
    try {
      const info = spawnSync('pdfinfo', [pdfPath], { encoding: 'utf8', timeout: 10000 })
      const m = info.stdout.match(/Pages:\s+(\d+)/)
      if (m) totalPages = parseInt(m[1])
    } catch { continue }

    if (totalPages === 0) continue
    console.log(`\n[${path.basename(pdfPath)}] ${totalPages}페이지 처리 중...`)

    for (let pg = 1; pg <= totalPages; pg++) {
      pageCount++
      const text = extractPageText(pdfPath, pg)
      const name = extractSpeakerName(text)

      if (!name) {
        console.log(`  p${pg}: 이름 추출 실패 (skip)`)
        continue
      }

      const speaker = speakerByName[name]
      if (!speaker) {
        console.log(`  p${pg}: [${name}] DB에 없음`)
        results.notFound.push(name)
        continue
      }

      // 이미 사진 있으면 skip
      if (speaker.photo_url) {
        console.log(`  p${pg}: [${name}] 이미 사진 있음 (skip)`)
        continue
      }

      // 이미지 추출
      const outPrefix = path.join(WORK_DIR, `p${pg}_${name}`)
      const imgPath = extractLargestImage(pdfPath, pg, outPrefix)

      if (!imgPath) {
        console.log(`  p${pg}: [${name}] 이미지 없음`)
        results.noPhoto.push(name)
        continue
      }

      // 업로드
      try {
        const photoUrl = await uploadPhoto(imgPath, speaker.id)

        // DB 업데이트
        const { error } = await supabase
          .from('speakers')
          .update({ photo_url: photoUrl })
          .eq('id', speaker.id)

        if (error) throw new Error(error.message)

        console.log(`  p${pg}: [${name}] ✅ 업로드 완료`)
        results.uploaded.push({ name, url: photoUrl })
        speaker.photo_url = photoUrl // 중복 처리 방지
        matched++

        // 임시 파일 정리
        fs.unlinkSync(imgPath)
      } catch (err) {
        console.log(`  p${pg}: [${name}] ❌ 오류: ${err.message}`)
        results.errors.push({ name, error: err.message })
      }
    }
  }

  console.log('\n=== 완료 ===')
  console.log(`총 페이지: ${pageCount}`)
  console.log(`업로드 성공: ${results.uploaded.length}`)
  console.log(`DB 없음: ${results.notFound.length}`)
  console.log(`사진 없음: ${results.noPhoto.length}`)
  console.log(`오류: ${results.errors.length}`)

  if (results.notFound.length > 0) {
    console.log('\n⚠️ DB에서 찾지 못한 강사 (이름 매칭 실패):')
    const unique = [...new Set(results.notFound)]
    unique.slice(0, 30).forEach(n => console.log(`  - ${n}`))
  }

  // 결과 저장
  fs.writeFileSync('/tmp/pdf_extract/results.json', JSON.stringify(results, null, 2))
  console.log('\n결과 저장: /tmp/pdf_extract/results.json')
}

main().catch(err => {
  console.error('치명적 오류:', err)
  process.exit(1)
})
