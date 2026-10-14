// 어드민 목록 화면 공통 헬퍼. URL 파라미터(status, q, page)로 필터 상태를 표현한다.

export const ADMIN_PAGE_SIZE = 20

export interface ListParams {
  status?: string
  q?: string
  page?: number
}

/** 기본값(전체, 빈 검색, 1페이지)은 URL 에서 뺀다. */
export function buildListHref(basePath: string, params: ListParams): string {
  const sp = new URLSearchParams()
  if (params.status && params.status !== 'all') sp.set('status', params.status)
  if (params.q) sp.set('q', params.q)
  if (params.page && params.page > 1) sp.set('page', String(params.page))
  const qs = sp.toString()
  return qs ? `${basePath}?${qs}` : basePath
}

/**
 * PostgREST `.or()` 필터 문법을 깨는 문자(쉼표, 괄호, 와일드카드, 역슬래시)를 지운다.
 * 사용자가 입력한 검색어를 필터 문자열에 그대로 넣지 않기 위함.
 */
export function sanitizeSearch(raw: string | undefined): string {
  if (!raw) return ''
  return raw.replace(/[,()*%\\]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 50)
}

export function parsePage(raw: string | undefined): number {
  const n = Number(raw)
  return Number.isInteger(n) && n > 1 ? n : 1
}

/** 접수 후 지난 날짜 수(내림). created_at 이 없으면 0. */
export function daysSince(createdAt: string | undefined, now: Date = new Date()): number {
  if (!createdAt) return 0
  const diff = now.getTime() - new Date(createdAt).getTime()
  return Math.max(0, Math.floor(diff / 86_400_000))
}
