/**
 * 유효성 검증 스키마 테스트
 * QA: 한큐
 *
 * Given-When-Then 구조 준수
 * 각 스키마의 happy path + edge case + error case
 */

import { describe, it, expect } from 'vitest'
import {
  SignupSchema,
  InquiryFormSchema,
  SpeakerSchema,
  LectureSchema,
} from '@/lib/validations'

// ─── 회원가입 스키마 ─────────────────────────────────────

describe('SignupSchema', () => {
  describe('이메일 검증', () => {
    it('올바른 이메일 형식이면 통과한다', () => {
      const result = SignupSchema.safeParse({
        email: 'valid@example.com',
        password: 'ValidPass1!',
        name: '홍길동',
      })
      expect(result.success).toBe(true)
    })

    it('이메일 형식이 아니면 실패한다', () => {
      const result = SignupSchema.safeParse({
        email: 'not-an-email',
        password: 'ValidPass1!',
        name: '홍길동',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors
        expect(errors.email).toBeDefined()
      }
    })
  })

  describe('비밀번호 검증', () => {
    it('8자 이상 + 영문+숫자+특수문자 조합이면 통과한다', () => {
      const result = SignupSchema.safeParse({
        email: 'test@example.com',
        password: 'Valid123!',
        name: '홍길동',
      })
      expect(result.success).toBe(true)
    })

    it('7자 비밀번호는 실패한다', () => {
      const result = SignupSchema.safeParse({
        email: 'test@example.com',
        password: 'Ab1!xyz',
        name: '홍길동',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors
        expect(errors.password).toBeDefined()
      }
    })

    it('특수문자 없는 비밀번호는 실패한다', () => {
      const result = SignupSchema.safeParse({
        email: 'test@example.com',
        password: 'ValidPass1',
        name: '홍길동',
      })
      expect(result.success).toBe(false)
    })

    it('숫자 없는 비밀번호는 실패한다', () => {
      const result = SignupSchema.safeParse({
        email: 'test@example.com',
        password: 'ValidPass!',
        name: '홍길동',
      })
      expect(result.success).toBe(false)
    })

    it('영문 없는 비밀번호는 실패한다', () => {
      const result = SignupSchema.safeParse({
        email: 'test@example.com',
        password: '12345678!',
        name: '홍길동',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('이름 검증', () => {
    it('빈 이름은 실패한다', () => {
      const result = SignupSchema.safeParse({
        email: 'test@example.com',
        password: 'ValidPass1!',
        name: '',
      })
      expect(result.success).toBe(false)
    })

    it('20자 초과 이름은 실패한다', () => {
      const result = SignupSchema.safeParse({
        email: 'test@example.com',
        password: 'ValidPass1!',
        name: '가'.repeat(21),
      })
      expect(result.success).toBe(false)
    })
  })
})

// ─── 문의 폼 스키마 ──────────────────────────────────────

describe('InquiryFormSchema', () => {
  const validBase = {
    type: 'lecture_plan' as const,
    name: '김담당자',
    email: 'manager@company.com',
    phone: '010-1234-5678',
    content: '강연 문의드립니다. 상세 내용은 추후 협의 부탁드립니다.',
  }

  it('유효한 문의 데이터면 통과한다', () => {
    const result = InquiryFormSchema.safeParse(validBase)
    expect(result.success).toBe(true)
  })

  it('type이 올바른 enum 값이어야 한다', () => {
    const result = InquiryFormSchema.safeParse({ ...validBase, type: 'invalid_type' })
    expect(result.success).toBe(false)
  })

  it('content가 10자 미만이면 실패한다', () => {
    const result = InquiryFormSchema.safeParse({ ...validBase, content: '짧아요.' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors
      expect(errors.content).toBeDefined()
    }
  })

  it('content가 1000자 초과이면 실패한다', () => {
    const result = InquiryFormSchema.safeParse({ ...validBase, content: 'a'.repeat(1001) })
    expect(result.success).toBe(false)
  })

  it('잘못된 전화번호 형식은 실패한다', () => {
    const result = InquiryFormSchema.safeParse({ ...validBase, phone: '전화번호아님' })
    expect(result.success).toBe(false)
  })

  it('이메일 형식이 잘못되면 실패한다', () => {
    const result = InquiryFormSchema.safeParse({ ...validBase, email: 'bad-email' })
    expect(result.success).toBe(false)
  })

  it('강사섭외(recruitment) 타입도 허용된다', () => {
    const result = InquiryFormSchema.safeParse({ ...validBase, type: 'recruitment' })
    expect(result.success).toBe(true)
  })

  it('강사등록(speaker_register) 타입도 허용된다', () => {
    const result = InquiryFormSchema.safeParse({ ...validBase, type: 'speaker_register' })
    expect(result.success).toBe(true)
  })
})

// ─── 강사 스키마 ─────────────────────────────────────────

describe('SpeakerSchema', () => {
  const validSpeaker = {
    name: '최선화',
    title: '강연 전문가',
    company: '최선화닷컴',
    bio_short: '짧은 소개',
    bio_full: '긴 소개',
    fields: ['리더십', '동기부여'],
  }

  it('유효한 강사 데이터면 통과한다', () => {
    const result = SpeakerSchema.safeParse(validSpeaker)
    expect(result.success).toBe(true)
  })

  it('강사 이름이 없으면 실패한다', () => {
    const result = SpeakerSchema.safeParse({ ...validSpeaker, name: '' })
    expect(result.success).toBe(false)
  })

  it('fee_range가 유효한 enum 값이어야 한다', () => {
    const result = SpeakerSchema.safeParse({ ...validSpeaker, fee_range: 'invalid' })
    expect(result.success).toBe(false)
  })

  it('fee_range는 null이 허용된다', () => {
    const result = SpeakerSchema.safeParse({ ...validSpeaker, fee_range: null })
    expect(result.success).toBe(true)
  })
})

// ─── 강연 스키마 ─────────────────────────────────────────

describe('LectureSchema', () => {
  it('speaker_id는 UUID 형식이어야 한다', () => {
    const result = LectureSchema.safeParse({
      speaker_id: 'not-a-uuid',
      title: '리더십 강연',
    })
    expect(result.success).toBe(false)
  })

  it('유효한 UUID와 제목이면 통과한다', () => {
    const result = LectureSchema.safeParse({
      speaker_id: '550e8400-e29b-41d4-a716-446655440000',
      title: '리더십 강연',
    })
    expect(result.success).toBe(true)
  })

  it('duration은 허용된 값만 사용 가능하다', () => {
    const invalid = LectureSchema.safeParse({
      speaker_id: '550e8400-e29b-41d4-a716-446655440000',
      title: '테스트',
      duration: '3h',
    })
    expect(invalid.success).toBe(false)

    const valid = LectureSchema.safeParse({
      speaker_id: '550e8400-e29b-41d4-a716-446655440000',
      title: '테스트',
      duration: 'half_day',
    })
    expect(valid.success).toBe(true)
  })
})
