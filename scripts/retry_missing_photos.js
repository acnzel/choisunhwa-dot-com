/**
 * 사진 없는 70명 재추출 — 이미지 조건 완화 + PNG 포함 + -j 제거
 * 모든 이미지 형식 추출 후 가장 큰 것 사용
 */
const { spawnSync } = require('child_process')
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const SUPABASE_URL = 'https://ahcrxdegumqfdwvafhvc.supabase.co'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoY3J4ZGVndW1xZmR3dmFmaHZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk4MzY4OCwiZXhwIjoyMDg3NTU5Njg4fQ.wu5EFLI0Ec_nWZeD1A_Ae-n2SOTrM6ajRl6_At4eNCY'
const supabase = createClient(SUPABASE_URL, SERVICE_KEY)
const PDF_PATH = '/Users/com/.openclaw/media/inbound/file_new_gdrive_589pages.pdf'
const WORK_DIR = '/tmp/pdf_retry'
const MIN_SIZE = 2000 // 2KB로 완화

fs.mkdirSync(WORK_DIR, { recursive: true })

// 사진 없는 강사 이름 목록
const MISSING_NAMES = [
  '강성지','고현숙','구성애','김동준','김상균','김석영','김성일','김영욱','김재연','김제경',
  '김준형(카준형)','김찬호','노은정','노준영','말버스(임대혁)','미키김(김현유)','박정선','박정연',
  '박지헌','박태웅','배나영','서거원','서정욱','승효상','신고은','신동엽','신상원','신상훈',
  '신정민','썬킴','안혜원','안효정','엄홍길','윤석찬','윤여순','이다랑','이상림','이상은',
  '이선호','이소영','이승필','이시훈','이윤진','이지안','이항심','이호','이효종(과학쿠키)',
  '임영균','장강명','정대균','정은이','정인성','정재환','정지훈','정태익(부읽남)','정흥수',
  '최두옥','최명화','최승필','최인아','최지혜','한다혜','한상기','한수정','한영민','한이준',
  '허은녕','홍종윤','황인경','황현진'
]

function extractPageText(pageNum) {
  const r = spawnSync('pdftotext', ['-f', String(pageNum), '-l', String(pageNum), '-layout', PDF_PATH, '-'], { encoding: 'utf8', timeout: 15000 })
  return r.stdout || ''
}

function extractSpeakerName(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('강연분야')) {
      for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
        const m = lines[j].match(/^([가-힣]{2,5}[\(\)가-힣a-zA-Z]*)[\s\u00A0]/)
        if (m) return m[1]
      }
      break
    }
  }
  for (const line of lines.slice(0, 15)) {
    const m = line.match(/^([가-힣]{2,4}[\(\)가-힣a-zA-Z]*)[\s\u00A0]/)
    if (m && !m[1].match(/^(강연|경력|학력|저서|출강|소속|방송|기업|대표)/)) return m[1]
  }
  return null
}

function tryExtractImage(pageNum, outPrefix) {
  // 방법 1: -j (JPEG 우선)
  spawnSync('pdfimages', ['-j', '-f', String(pageNum), '-l', String(pageNum), PDF_PATH, outPrefix + '_j'], { timeout: 20000 })
  // 방법 2: 플래그 없음 (PPM/PBM 포함 전체)
  spawnSync('pdfimages', ['-f', String(pageNum), '-l', String(pageNum), PDF_PATH, outPrefix + '_a'], { timeout: 20000 })
  // 방법 3: -png
  spawnSync('pdfimages', ['-png', '-f', String(pageNum), '-l', String(pageNum), PDF_PATH, outPrefix + '_p'], { timeout: 20000 })

  // 모든 파일 수집
  const dir = path.dirname(outPrefix)
  const base = path.basename(outPrefix)
  const exts = ['.jpg', '.jpeg', '.png', '.ppm', '.pbm']
  const files = fs.readdirSync(dir)
    .filter(f => f.startsWith(base) && exts.some(e => f.endsWith(e)))
    .map(f => ({ name: f, size: fs.statSync(path.join(dir, f)).size }))
    .filter(f => f.size >= MIN_SIZE)
    .sort((a, b) => b.size - a.size)

  return files.length > 0 ? path.join(dir, files[0].name) : null
}

async function uploadPhoto(imagePath) {
  let buffer = fs.readFileSync(imagePath)
  // PPM → JPEG 변환 필요한 경우 (ppm 파일)
  if (imagePath.endsWith('.ppm') || imagePath.endsWith('.pbm')) {
    // convert using ImageMagick if available
    const tmp = imagePath.replace(/\.(ppm|pbm)$/, '_conv.jpg')
    spawnSync('convert', [imagePath, tmp], { timeout: 10000 })
    if (fs.existsSync(tmp)) {
      buffer = fs.readFileSync(tmp)
      try { fs.unlinkSync(tmp) } catch {}
    }
  }
  const timestamp = Date.now()
  const random = Math.random().toString(36).slice(2, 7)
  const storagePath = `2026/03/${timestamp}_${random}.jpg`
  const { error } = await supabase.storage.from('speakers').upload(storagePath, buffer, { contentType: 'image/jpeg', upsert: false })
  if (error) throw new Error(error.message)
  const { data: { publicUrl } } = supabase.storage.from('speakers').getPublicUrl(storagePath)
  return publicUrl
}

async function main() {
  console.log('=== 사진 없는 강사 재추출 ===')
  const { data: speakers } = await supabase.from('speakers').select('id,name,company,photo_url').order('name')
  const speakerMap = {}
  for (const s of speakers) speakerMap[s.name] = s

  // PDF 전체 스캔 — 해당 강사 이름 발견 시만 처리
  const info = spawnSync('pdfinfo', [PDF_PATH], { encoding: 'utf8' })
  const totalPages = parseInt(info.stdout.match(/Pages:\s+(\d+)/)?.[1] || '0')
  console.log(`총 페이지: ${totalPages} / 찾을 강사: ${MISSING_NAMES.length}명`)

  const uploaded = []
  const stillMissing = []
  const found = new Set()

  for (let pg = 1; pg <= totalPages; pg++) {
    if (found.size >= MISSING_NAMES.length) break

    const text = extractPageText(pg)
    const name = extractSpeakerName(text)
    if (!name) continue

    // 대상 강사인지 확인 (완전 일치 또는 포함)
    const target = MISSING_NAMES.find(n => n === name || n.startsWith(name) || name.startsWith(n.split('(')[0]))
    if (!target) continue
    if (found.has(target)) continue

    const speaker = speakerMap[target]
    if (!speaker) { console.log(`p${pg}: [${name}→${target}] DB 없음`); continue }
    if (speaker.photo_url) { found.add(target); continue }

    console.log(`p${pg}: [${target}] 이미지 재추출 시도...`)
    const outPrefix = path.join(WORK_DIR, `p${pg}_${target.replace(/[^가-힣a-zA-Z0-9]/g, '_')}`)
    const imgPath = tryExtractImage(pg, outPrefix)

    if (!imgPath) {
      console.log(`  ❌ 이미지 없음 (모든 방법 실패)`)
      stillMissing.push({ name: target, page: pg })
      found.add(target)
      continue
    }

    try {
      const photoUrl = await uploadPhoto(imgPath)
      await supabase.from('speakers').update({ photo_url: photoUrl }).eq('id', speaker.id)
      console.log(`  ✅ 업로드 완료 (${Math.round(fs.statSync(imgPath).size/1024)}KB)`)
      uploaded.push(target)
      found.add(target)
      try { fs.unlinkSync(imgPath) } catch {}
    } catch(e) {
      console.log(`  ❌ 업로드 실패: ${e.message}`)
      stillMissing.push({ name: target, page: pg, err: e.message })
      found.add(target)
    }
  }

  console.log(`\n=== 완료 ===`)
  console.log(`업로드: ${uploaded.length}명`)
  console.log(`여전히 없음: ${stillMissing.length}명`)
  if (stillMissing.length > 0) {
    console.log('\n⚠️ 여전히 사진 없음:')
    stillMissing.forEach(m => console.log(`  - ${m.name} (p${m.page})`))
  }
  fs.writeFileSync('/tmp/pdf_retry/results.json', JSON.stringify({ uploaded, stillMissing }, null, 2))
}

main().catch(console.error)
