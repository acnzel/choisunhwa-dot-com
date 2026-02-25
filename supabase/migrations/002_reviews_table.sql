-- ============================================================
-- 강사 후기 테이블 (Phase 1 포함 결정)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.speaker_reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  speaker_id  UUID NOT NULL REFERENCES public.speakers(id) ON DELETE CASCADE,
  company     TEXT NOT NULL DEFAULT '',   -- 기업명
  rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  content     TEXT NOT NULL,
  reviewed_at DATE NOT NULL DEFAULT CURRENT_DATE,
  is_visible  BOOLEAN NOT NULL DEFAULT true,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.speaker_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "공개 후기는 누구나 조회 가능" ON public.speaker_reviews
  FOR SELECT USING (is_visible = true);

CREATE INDEX IF NOT EXISTS idx_reviews_speaker_id
  ON public.speaker_reviews (speaker_id, is_visible, sort_order);
