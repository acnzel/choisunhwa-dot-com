import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { SPEAKER_FIELDS } from '@/constants'
import { SITE_NAME, SITE_DESCRIPTION, CONTACT_EMAIL, absoluteUrl } from '@/lib/seo'

// llms.txt (https://llmstxt.org) — 생성형 AI 가 사이트 구조와 핵심 페이지를 빠르게 파악하도록 돕는 요약
export const revalidate = 3600

export async function GET() {
  const supabase = await createClient()
  const admin = createAdminClient()
  const [{ count: speakerCount }, { data: insights }] = await Promise.all([
    supabase.from('speakers').select('id', { count: 'exact', head: true }).eq('is_visible', true),
    admin
      .from('insights')
      .select('id, type, title, summary')
      .eq('status', 'published')
      .in('type', ['issue', 'report'])
      .order('published_at', { ascending: false })
      .limit(20),
  ])

  const fieldLinks = SPEAKER_FIELDS
    .map((f) => `- [${f.label} 분야 강사](${absoluteUrl(`/speakers?field=${encodeURIComponent(f.value)}`)})`)
    .join('\n')

  const insightLinks = (insights ?? [])
    .map((i) => `- [${i.title}](${absoluteUrl(`/insights/${i.type}/${i.id}`)})${i.summary ? `: ${i.summary.replace(/\s+/g, ' ')}` : ''}`)
    .join('\n')

  const body = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

${SITE_NAME}은 기업·기관의 교육 담당자를 위한 강연 기획 및 강사 섭외 서비스입니다. 강연 목적과 대상을 분석해 강사를 제안하고, 섭외 협의·계약, 현장 운영 지원, 사후 피드백까지 진행합니다. 현재 공개 등록 강사는 ${speakerCount ?? 0}명입니다.

- 진행 절차: 의뢰 접수 → 1~2 영업일 내 담당자 연락 → 맞춤 강사 2~3명 제안 → 일정·장소·내용 조율 후 계약 및 진행
- 문의: ${CONTACT_EMAIL} 또는 [강연 문의 폼](${absoluteUrl('/inquiry/lecture')})

## 주요 페이지

- [강사 라인업](${absoluteUrl('/speakers')}): 공개된 전체 강사 목록과 분야별 필터
- [강사 매칭 신청](${absoluteUrl('/matching')}): 조건을 입력하면 추천 강사를 보여주는 매칭
- [강연 문의](${absoluteUrl('/inquiry/lecture')}): 강연 기획·강사 섭외 의뢰 폼
- [최선화닷컴 이야기](${absoluteUrl('/support/about')}): 서비스 소개와 진행 방식
- [자주 묻는 질문](${absoluteUrl('/support/faq')})
- [에디터 픽](${absoluteUrl('/insights/featured')}): 에디터가 추천하는 강사

## 분야별 강사

${fieldLinks}

## 최신 인사이트

${insightLinks}

## Optional

- [사이트맵](${absoluteUrl('/sitemap.xml')})
- [인사이트 RSS](${absoluteUrl('/feed.xml')})
`

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
