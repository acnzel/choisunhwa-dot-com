/**
 * 최선화닷컴 — 공통 타입 유효성 검증 테스트
 * QA: 한큐
 */

import { describe, it, expect } from 'vitest'
import type {
  User,
  Speaker,
  Lecture,
  Inquiry,
  Faq,
  Notice,
} from '@/types'

describe('User 타입', () => {
  it('유효한 이메일 회원 객체를 생성할 수 있어야 한다', () => {
    const user: User = {
      id: 'user-uuid-1',
      email: 'test@example.com',
      name: '홍길동',
      provider: 'email',
      status: 'active',
      email_verified_at: '2025-01-01T00:00:00Z',
      marketing_agreed: false,
      created_at: '2025-01-01T00:00:00Z',
      last_login_at: null,
    }
    expect(user.provider).toBe('email')
    expect(user.status).toBe('active')
    expect(user.email_verified_at).not.toBeNull()
  })

  it('구글 소셜 로그인 회원은 provider가 google이어야 한다', () => {
    const user: User = {
      id: 'user-uuid-2',
      email: 'google@example.com',
      name: '구글유저',
      provider: 'google',
      status: 'active',
      email_verified_at: '2025-01-01T00:00:00Z',
      marketing_agreed: false,
      created_at: '2025-01-01T00:00:00Z',
      last_login_at: null,
    }
    expect(user.provider).toBe('google')
  })

  it('미인증 회원의 status는 unverified이어야 한다', () => {
    const user: User = {
      id: 'user-uuid-3',
      email: 'unverified@example.com',
      name: '미인증',
      provider: 'email',
      status: 'unverified',
      email_verified_at: null,
      marketing_agreed: false,
      created_at: '2025-01-01T00:00:00Z',
      last_login_at: null,
    }
    expect(user.status).toBe('unverified')
    expect(user.email_verified_at).toBeNull()
  })
})

describe('Speaker 타입', () => {
  it('유효한 강사 객체를 생성할 수 있어야 한다', () => {
    const speaker: Speaker = {
      id: 'speaker-uuid-1',
      name: '최선화',
      title: '강연 전문가',
      company: '최선화닷컴',
      photo_url: null,
      bio_short: '짧은 소개',
      bio_full: '긴 소개',
      fields: ['리더십', '동기부여'],
      fee_range: '100_300',
      is_visible: true,
      sort_order: 1,
      careers: [{ year: '2020', content: '강연 활동 시작' }],
      lecture_histories: [{ org_name: '삼성전자', logo_url: undefined }],
      media_links: [],
      news_links: [],
      created_at: '2025-01-01T00:00:00Z',
    }
    expect(speaker.fields).toContain('리더십')
    expect(speaker.is_visible).toBe(true)
  })
})

describe('Inquiry 타입', () => {
  it('강연기획 문의 객체가 올바른 타입을 가져야 한다', () => {
    const inquiry: Inquiry = {
      id: 'inquiry-uuid-1',
      type: 'lecture_plan',
      name: '김담당',
      email: 'manager@company.com',
      phone: '010-1234-5678',
      company: '테스트컴퍼니',
      content: '강연 기획 문의드립니다.',
      status: 'new',
    }
    expect(inquiry.type).toBe('lecture_plan')
    expect(inquiry.status).toBe('new')
  })

  it('강사등록 문의는 type이 speaker_register이어야 한다', () => {
    const inquiry: Inquiry = {
      id: 'inquiry-uuid-2',
      type: 'speaker_register',
      name: '강사지원자',
      email: 'speaker@example.com',
      phone: '010-9999-8888',
      company: '개인',
      content: '강사 등록 원합니다.',
      status: 'new',
    }
    expect(inquiry.type).toBe('speaker_register')
  })
})
