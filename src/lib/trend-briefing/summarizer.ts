import Anthropic from '@anthropic-ai/sdk'
import type { RawArticle } from './collector'

export interface ProcessedArticle {
  title: string
  summary: string
  content_html: string
  tags: string[]
  source_url: string
  source_name: string
}

const VALID_TAGS = [
  '리더십', '조직문화', 'HR', '동기부여', '경영전략', '소통',
  'IT', 'ESG', '창업', '심리', '경제', '자기계발', '인문학',
  '교육', '건강', '창의', '팀워크', '비즈니스매너',
]

function buildPrompt(article: RawArticle): string {
  return `당신은 강연 기획사 최선화닷컴의 인사이트 콘텐츠 에디터입니다.
독자: 기업 HR 담당자, 경영진, 강연 기획자
톤: 전문적이되 읽기 쉽게. 제일 매거진 Insight 스타일.

다음 뉴스 기사를 강연 기획사 인사이트 콘텐츠로 재가공하세요.

원문 제목: ${article.title}
원문 링크: ${article.link}
원문 요약: ${article.content.slice(0, 1000)}

출력 형식 (JSON만, 다른 텍스트 없이):
{
  "title": "35자 이내, 궁금증 유발형 또는 인사이트형 제목 (원문 리라이팅)",
  "summary": "2~3문장 핵심 요약 (독자가 얻을 인사이트 중심)",
  "content_html": "HTML 형식 본문 (400자 이상 필수). H2 소제목 2개 이상. 수치/데이터 1개 이상 포함. 마지막 문단 반드시 포함: <strong>이런 강연이 필요하다면: [카테고리]</strong>. 마지막에 <p style='font-size:13px;color:#888;'>출처: 매체명, 원문</p>",
  "tags": ["${VALID_TAGS.join('", "')} 중 1~3개"]
}

규칙:
- 과장, 광고성 표현 금지
- 수치가 없으면 관련 연구/통계 자연스럽게 인용 가능
- 반드시 JSON만 출력`
}

export async function summarizeArticle(article: RawArticle): Promise<ProcessedArticle | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY 미설정')
    return null
  }

  const client = new Anthropic({ apiKey })

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1500,
      messages: [
        { role: 'user', content: buildPrompt(article) },
      ],
    })

    const raw = message.content[0]?.type === 'text' ? message.content[0].text : null
    if (!raw) return null

    // JSON 파싱 (```json ... ``` 블록 있을 경우 제거)
    const jsonStr = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()
    const parsed = JSON.parse(jsonStr)

    return {
      title: parsed.title ?? article.title,
      summary: parsed.summary ?? '',
      content_html: parsed.content_html ?? '',
      tags: Array.isArray(parsed.tags)
        ? parsed.tags.filter((t: string) => VALID_TAGS.includes(t)).slice(0, 3)
        : [],
      source_url: article.link,
      source_name: article.source,
    }
  } catch (err) {
    console.error('Claude 요약 실패:', article.title, err)
    return null
  }
}
