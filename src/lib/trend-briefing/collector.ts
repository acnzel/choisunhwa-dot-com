import Parser from 'rss-parser'

export interface RawArticle {
  title: string
  link: string
  pubDate: Date
  content: string
  source: string
}

const parser = new Parser({
  timeout: 10_000,
  headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TrendBriefingBot/1.0)' },
})

function gnews(query: string): string {
  return `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=ko&gl=KR&ceid=KR:ko`
}

// Google News RSS — 키워드별 검색
const RSS_SOURCES = [
  { name: 'Google News', url: gnews('리더십 조직문화 HR') },
  { name: 'Google News', url: gnews('기업교육 강연 트렌드') },
  { name: 'Google News', url: gnews('경영전략 조직 성과관리') },
  { name: 'Google News', url: gnews('MZ세대 세대갈등 직장') },
  { name: 'Google News', url: gnews('동기부여 번아웃 심리적안전감') },
]

const KEYWORDS = [
  '리더십', '조직문화', 'HR', '인사', '동기부여', 'MZ세대', '강연',
  '인사이트', '트렌드', '경영전략', '성장', '커뮤니케이션', 'ESG',
  '번아웃', '세대갈등', '직장', '퍼포먼스', '팀빌딩', '코칭', '교육',
  '워크숍', '자기계발', '창의', '혁신', '디지털전환',
]

function isRecent(date: Date, hoursBack = 48): boolean {
  return Date.now() - date.getTime() < hoursBack * 60 * 60 * 1000
}

function hasKeyword(text: string): boolean {
  const lower = text.toLowerCase()
  return KEYWORDS.some(kw => lower.includes(kw.toLowerCase()))
}

export async function collectArticles(maxArticles = 4): Promise<RawArticle[]> {
  const seen = new Set<string>()
  const candidates: RawArticle[] = []

  await Promise.allSettled(
    RSS_SOURCES.map(async ({ name, url }) => {
      try {
        const feed = await parser.parseURL(url)
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
          candidates.push({ title, link, pubDate, content, source: name })
        }
      } catch (err) {
        console.warn(`RSS fetch failed: ${url}`, err)
      }
    })
  )

  // 최신순 정렬 후 상위 maxArticles 반환
  candidates.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
  return candidates.slice(0, maxArticles)
}
