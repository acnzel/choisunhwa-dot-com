-- Migration 018: 이슈 뉴스레터 초안 + 문의 유입 출처
-- newsletter_drafts: 어드민이 이슈(자동 수집 기사 또는 계절 이슈)를 골라 만든 3부 프로그램 뉴스레터 초안.
--   어드민 API 가 service role 로만 읽고 쓴다. RLS 를 켜고 정책을 두지 않아 anon 접근을 막는다.
-- inquiries.ref: 뉴스레터 CTA(/inquiry/plan?ref=briefing-<id>)로 들어온 기획안 요청을 구분한다.
--   일반 문의는 NULL 이다. plan_request 실험 집계에서 뉴스레터 유입을 따로 셀 때 쓴다.
-- 컬럼·테이블 추가만 하므로 코드 배포 전에 먼저 적용해도 기존 동작에 영향이 없다. 다시 실행해도 안전하다.

CREATE TABLE IF NOT EXISTS public.newsletter_drafts (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_type   text        NOT NULL CHECK (trigger_type IN ('article', 'season')),
  insight_id     uuid        REFERENCES public.insights(id) ON DELETE SET NULL,
  season_key     text,
  trigger_title  text        NOT NULL,
  content        jsonb       NOT NULL,           -- generate.ts 의 NewsletterContent
  comment        text        NOT NULL DEFAULT '', -- 최선화의 한 마디. 비어 있으면 내보내기 불가
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS newsletter_drafts_created_idx
  ON public.newsletter_drafts (created_at DESC);

ALTER TABLE public.newsletter_drafts ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.inquiries
  ADD COLUMN IF NOT EXISTS ref text;

COMMENT ON COLUMN public.inquiries.ref IS '유입 출처. 뉴스레터 CTA 는 briefing-<newsletter_drafts.id>';
