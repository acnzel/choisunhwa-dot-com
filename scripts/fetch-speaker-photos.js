/**
 * 강사 사진 자동 수집 및 업로드 스크립트
 *
 * 소스 우선순위:
 *   1. 강사야 (gangsaya.co.kr) — 국내 강사 플랫폼
 *   2. 채널PNF (channelpnf.co.kr)
 *   3. 강연365
 *
 * 실행:
 *   node scripts/fetch-speaker-photos.js --dry-run    → URL만 찾고 다운로드 안 함
 *   node scripts/fetch-speaker-photos.js              → 실제 다운로드 + Supabase 업로드
 *   node scripts/fetch-speaker-photos.js --limit=50   → 처음 N명만 처리
 *
 * 주의: 저작권 정식 해결 예정 전 내부 사용 목적
 */

const { createClient } = require('@supabase/supabase-js')
const https = require('https')
const http = require('http')
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const DRY_RUN = process.argv.includes('--dry-run')
const LIMIT_ARG = process.argv.find(a => a.startsWith('--limit='))
const LIMIT = LIMIT_ARG ? parseInt(LIMIT_ARG.split('=')[1]) : Infinity

const sb = createClient(
  'https://ahcrxdegumqfdwvafhvc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoY3J4ZGVndW1xZmR3dmFmaHZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk4MzY4OCwiZXhwIjoyMDg3NTU5Njg4fQ.wu5EFLI0Ec_nWZeD1A_Ae-n2SOTrM6ajRl6_At4eNCY'
)

const RESULTS_FILE = path.join(__dirname, 'photo-results.json')
const results = fs.existsSync(RESULTS_FILE) ? JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf-8')) : {}

// ── HTTP 요청 헬퍼 ───────────────────────────────────────────
function fetchUrl(url, encoding = 'utf-8') {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http
    const req = mod.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,*/*',
        'Accept-Language': 'ko-KR,ko;q=0.9',
      },
      timeout: 15000,
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetchUrl(res.headers.location, encoding).then(resolve).catch(reject)
      }
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end', () => {
        const buf = Buffer.concat(chunks)
        if (encoding === 'euckr') {
          // iconv 없으면 latin1으로 임시 처리
          try {
            const decoded = execSync(`echo "${buf.toString('base64')}" | base64 -d | iconv -f EUC-KR -t UTF-8 2>/dev/null || true`, { encoding: 'utf-8' })
            resolve(decoded)
          } catch {
            resolve(buf.toString('latin1'))
          }
        } else {
          resolve(buf.toString('utf-8'))
        }
      })
      res.on('error', reject)
    })
    req.on('error', reject)
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')) })
  })
}

function downloadBuffer(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http
    const req = mod.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 20000,
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadBuffer(res.headers.location).then(resolve).catch(reject)
      }
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end', () => resolve(Buffer.concat(chunks)))
      res.on('error', reject)
    })
    req.on('error', reject)
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')) })
  })
}

// ── 강사야 검색 ─────────────────────────────────────────────
async function searchGangsaya(name) {
  try {
    // 이름을 EUC-KR URL 인코딩
    const encoded = execSync(`python3 -c "import urllib.parse; print(urllib.parse.quote('${name}', encoding='euc-kr'))"`, { encoding: 'utf-8' }).trim()
    const searchUrl = `https://gangsaya.co.kr/board/index.html?id=famous12&type=famous&search_name=${encoded}&search_part=name`
    const html = await fetchUrl(searchUrl, 'euckr')

    // 강사 프로필 이미지 패턴 추출
    const profileMatch = html.match(/\/PEG\/speaker\/.*?\.(?:jpg|jpeg|png|webp)/i)
    if (profileMatch) {
      return `https://gangsaya.co.kr${profileMatch[0]}`
    }

    // 대안: 썸네일 이미지
    const thumbMatch = html.match(/(?:thumb|profile|speaker).*?\.(?:jpg|jpeg|png)/i)
    if (thumbMatch) return `https://gangsaya.co.kr${thumbMatch[0]}`

    return null
  } catch {
    return null
  }
}

// ── 채널PNF 검색 ─────────────────────────────────────────────
async function searchChannelPNF(name) {
  try {
    const encoded = encodeURIComponent(name)
    const url = `https://channelpnf.co.kr/speaker?search=${encoded}`
    const html = await fetchUrl(url)

    const match = html.match(/(?:src|data-src)=["']([^"']*(?:speaker|profile|lecturer)[^"']*\.(?:jpg|jpeg|png|webp))/i)
    if (match) {
      const imgUrl = match[1]
      return imgUrl.startsWith('http') ? imgUrl : `https://channelpnf.co.kr${imgUrl}`
    }
    return null
  } catch {
    return null
  }
}

// ── 강연365 검색 ─────────────────────────────────────────────
async function searchLecture365(name) {
  try {
    const encoded = encodeURIComponent(name)
    const url = `https://www.lecture365.com/lecturer/search?q=${encoded}`
    const html = await fetchUrl(url)

    const match = html.match(/(?:src|data-src)=["']([^"']*(?:photo|profile|img)[^"']*\.(?:jpg|jpeg|png|webp))/i)
    if (match) {
      const imgUrl = match[1]
      return imgUrl.startsWith('http') ? imgUrl : `https://www.lecture365.com${imgUrl}`
    }
    return null
  } catch {
    return null
  }
}

// ── 이름+소속 검증 ────────────────────────────────────────────
function verifyNameOnPage(html, name, company) {
  if (!html) return false
  // 이름과 소속이 모두 페이지에 있으면 맞는 사람으로 판단
  const nameOk = html.includes(name)
  const companyKeyword = (company || '').split(/[\s\/·]+/)[0]  // 첫 단어만
  const companyOk = !company || html.includes(companyKeyword)
  return nameOk && companyOk
}

// ── Supabase 스토리지 업로드 ──────────────────────────────────
async function uploadToSupabase(speakerId, imageBuffer, mimeType = 'image/jpeg') {
  const ext = mimeType.includes('png') ? 'png' : 'jpg'
  const filePath = `${speakerId}.${ext}`

  const { error } = await sb.storage
    .from('speakers')
    .upload(filePath, imageBuffer, {
      contentType: mimeType,
      upsert: true,
    })

  if (error) throw error

  const { data: { publicUrl } } = sb.storage.from('speakers').getPublicUrl(filePath)
  return publicUrl
}

// ── 메인 ────────────────────────────────────────────────────
async function main() {
  console.log(`\n📸 강사 사진 수집기`)
  console.log(`모드: ${DRY_RUN ? '🔵 DRY-RUN' : '🟠 실제 업로드'}\n`)

  // 사진 없는 강사 조회
  const { data: speakers, error } = await sb
    .from('speakers')
    .select('id, name, company, title')
    .or('photo_url.is.null,photo_url.eq.')
    .order('created_at')
    .limit(LIMIT)

  if (error) { console.error('조회 실패:', error); process.exit(1) }
  console.log(`사진 없는 강사: ${speakers.length}명\n`)

  let found = 0, uploaded = 0, failed = 0

  for (let i = 0; i < speakers.length; i++) {
    const sp = speakers[i]

    // 이미 처리된 경우 스킵
    if (results[sp.id]?.status === 'done') { console.log(`[${i+1}] ${sp.name} — 이미 완료`); found++; continue }

    process.stdout.write(`[${i+1}/${speakers.length}] ${sp.name} (${sp.company}) ... `)

    // 소스 순서대로 시도
    let photoUrl = null
    let source = null

    photoUrl = await searchGangsaya(sp.name)
    if (photoUrl) source = 'gangsaya'

    if (!photoUrl) {
      photoUrl = await searchChannelPNF(sp.name)
      if (photoUrl) source = 'channelpnf'
    }

    if (!photoUrl) {
      photoUrl = await searchLecture365(sp.name)
      if (photoUrl) source = 'lecture365'
    }

    if (!photoUrl) {
      console.log(`❌ 사진 없음`)
      results[sp.id] = { name: sp.name, status: 'not_found' }
      failed++
      await new Promise(r => setTimeout(r, 300))
      continue
    }

    console.log(`✅ ${source} → ${photoUrl.substring(0, 60)}`)
    found++

    if (DRY_RUN) {
      results[sp.id] = { name: sp.name, status: 'found_dry', url: photoUrl, source }
      await new Promise(r => setTimeout(r, 200))
      continue
    }

    // 다운로드 + 업로드
    try {
      const buf = await downloadBuffer(photoUrl)
      const mimeType = photoUrl.toLowerCase().includes('.png') ? 'image/png' : 'image/jpeg'
      const publicUrl = await uploadToSupabase(sp.id, buf, mimeType)

      // DB 업데이트
      await sb.from('speakers').update({ photo_url: publicUrl }).eq('id', sp.id)

      results[sp.id] = { name: sp.name, status: 'done', source, originalUrl: photoUrl, publicUrl }
      uploaded++
    } catch (e) {
      console.log(`  ⚠️ 업로드 실패: ${e.message}`)
      results[sp.id] = { name: sp.name, status: 'upload_failed', url: photoUrl, error: e.message }
    }

    // 결과 중간 저장 (10건마다)
    if ((i + 1) % 10 === 0) {
      fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2))
    }

    await new Promise(r => setTimeout(r, 500))  // rate limit
  }

  // 최종 저장
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2))

  console.log(`\n── 완료 ──`)
  console.log(`발견: ${found}건 / 업로드: ${uploaded}건 / 실패: ${failed}건`)
  console.log(`결과 파일: ${RESULTS_FILE}`)
}

main().catch(console.error)
