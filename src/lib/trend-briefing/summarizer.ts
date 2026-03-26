import OpenAI from 'openai'
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

const SYSTEM_PROMPT = `당신은 강연 기획사 최선화닷컴의 인사이트 콘텐츠 에디터입니다.
독자: 기업 HR 담당자, 경영진, 강연 기획자
톤: 전문적이되 읽기 쉽게. 제일 매거진 Insight 스타일.`

function buildUserPrompt(article: RawArticle): string {
  return `다음 뉴스 기사를 강연 기획사 인사이트 콘텐츠로 재가공하세요.

원문 제목: ${article.title}
원문 링크: ${article.link}
원문 요약: ${article.content.slice(0, 1000)}

출력 형식 (JSON):
{
  "title": "35자 이내, 궁금증 유발형 또는 인사이트형 제목",
  "summary": "2~3문장 핵심 요약 (독자가 얻을 인사이트 중심)",
  "content_html": "HTML 형식 본문 (400자 이상 필수). H2 소제목 2개 이상. 수치/데이터 1개 이상. 마지막 문단 반드시: <strong>이런 강연이 필요하다면: [카테고리]</strong>. 마지막에 <p style='font-size:13px;color:#888;'>출처: 매체명, 원문 링크</p>",
  "tags": ["${VALID_TAGS.join('", "')}" 중 1~3개]
}

규칙:
- title은 원문 제목을 그대로 쓰지 말고 리라이팅
- 수치가 없으면 관련 연구/통계 자연스럽게 인용 가능
- 과장, 광고성 표현 금지
- 반드시 JSON만 출력 (다른 텍스트 없이)`
}

export async function summarizeArticle(article: RawArticle): Promise<ProcessedArticle | null> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    console.error('OPENAI_API_KEY 미설정')
    return null
  }

  const openai = new OpenAI({ apiKey })

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1500,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(article) },
      ],
    })

    const raw = response.choices[0]?.message?.content
    if (!raw) return null

    const parsed = JSON.parse(raw)

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
    console.error('OpenAI 요약 실패:', article.title, err)
    return null
  }
}
