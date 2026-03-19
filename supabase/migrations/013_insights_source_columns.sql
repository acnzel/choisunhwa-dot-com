-- ============================================================
-- 013: insights 테이블 — 트렌드 브리핑 자동화용 컬럼 추가
-- 목적: RSS 수집·AI 요약 자동화 파이프라인 지원
-- ============================================================

ALTER TABLE insights
  ADD COLUMN IF NOT EXISTS source_url     TEXT,              -- 원문 URL
  ADD COLUMN IF NOT EXISTS source_name    TEXT,              -- 매체명 (예: HR Insight, DBR)
  ADD COLUMN IF NOT EXISTS auto_generated BOOLEAN DEFAULT false; -- 자동생성 여부 (Cron 수집 = true)

-- 인덱스: 자동생성 건만 빠르게 조회
CREATE INDEX IF NOT EXISTS insights_auto_generated_idx
  ON insights (auto_generated, status)
  WHERE auto_generated = true;

COMMENT ON COLUMN insights.source_url     IS '트렌드 브리핑 원문 기사 URL';
COMMENT ON COLUMN insights.source_name    IS '수집 매체명 (네이버, DBR, HR Insight 등)';
COMMENT ON COLUMN insights.auto_generated IS 'Cron 자동 수집 여부. true면 어드민 검토 필요';
