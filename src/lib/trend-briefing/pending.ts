// 자동 수집 후 어드민 검수를 기다리는 인사이트의 정의. 파이프라인(pipeline.ts)이 이 상태로 저장한다.
// 트렌드 브리핑 검수 목록·사이드바 건수는 이 조건으로 고르고, 인사이트 관리는 이 조건을 뺀다.
export const PENDING_BRIEFING = { auto_generated: true, status: 'draft' } as const

// PostgREST or() 문법으로 쓴 "검수 대기가 아닌 것" (위 조건의 부정)
export const NOT_PENDING_BRIEFING = 'auto_generated.eq.false,status.neq.draft'
