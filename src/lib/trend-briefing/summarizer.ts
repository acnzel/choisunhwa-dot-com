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

const SYSTEM_PROMPT = `당신은 강연 기획사 최선화닷컴의 수석 인사이트 에디터입니다.

독자: 기업 HR 담당자, 경영진, 강연 기획자
목적: 뉴스 기사를 바탕으로 조직과 사람에 관한 깊이 있는 인사이트 아티클 작성
참고 스타일: 제일 매거진 Insight, HBR 한국어판

아티클 구조 (반드시 준수):
1. 도입부: 데이터나 사례로 시작 (독자를 끌어당기는 훅)
2. H2 소제목 2개 이상: 각 섹션에서 핵심 인사이트 전달
3. 구체적 수치 또는 연구 인용 (갤럽, 구글, HBR 등 실제 연구 활용 가능)
4. 실무적 시사점: HR 담당자에게 필요한 액션 포인트
5. 마지막 문단 (필수): "<strong>이런 강연이 필요하다면: [카테고리명]</strong>"
6. 출처 표기 (필수): <p style="font-size:13px;color:#888;">출처: [매체명], 원문 참고</p>

절대 금지: 과장, 광고성 표현, 확인되지 않은 수치`

function buildUserPrompt(article: RawArticle): string {
  return `다음 뉴스 기사를 바탕으로 최선화닷컴 인사이트 아티클을 작성하세요.

원문 제목: ${article.title}
원문 출처: ${article.source}
원문 링크: ${article.link}
원문 내용: ${article.content.slice(0, 800)}

---
content_html 작성 요건:
- 전체 분량: 600자 이상 (한글 기준)
- H2 소제목 <h2> 2개 이상
- 구체적 수치 또는 연구 1개 이상 인용
- 각 섹션당 2~3개 단락 <p>
- 마지막 전 섹션: HR 담당자 실무 적용 팁
- 마지막 단락(필수): <p><strong>이런 강연이 필요하다면: [카테고리]</strong></p>
- 마지막줄(필수): <p style="font-size:13px;color:#888;">출처: ${article.source}, 원문 참고</p>

content_html은 실제 HR 전문가가 읽을 수준의 깊이 있는 분석이어야 합니다.
기사 내용이 짧더라도 주제와 관련된 배경 지식, 연구, 트렌드를 적극 활용해 풍성하게 작성하세요.`
}

export async function summarizeArticle(article: RawArticle): Promise<ProcessedArticle | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY 미설정')
    return null
  }

  const client = new Anthropic({ apiKey })

  try {
    // tool_use 사용 → Anthropic이 JSON 유효성 보장 (파싱 오류 원천 차단)
    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2500,
      system: SYSTEM_PROMPT,
      tools: [
        {
          name: 'create_insight',
          description: '최선화닷컴 인사이트 아티클을 구조화된 형태로 생성합니다.',
          input_schema: {
            type: 'object' as const,
            properties: {
              title: {
                type: 'string',
                description: '35자 이내 리라이팅 제목 (원문 그대로 금지, 인사이트형 또는 호기심 유발형)',
              },
              summary: {
                type: 'string',
                description: '이 아티클의 핵심 인사이트 2~3문장 (독자가 얻는 것 중심)',
              },
              content_html: {
                type: 'string',
                description: 'HTML 본문. H2 소제목 2개 이상, 600자 이상, 수치/연구 인용, 마지막 문단에 "이런 강연이 필요하다면:" 포함',
              },
              tags: {
                type: 'array',
                items: { type: 'string' },
                description: `다음 중 관련도 높은 1~3개: ${VALID_TAGS.join(', ')}`,
              },
            },
            required: ['title', 'summary', 'content_html', 'tags'],
          },
        },
      ],
      tool_choice: { type: 'tool', name: 'create_insight' },
      messages: [{ role: 'user', content: buildUserPrompt(article) }],
    })

    // tool_use 결과 추출
    const toolUse = message.content.find(c => c.type === 'tool_use')
    if (!toolUse || toolUse.type !== 'tool_use') {
      console.error('tool_use 응답 없음:', article.title)
      return null
    }

    const parsed = toolUse.input as {
      title: string
      summary: string
      content_html: string
      tags: string[]
    }

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
    console.error('요약 실패:', article.title, err)
    return null
  }
}
