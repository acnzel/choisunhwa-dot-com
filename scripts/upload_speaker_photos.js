const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const { execSync } = require('child_process')

const supabase = createClient(
  'https://ahcrxdegumqfdwvafhvc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoY3J4ZGVndW1xZmR3dmFmaHZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk4MzY4OCwiZXhwIjoyMDg3NTU5Njg4fQ.wu5EFLI0Ec_nWZeD1A_Ae-n2SOTrM6ajRl6_At4eNCY'
)

const PDF = '/Users/com/.openclaw/media/inbound/file_10---6bab27ef-e536-47bb-a2b7-8bf5da7b9989.pdf'
const IMG_DIR = '/tmp/speaker_images/raw'

// 페이지 → DB 이름 매핑 (수동 확인 완료)
const PAGE_NAME_MAP = {
  1:  '서은국',   2:  '김성준',   3:  '박현주',   4:  '허지이',
  5:  '박찬균',   6:  '엄명섭',   7:  '이인우',   8:  '노현탁',
  9:  '홍석환',   10: '허대식',   11: '류랑도',   12: '이민영',
  13: '홍경식',   14: '박종훈',   15: '김진일',   16: '김학균',
  17: '조영무',   18: '전경일',   19: '임용수',   20: '반병현',
  21: '장병준',   22: '이현',     23: '신지현',   24: '이찬',
  25: '정재승',   26: '차두원',   27: '김작가',   28: '고명환',
  29: '강성태',   30: '정상범',   31: '김영수',   32: '김주연',
  33: '문경수',   34: '박정호',   35: '임영환',   36: '윤영철',
  37: '박성준',   38: '궤도',     39: '이홍열',   40: '박찬우',
  41: '유경철',   42: '신제구',   43: '허일무',   44: '이영범',
  45: null,       // 이름 미확인
  46: '박태현',   47: '민희정',   48: '현미숙',   49: '조영태',
  50: '전영수',
}

// pdfimages -list 파싱: page → 가장 큰 jpeg 이미지 번호
function buildPageImageMap() {
  const listOutput = execSync(`pdfimages -list "${PDF}" 2>/dev/null`).toString()
  const map = {} // page → {num, size}
  for (const line of listOutput.split('\n')) {
    if (!line.includes('jpeg')) continue
    const parts = line.trim().split(/\s+/)
    if (parts.length < 5) continue
    const page = parseInt(parts[0])
    const num = parseInt(parts[1])
    const w = parseInt(parts[3])
    const h = parseInt(parts[4])
    const size = w * h
    if (!map[page] || size > map[page].size) {
      map[page] = { num, size }
    }
  }
  return map
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function main() {
  // DB 이름→id 맵 (photo_url 없는 것만)
  const { data: speakers } = await supabase
    .from('speakers').select('id, name, photo_url')
  const nameToSpeaker = {}
  for (const s of speakers) nameToSpeaker[s.name] = s

  const pageImageMap = buildPageImageMap()
  console.log('페이지→이미지 맵 완료:', Object.keys(pageImageMap).length, '개')

  let success = 0, skipped = 0, errors = 0

  for (const [pageStr, name] of Object.entries(PAGE_NAME_MAP)) {
    const page = parseInt(pageStr)

    if (!name) {
      console.log(`PAGE ${page}: 이름 미확인 → 스킵`)
      skipped++
      continue
    }

    const speaker = nameToSpeaker[name]
    if (!speaker) {
      console.log(`PAGE ${page} [${name}]: DB에 없음 → 스킵`)
      skipped++
      continue
    }

    if (speaker.photo_url) {
      console.log(`PAGE ${page} [${name}]: 이미 사진 있음 → 스킵`)
      skipped++
      continue
    }

    const imgInfo = pageImageMap[page]
    if (!imgInfo) {
      console.log(`PAGE ${page} [${name}]: 이미지 없음 → 스킵`)
      skipped++
      continue
    }

    const imgPath = `${IMG_DIR}/img-${String(imgInfo.num).padStart(3, '0')}.jpg`
    if (!fs.existsSync(imgPath)) {
      console.log(`PAGE ${page} [${name}]: 파일 없음 (${imgPath}) → 스킵`)
      skipped++
      continue
    }

    // Supabase storage 업로드
    const storagePath = `${speaker.id}.jpg`
    const fileBuffer = fs.readFileSync(imgPath)

    const { error: uploadErr } = await supabase.storage
      .from('speakers')
      .upload(storagePath, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      })

    if (uploadErr) {
      console.error(`PAGE ${page} [${name}]: 업로드 실패 → ${uploadErr.message}`)
      errors++
      continue
    }

    const { data: urlData } = supabase.storage.from('speakers').getPublicUrl(storagePath)
    const photoUrl = urlData.publicUrl

    const { error: updateErr } = await supabase
      .from('speakers').update({ photo_url: photoUrl }).eq('id', speaker.id)

    if (updateErr) {
      console.error(`PAGE ${page} [${name}]: photo_url 업데이트 실패 → ${updateErr.message}`)
      errors++
    } else {
      console.log(`✅ PAGE ${page} [${name}]`)
      success++
    }

    await sleep(200)
  }

  console.log(`\n=== 완료 ===`)
  console.log(`성공: ${success} / 스킵: ${skipped} / 에러: ${errors}`)
}

main()
