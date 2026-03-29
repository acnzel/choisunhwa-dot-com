import Parser from 'rss-parser'

export interface RawArticle {
  title: string
  link: string
  pubDate: Date
  content: string
  source: string
}

const parser = new Parser({
  timeout: 15_000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*',
  },
})

function naver(query: string): string {
  return `https://search.naver.com/rss.nhn?where=news&query=${encodeURIComponent(query)}`
}

// 클라우드 환경에서 안정적으로 작동하는 RSS 소스
// (Google News RSS는 클라우드 IP 차단으로 제외)
const RSS_SOURCES = [
  { name: '네이버 뉴스', url: naver('리더십 조직문화 HR') },
  { name: '네이버 뉴스', url: naver('기업교육 강연 트렌드') },
  { name: '네이버 뉴스', url: naver('동기부여 번아웃 직장') },
  { name: '매일경제', url: 'https://www.mk.co.kr/rss/30100041/' },
  { name: '한국경제', url: 'https://www.hankyung.com/feed/economy' },
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
