-- ============================================================
-- 007: 강연 인사이트 (insights) 테이블
-- type: 'issue' (오늘의 이슈) | 'report' (강연 현장) | 'pick' (이 강사 어때요?)
-- ============================================================

CREATE TABLE IF NOT EXISTS insights (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  type            text        NOT NULL
                              CHECK (type IN ('issue', 'report', 'pick')),

  -- 공통 필드
  title           text        NOT NULL,
  thumbnail_url   text,
  summary         text,                    -- SEO 메타 설명 / 요약 한 줄
  content_json    jsonb,                   -- Tiptap editor JSON output
  content_html    text,                    -- Rendered HTML (display용)

  -- 발행 관리
  status          text        NOT NULL DEFAULT 'draft'
                              CHECK (status IN ('draft', 'pending', 'published')),
  scheduled_at    timestamptz,             -- 예약 발행 시각
  published_at    timestamptz,             -- 실제 발행 시각

  -- 홈 노출
  home_featured   boolean     DEFAULT false,

  -- 타입별 추가 데이터 (JSONB)
  -- issue:  { related_speaker_ids: uuid[] }
  -- report: { company: string, company_visibility: 'public'|'anonymous'|'industry_only',
  --           speaker_id: uuid, event_date: date,
  --           images: [{url: string, caption: string, order: number}] }
  -- pick:   { speaker_id: uuid, reason: string, topics: string[],
  --           start_date: date, end_date: date }
  meta            jsonb       DEFAULT '{}',

  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS insights_type_status_idx
  ON insights (type, status, published_at DESC);

CREATE INDEX IF NOT EXISTS insights_home_featured_idx
  ON insights (home_featured, status)
  WHERE home_featured = true;

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_insights_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS insights_updated_at_trigger ON insights;
CREATE TRIGGER insights_updated_at_trigger
  BEFORE UPDATE ON insights
  FOR EACH ROW EXECUTE FUNCTION update_insights_updated_at();

-- RLS (어드민만 쓰기, 발행된 것은 누구나 읽기)
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "published insights are public"
  ON insights FOR SELECT
  USING (status = 'published');

CREATE POLICY "admin full access"
  ON insights FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');
