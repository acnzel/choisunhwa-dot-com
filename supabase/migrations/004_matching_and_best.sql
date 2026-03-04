-- ============================================================
-- 강사 매칭 기능 + is_best 컬럼
-- ============================================================

-- 1. speakers 테이블에 is_best 컬럼 추가
ALTER TABLE public.speakers
  ADD COLUMN IF NOT EXISTS is_best BOOLEAN NOT NULL DEFAULT false;

-- 2. 매칭 세션 로그 테이블
CREATE TABLE IF NOT EXISTS public.matching_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step1_fields  TEXT[] NOT NULL DEFAULT '{}',
  step2_topics  TEXT[] NOT NULL DEFAULT '{}',
  step3_targets TEXT[] NOT NULL DEFAULT '{}',
  result_count  INTEGER,
  clicked_speaker UUID REFERENCES public.speakers(id) ON DELETE SET NULL,
  converted     BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS 없음 (서버사이드 service role로만 접근)

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_matching_sessions_created_at
  ON public.matching_sessions (created_at DESC);
