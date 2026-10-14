/**
 * 강사 신청 검토 — 요청 검증과 신청서 → 강사 변환
 */

import { describe, it, expect } from 'vitest'
import { SpeakerApplicationReviewSchema } from '@/lib/validations'
import { applicationToSpeaker } from '@/lib/speaker-application'

describe('SpeakerApplicationReviewSchema', () => {
  it('승인은 메모 없이 통과한다', () => {
    expect(SpeakerApplicationReviewSchema.safeParse({ action: 'approve' }).success).toBe(true)
  })

  it('거절은 사유가 없거나 공백뿐이면 실패한다', () => {
    expect(SpeakerApplicationReviewSchema.safeParse({ action: 'reject' }).success).toBe(false)
    expect(SpeakerApplicationReviewSchema.safeParse({ action: 'reject', admin_note: '   ' }).success).toBe(false)
    expect(SpeakerApplicationReviewSchema.safeParse({ action: 'reject', admin_note: '분야 불일치' }).success).toBe(true)
  })

  it('예전 형식({ status })이나 알 수 없는 action 은 실패한다', () => {
    expect(SpeakerApplicationReviewSchema.safeParse({ status: 'approved' }).success).toBe(false)
    expect(SpeakerApplicationReviewSchema.safeParse({ action: 'delete' }).success).toBe(false)
  })
})

describe('applicationToSpeaker', () => {
  it('비공개로 만들고 빈 텍스트는 빈 문자열로 채운다', () => {
    const row = applicationToSpeaker({ name: '홍길동', bio_short: '소개' })
    expect(row.is_visible).toBe(false)
    expect(row.is_best).toBe(false)
    expect(row.title).toBe('')
    expect(row.bio_full).toBe('')
    expect(row.media_links).toEqual([])
  })

  it('경력은 줄 단위로, 영상 링크는 미디어 링크로 옮긴다', () => {
    const row = applicationToSpeaker({
      name: '홍길동',
      career: '현 A사 대표\n\n전 B사 팀장 ',
      youtube_url: 'https://youtu.be/x',
    })
    expect(row.careers).toEqual([
      { year: '', content: '현 A사 대표' },
      { year: '', content: '전 B사 팀장' },
    ])
    expect(row.media_links).toEqual([{ title: '영상', url: 'https://youtu.be/x' }])
  })
})
