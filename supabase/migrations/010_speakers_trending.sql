-- Migration 010: '지금 뜨는' 강사 관리용 is_trending 컬럼 추가
ALTER TABLE speakers
  ADD COLUMN IF NOT EXISTS is_trending BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_speakers_trending ON speakers(is_trending) WHERE is_trending = true;
