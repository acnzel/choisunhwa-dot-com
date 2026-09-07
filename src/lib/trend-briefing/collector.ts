import Parser from 'rss-parser'

export interface RawArticle {
  title: string
  link: string
  pubDate: Date
  content: string
  source: string
}

// Chrome 등 브라우저를 사칭하는 User-Agent는 일부 언론사(한국경제 등)의
// Cloudflare 봇 차단에 걸려 403이 난다. UA를 지정하지 않으면(curl 기본
// UA와 동일한 원리) 오히려 통과된다 — 브라우저 서명을 흉내 내다 실패하는
// 케이스로 보인다.
const parser = new Parser({
  timeout: 15_000,
  headers: {
    'Accept': 'application/rss+xml, application/xml, text/xml, */*',
  },
})

// 네이버 뉴스 검색 RSS(search.naver.com/rss.nhn)는 네이버가 서비스 자체를
// 폐지해 전량 404 — 대체 불가로 제거. 아래 7개는 전부 UA 없이 200 확인됨.
// 이데일리(rss.edaily.co.kr)는 서버 측 TLS 설정 문제로 정상적인 TLS 1.2
// 핸드셰이크 자체가 실패해(openssl s_client로도 재현됨) 제외.
const RSS_SOURCES = [
  { name: '매일경제', url: 'https://www.mk.co.kr/rss/30100041/' },
  { name: '한국경제', url: 'https://www.hankyung.com/feed/economy' },
  { name: '동아일보', url: 'https://rss.donga.com/economy.xml' },
  { name: '연합뉴스', url: 'https://www.yna.co.kr/rss/economy.xml' },
  { name: '머니투데이', url: 'https://rss.mt.co.kr/mt_news.xml' },
  { name: '한겨레', url: 'https://www.hani.co.kr/rss/economy' },
]

const KEYWORDS = [
  '리더십', '조직문화', 'HR', '인사', '동기부여', 'MZ세대', '강연',
  '인사이트', '트렌드', '경영전략', '성장', '커뮤니케이션', 'ESG',
  '번아웃', '세대갈등', '직장', '퍼포먼스', '팀빌딩', '코칭', '교육',
  '워크숍', '자기계발', '창의', '혁신', '디지털전환',
]

function isRecent(date: Date, hoursBack = 72): boolean {
  return Date.now() - date.getTime() < hoursBack * 60 * 60 * 1000
}

function hasKeyword(text: string): boolean {
  const lower = text.toLowerCase()
  return KEYWORDS.some(kw => lower.includes(kw.toLowerCase()))
}

export async function collectArticles(maxArticles = 4): Promise<RawArticle[]> {
  const seen = new Set<string>()
  const candidates: RawArticle[] = []

  const results = await Promise.allSettled(
    RSS_SOURCES.map(async ({ name, url }) => {
      try {
        const feed = await parser.parseURL(url)
        const fetched: RawArticle[] = []
        for (const item of feed.items ?? []) {
          const link = item.link ?? item.guid ?? ''
          if (!link || seen.has(link)) continue

          const pubDate = item.pubDate ? new Date(item.pubDate) : new Date()
          if (!isRecent(pubDate)) continue

          const title = item.title ?? ''
          const content = item.contentSnippet ?? item.content ?? ''
          const combined = title + ' ' + content

          if (!hasKeyword(combined)) continue

          seen.add(link)
          fetched.push({ title, link, pubDate, content, source: name })
        }
        console.log(`[collector] ${name}: ${fetched.length}건 수집`)
        return fetched
      } catch (err) {
        console.warn(`[collector] RSS fetch failed: ${url}`, err)
        return []
      }
    })
  )

  for (const result of results) {
    if (result.status === 'fulfilled') {
      candidates.push(...result.value)
    }
  }

  // 최신순 정렬 후 상위 maxArticles 반환
  candidates.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
  return candidates.slice(0, maxArticles)
}
