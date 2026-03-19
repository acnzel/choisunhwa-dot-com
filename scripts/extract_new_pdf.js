/**
 * 신규 PDF (589페이지) 강사 사진 추출 → Supabase 업로드
 * 이름 + 소속 더블체크로 정확도 향상
 */

const { spawnSync } = require('child_process')
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const SUPABASE_URL = 'https://ahcrxdegumqfdwvafhvc.supabase.co'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoY3J4ZGVndW1xZmR3dmFmaHZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk4MzY4OCwiZXhwIjoyMDg3NTU5Njg4fQ.wu5EFLI0Ec_nWZeD1A_Ae-n2SOTrM6ajRl6_At4eNCY'
const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

const PDF_PATH = '/Users/com/.openclaw/media/inbound/file_new_gdrive_589pages.pdf'
const WORK_DIR = '/tmp/pdf_extract_new/work'

const results = { uploaded: [], notFound: [], noPhoto: [], skipped: [], errors: [] }

async function loadAllSpeakers() {
  const { data } = await supabase
    .from('speakers')
    .select('id, name, title, company, photo_url')
    .order('name')
  return data || []
}

function extractPageText(pageNum) {
  const result = spawnSync('pdftotext', [
    '-f', String(pageNum), '-l', String(pageNum),
    '-layout', PDF_PATH, '-'
  ], { encoding: 'utf8', timeout: 15000 })
  return result.stdout || ''
}

function extractSpeakerInfo(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)
  
  let name = null
  let affiliation = null

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('강연분야')) {
      for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
        const line = lines[j]
        // 이름은 2~4자 한글 + 공백
        const match = line.match(/^([가-힣]{2,5})[\s\u00A0](.*)/)
        if (match) {
          name = match[1]
          affiliation = match[2].trim().slice(0, 50) // 소속 앞부분
          break
        }
      }
      break
    }
  }
  
  // fallback: 첫 번째 짧은 한글 이름 패턴
  if (!name) {
    for (const line of lines.slice(0, 15)) {
      const match = line.match(/^([가-힣]{2,4})[\s\u00A0](.{5,})/)
      if (match && !match[1].match(/^(강연|경력|학력|저서|출강|소속|방송|포함)/)) {
        name = match[1]
        affiliation = match[2].trim().slice(0, 50)
        break
      }
    }
  }

  return { name, affiliation }
}

function extractLargestImage(pageNum, outPrefix) {
  try {
    spawnSync('pdfimages', [
      '-j', '-f', String(pageNum), '-l', String(pageNum),
      PDF_PATH, outPrefix
    ], { timeout: 20000 })

    const dir = path.dirname(outPrefix)
    const prefix = path.basename(outPrefix)
    const files = fs.readdirSync(dir)
      .filter(f => f.startsWith(prefix) && (f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png')))
      .map(f => ({ name: f, size: fs.statSync(path.join(dir, f)).size }))
      .sort((a, b) => b.size - a.size)

    if (files.length === 0) return null
    if (files[0].size < 10000) return null // 10KB 미만 = 아이콘류

    return path.join(dir, files[0].name)
  } catch { return null }
}

async function uploadPhoto(imagePath, speakerId) {
  const buffer = fs.readFileSync(imagePath)
  const ext = path.extname(imagePath).slice(1).replace('png', 'jpg') || 'jpg'
  const timestamp = Date.now()
  const random = Math.random().toString(36).slice(2, 7)
  const storagePath = `2026/03/${timestamp}_${random}.jpg`

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

// 이름+소속 유사도 체크
function matchSpeaker(speakers, name, affiliation) {
  // 1. 완전 이름 매치
  const exactMatches = speakers.filter(s => s.name === name)
  
  if (exactMatches.length === 0) return null
  if (exactMatches.length === 1) return exactMatches[0]
  
  // 2. 동명이인 처리: 소속으로 구별
  if (affiliation) {
    for (const s of exactMatches) {
      const company = (s.company || '').toLowerCase()
      const affLower = affiliation.toLowerCase()
      // 소속 첫 단어가 겹치는지 확인
      const affWords = affLower.split(/[\s,·]/).filter(w => w.length > 1)
      for (const w of affWords) {
        if (company.includes(w)) return s
      }
    }
  }
  
  // 3. 사진 없는 쪽 우선
  const noPhoto = exactMatches.find(s => !s.photo_url)
  return noPhoto || exactMatches[0]
}

async function main() {
  console.log('=== 신규 PDF 강사 사진 추출 ===')
  console.log(`파일: ${PDF_PATH}`)

  // PDF 페이지 수
  const info = spawnSync('pdfinfo', [PDF_PATH], { encoding: 'utf8' })
  const pageMatch = info.stdout.match(/Pages:\s+(\d+)/)
  const totalPages = pageMatch ? parseInt(pageMatch[1]) : 0
  console.log(`총 페이지: ${totalPages}`)

  // DB 강사 목록
  console.log('DB 로드 중...')
  const speakers = await loadAllSpeakers()
  console.log(`강사 ${speakers.length}명 (사진없음: ${speakers.filter(s=>!s.photo_url).length}명)`)

  fs.mkdirSync(WORK_DIR, { recursive: true })

  for (let pg = 1; pg <= totalPages; pg++) {
    const text = extractPageText(pg)
    const { name, affiliation } = extractSpeakerInfo(text)

    if (!name) {
      console.log(`p${pg}: 이름 추출 실패`)
      continue
    }

    const speaker = matchSpeaker(speakers, name, affiliation)
    
    if (!speaker) {
      console.log(`p${pg}: [${name}] DB에 없음`)
      results.notFound.push({ page: pg, name, affiliation })
      continue
    }

    if (speaker.photo_url) {
      results.skipped.push(name)
      if (pg % 50 === 0) console.log(`p${pg}: skip (이미 ${results.skipped.length}명 skip)`)
      continue
    }

    // 이미지 추출
    const outPrefix = path.join(WORK_DIR, `p${pg}`)
    const imgPath = extractLargestImage(pg, outPrefix)

    if (!imgPath) {
      console.log(`p${pg}: [${name}] 이미지 없음`)
      results.noPhoto.push(name)
      continue
    }

    try {
      const photoUrl = await uploadPhoto(imgPath, speaker.id)

      await supabase
        .from('speakers')
        .update({ photo_url: photoUrl })
        .eq('id', speaker.id)

      console.log(`p${pg}: [${name}] ✅ | ${affiliation?.slice(0,30)}`)
      results.uploaded.push({ page: pg, name, affiliation })
      speaker.photo_url = photoUrl // 중복방지

      // 임시파일 삭제
      try { fs.unlinkSync(imgPath) } catch {}
    } catch (err) {
      console.log(`p${pg}: [${name}] ❌ ${err.message}`)
      results.errors.push({ page: pg, name, error: err.message })
    }

    // 10명마다 중간 결과
    if (results.uploaded.length % 10 === 0 && results.uploaded.length > 0) {
      console.log(`\n--- 중간 현황: 업로드 ${results.uploaded.length}명 / skip ${results.skipped.length}명 / 오류 ${results.errors.length}건 ---\n`)
    }
  }

  console.log('\n=== 완료 ===')
  console.log(`업로드 성공: ${results.uploaded.length}명`)
  console.log(`이미 있음 (skip): ${results.skipped.length}명`)
  console.log(`이미지 없음: ${results.noPhoto.length}명`)
  console.log(`DB에 없음: ${results.notFound.length}명`)
  console.log(`오류: ${results.errors.length}건`)

  fs.writeFileSync('/tmp/extract_new_results.json', JSON.stringify(results, null, 2))
  console.log('\n결과 저장: /tmp/extract_new_results.json')
  
  if (results.notFound.length > 0) {
    console.log('\n⚠️ DB에 없는 강사 목록:')
    results.notFound.forEach(r => console.log(`  p${r.page}: ${r.name} / ${r.affiliation}`))
  }
}

main().catch(err => {
  console.error('치명적 오류:', err)
  process.exit(1)
})
