/**
 * 어드민 목록 공통 헬퍼 — URL 생성, 검색어 정리, 경과일 계산
 */

import { describe, it, expect } from 'vitest'
import { buildListHref, daysSince, parsePage, sanitizeSearch } from '@/lib/admin-list'

describe('buildListHref', () => {
  it('기본값은 URL 에서 뺀다', () => {
    expect(buildListHref('/mong-bab/inquiries', { status: 'all', q: '', page: 1 })).toBe('/mong-bab/inquiries')
  })

  it('상태·검색어·페이지를 쿼리로 붙인다', () => {
    expect(buildListHref('/mong-bab/inquiries', { status: 'new', q: '삼성', page: 2 })).toBe(
      '/mong-bab/inquiries?status=new&q=%EC%82%BC%EC%84%B1&page=2',
    )
  })
})

describe('sanitizeSearch', () => {
  it('PostgREST or 필터를 깨는 문자를 지운다', () => {
    expect(sanitizeSearch('a,b(c)*d%e\\f')).toBe('a b c d e f')
  })

  it('비어 있으면 빈 문자열', () => {
    expect(sanitizeSearch(undefined)).toBe('')
    expect(sanitizeSearch('  ')).toBe('')
  })
})

describe('parsePage', () => {
  it('2 이상의 정수만 받고 나머지는 1', () => {
    expect(parsePage('3')).toBe(3)
    expect(parsePage('0')).toBe(1)
    expect(parsePage('abc')).toBe(1)
    expect(parsePage(undefined)).toBe(1)
  })
})

describe('daysSince', () => {
  it('지난 날짜 수를 내림으로 센다', () => {
    const now = new Date('2026-10-14T12:00:00Z')
    expect(daysSince('2026-10-12T13:00:00Z', now)).toBe(1)
    expect(daysSince('2026-10-12T11:00:00Z', now)).toBe(2)
    expect(daysSince(undefined, now)).toBe(0)
  })
})
