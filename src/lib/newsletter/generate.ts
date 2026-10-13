import { GoogleGenAI, Type } from '@google/genai'
import type { SupabaseClient } from '@supabase/supabase-js'

// 이슈 1건 → 강사 3명의 실제 강의를 이어 붙인 3부 프로그램 + 뉴스레터 초안.
// 핵심 불변식: 각 부의 lecture_title 은 그 강사의 lecture_histories 에 그대로 있어야 한다.
// 검증에 실패하면 이유를 붙여 다시 생성하고, 3회 실패하면 오류를 던진다.

export interface NewsletterTrigger {
  title: string
  body: string // 기사 요약이나 계절 이슈 설명
  tags: string[] // insights 태그 또는 speakers.fields 어휘
}

export interface ProgramModule {
  part: number
  theme: string
  speaker_id: string
  speaker_name: string
  speaker_title: string
  lecture_title: string
  connection: string
}

export interface NewsletterContent {
  subject: string
  issue_summary: string[]
  why_now: string
  program_title: string
  target: string
  format: string
  modules: ProgramModule[]
}

interface Candidate {
  key: string // 프롬프트용 짧은 키 (S1, S2 ...). UUID 를 모델이 베껴 쓰다 틀리는 것을 막는다
  id: string
  name: string
  title: string
  company: string
  fields: string[]
  lectures: string[]
}

// 무료 티어는 수요가 몰리면 503 을 낸다. 2026-10-13 실측에서 flash 계열이 전부 503 이거나
// 1분 넘게 걸릴 때 lite 계열은 4~6초에 응답했다. 출력이 틀리면 강의 인용 검증이 걸러낸다.
const MODELS = ['gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite']
const MAX_ATTEMPTS = 3
const CANDIDATE_LIMIT = 40

// insights 태그 중 speakers.fields 에 없는 값을 가까운 분야로 옮긴다.
// 나머지 태그(리더십, HR, 소통 등)는 이름이 같아 그대로 쓴다.
const TAG_TO_FIELDS: Record<string, string[]> = {
  조직문화: ['리더십', 'HR', '소통'],
  팀워크: ['소통', '리더십'],
  비즈니스매너: ['업무스킬', '소통'],
}

const normalize = (s: string) => s.replace(/\s+/g, ' ').trim()

// lecture_histories 에는 강의 제목 말고 "변호사, 법률, 인사, 노무, ..." 같은 키워드 나열도 섞여 있다
// (2026-10-13 운영 실측). 쉼표로 6개 이상 이어진 항목은 강의 제목으로 내보내지 않는다.
const isKeywordList = (s: string) => s.split(',').filter(p => p.trim()).length >= 6

export async function loadCandidates(
  supabase: SupabaseClient,
  trigger: NewsletterTrigger,
): Promise<Candidate[]> {
  const { data, error } = await supabase
    .from('speakers')
    .select('id, name, title, company, fields, lecture_histories, is_best')
    .eq('is_visible', true)
  if (error) throw new Error(`강사 조회 실패: ${error.message}`)

  const wantFields = new Set(trigger.tags.flatMap(t => TAG_TO_FIELDS[t] ?? [t]))
  const words = trigger.title.split(/[\s,.'"‘’“”:·…?!()]+/).filter(w => w.length >= 2)

  const scored = (data ?? [])
    .map(s => {
      const lectures = (Array.isArray(s.lecture_histories) ? s.lecture_histories : [])
        .filter((l: unknown): l is string => typeof l === 'string' && l.trim() !== '')
        .map(normalize)
        .filter((l: string) => !isKeywordList(l))
      const fields: string[] = s.fields ?? []
      const overlap = fields.filter(f => wantFields.has(f)).length
      const joined = lectures.join(' ')
      const hits = Math.min(3, words.filter(w => joined.includes(w)).length)
      return { s, lectures, fields, score: overlap * 3 + hits + (s.is_best ? 1 : 0) }
    })
    .filter(x => x.lectures.length > 0 && x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, CANDIDATE_LIMIT)

  return scored.map((x, i) => ({
    key: `S${i + 1}`,
    id: x.s.id,
    name: x.s.name,
    title: x.s.title ?? '',
    company: x.s.company ?? '',
    fields: x.fields,
    lectures: x.lectures,
  }))
}

const SYSTEM_PROMPT = `당신은 강연 기획사 최선화닷컴의 교육 프로그램 기획자입니다.
독자는 회사의 인사·교육 담당자입니다.
이슈 하나를 받아, 후보 강사들의 실제 강의를 이어 붙여 3부로 된 교육 프로그램을 만들고, 그 프로그램을 소개하는 뉴스레터 초안을 씁니다.

3부 흐름:
- 1부: 이슈 이해 (왜 지금 이 주제인가)
- 2부: 조직 적용 (우리 회사와 팀에 무슨 의미인가)
- 3부: 실행 (팀장과 구성원이 내일부터 할 일)

규칙:
- 서로 다른 강사 3명을 고릅니다. 각 부에 한 명씩입니다.
- lecture_title 은 그 강사의 강의 목록에 있는 문자열을 한 글자도 바꾸지 말고 그대로 복사합니다. 목록에 없는 강의를 만들거나 제목을 다듬으면 안 됩니다.
- 강의 목록에는 강의 제목 대신 분야 키워드만 나열한 항목도 섞여 있습니다. 강의 제목처럼 읽히는 항목을 고릅니다.
- "완벽", "완전 정복", "필수" 같은 과장 표현을 쓰지 않습니다.
- speaker_key 는 후보 목록의 키(S1, S2 ...)를 씁니다.
- 이슈 내용에 없는 사실이나 수치를 더하지 않습니다. 문장은 짧게 씁니다.`

function buildPrompt(trigger: NewsletterTrigger, candidates: Candidate[], feedback: string | null) {
  const list = candidates
    .map(c => `${c.key} | ${c.name} (${[c.title, c.company].filter(Boolean).join(', ')}) | 분야: ${c.fields.join(', ')}\n  강의: ${c.lectures.map(l => `"${l}"`).join(' / ')}`)
    .join('\n')
  return `이슈 제목: ${trigger.title}
이슈 내용: ${trigger.body.slice(0, 1200)}

후보 강사:
${list}
${feedback ? `\n직전 결과가 검증에 실패했습니다. 아래 문제를 고쳐서 다시 작성하세요.\n${feedback}\n` : ''}`
}

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    subject: { type: Type.STRING, description: '뉴스레터 메일 제목. 40자 이내' },
    issue_summary: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '이슈 요약 3줄. 한 줄에 한 문장',
    },
    why_now: { type: Type.STRING, description: '왜 지금 이 교육이 필요한가. 2~3문장' },
    program_title: { type: Type.STRING, description: '3부 프로그램 이름. 25자 이내' },
    target: { type: Type.STRING, description: '추천 대상 (예: 팀장급 30~50명)' },
    format: { type: Type.STRING, description: '형식과 시간 (예: 3부 구성, 총 3시간 오프라인)' },
    modules: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          part: { type: Type.INTEGER },
          theme: { type: Type.STRING, description: '이 부의 주제 한 줄' },
          speaker_key: { type: Type.STRING },
          lecture_title: { type: Type.STRING, description: '강의 목록의 문자열 그대로' },
          connection: { type: Type.STRING, description: '이 강의가 이 이슈에 맞는 이유 한 문장' },
        },
        required: ['part', 'theme', 'speaker_key', 'lecture_title', 'connection'],
      },
    },
  },
  required: ['subject', 'issue_summary', 'why_now', 'program_title', 'target', 'format', 'modules'],
  propertyOrdering: ['subject', 'issue_summary', 'why_now', 'program_title', 'target', 'format', 'modules'],
}

interface RawModule { part: number; theme: string; speaker_key: string; lecture_title: string; connection: string }
interface RawContent extends Omit<NewsletterContent, 'modules'> { modules: RawModule[] }

// 문제 목록을 돌려준다. 빈 배열이면 통과.
export function validateContent(raw: RawContent, candidates: Candidate[]): string[] {
  const byKey = new Map(candidates.map(c => [c.key, c]))
  const problems: string[] = []
  if (!Array.isArray(raw.modules) || raw.modules.length !== 3) {
    problems.push(`modules 는 정확히 3개여야 합니다 (현재 ${raw.modules?.length ?? 0}개).`)
    return problems
  }
  const keys = raw.modules.map(m => m.speaker_key)
  if (new Set(keys).size !== keys.length) problems.push('세 부의 강사가 서로 달라야 합니다.')
  for (const m of raw.modules) {
    const c = byKey.get(m.speaker_key)
    if (!c) {
      problems.push(`${m.part}부: speaker_key "${m.speaker_key}" 는 후보 목록에 없습니다.`)
      continue
    }
    if (!c.lectures.includes(normalize(m.lecture_title ?? ''))) {
      problems.push(`${m.part}부: "${m.lecture_title}" 는 ${c.key}(${c.name})의 강의 목록에 없습니다. 목록: ${c.lectures.map(l => `"${l}"`).join(' / ')}`)
    }
  }
  return problems
}

async function callModel(client: GoogleGenAI, contents: string) {
  let lastError: unknown
  for (const model of MODELS) {
    try {
      return await client.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          responseJsonSchema: RESPONSE_SCHEMA,
        },
      })
    } catch (err) {
      const status = (err as { status?: number }).status
      if (status !== 503 && status !== 429) throw err
      console.warn(`[newsletter] ${model} ${status}, 다음 모델로 넘깁니다`)
      lastError = err
    }
  }
  throw new Error(`Gemini 가 지금 혼잡합니다. 잠시 후 다시 시도하세요. (${String(lastError)})`)
}

export async function generateNewsletter(
  supabase: SupabaseClient,
  trigger: NewsletterTrigger,
): Promise<NewsletterContent> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY 미설정')

  const candidates = await loadCandidates(supabase, trigger)
  if (candidates.length < 3) throw new Error(`이 이슈에 맞는 후보 강사가 ${candidates.length}명뿐입니다 (3명 필요).`)

  const client = new GoogleGenAI({ apiKey })
  let feedback: string | null = null

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const response = await callModel(client, buildPrompt(trigger, candidates, feedback))
    if (!response.text) { feedback = '응답이 비어 있었습니다.'; continue }

    const raw = JSON.parse(response.text) as RawContent
    const problems = validateContent(raw, candidates)
    if (problems.length > 0) {
      console.warn(`[newsletter] 검증 실패 (${attempt}/${MAX_ATTEMPTS})`, problems)
      feedback = problems.join('\n')
      continue
    }

    const byKey = new Map(candidates.map(c => [c.key, c]))
    return {
      subject: raw.subject,
      issue_summary: (raw.issue_summary ?? []).slice(0, 3),
      why_now: raw.why_now,
      program_title: raw.program_title,
      target: raw.target,
      format: raw.format,
      modules: [...raw.modules]
        .sort((a, b) => a.part - b.part)
        .map(m => {
          const c = byKey.get(m.speaker_key)!
          return {
            part: m.part,
            theme: m.theme,
            speaker_id: c.id,
            speaker_name: c.name,
            speaker_title: [c.title, c.company].filter(Boolean).join(', '),
            lecture_title: normalize(m.lecture_title),
            connection: m.connection,
          }
        }),
    }
  }

  throw new Error(`강의 인용 검증을 ${MAX_ATTEMPTS}번 통과하지 못했습니다. 다시 시도하거나 다른 이슈를 고르세요.\n${feedback ?? ''}`)
}
