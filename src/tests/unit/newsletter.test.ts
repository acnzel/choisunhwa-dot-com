/**
 * 이슈 뉴스레터 — 강의 인용 검증
 * 생성 결과의 각 부 강의 제목이 그 강사의 실제 강의 목록에 있어야 통과한다.
 */

import { describe, it, expect } from 'vitest'
import { validateContent } from '@/lib/newsletter/generate'

const candidates = [
  { key: 'S1', id: 'a', name: '가', title: '', company: '', fields: [], lectures: ['다양성 활용전략'] },
  { key: 'S2', id: 'b', name: '나', title: '', company: '', fields: [], lectures: ['DEI 실행 리더의 역할'] },
  { key: 'S3', id: 'c', name: '다', title: '', company: '', fields: [], lectures: ['존중과 포용리더십'] },
]

const base = {
  subject: '', issue_summary: [], why_now: '', program_title: '', target: '', format: '',
}

const mod = (part: number, speaker_key: string, lecture_title: string) =>
  ({ part, theme: '', speaker_key, lecture_title, connection: '' })

describe('validateContent', () => {
  it('세 강사가 각자 목록에 있는 강의를 그대로 인용하면 통과한다', () => {
    const problems = validateContent(
      { ...base, modules: [mod(1, 'S1', '다양성 활용전략'), mod(2, 'S2', 'DEI 실행 리더의 역할'), mod(3, 'S3', '존중과 포용리더십')] },
      candidates,
    )
    expect(problems).toEqual([])
  })

  it('목록에 없는 강의 제목을 쓰면 실패한다', () => {
    const problems = validateContent(
      { ...base, modules: [mod(1, 'S1', '다양성 활용 전략 심화'), mod(2, 'S2', 'DEI 실행 리더의 역할'), mod(3, 'S3', '존중과 포용리더십')] },
      candidates,
    )
    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('1부')
  })

  it('같은 강사를 두 번 쓰거나 후보에 없는 키를 쓰면 실패한다', () => {
    const problems = validateContent(
      { ...base, modules: [mod(1, 'S1', '다양성 활용전략'), mod(2, 'S1', '다양성 활용전략'), mod(3, 'S9', '존중과 포용리더십')] },
      candidates,
    )
    expect(problems.some(p => p.includes('서로 달라야'))).toBe(true)
    expect(problems.some(p => p.includes('S9'))).toBe(true)
  })
})
