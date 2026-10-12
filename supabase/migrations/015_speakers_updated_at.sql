-- Migration 015: speakers.updated_at 추가 (sitemap lastmod 정확도)
-- 컬럼이 없을 때만 추가하고 기존 행을 created_at 으로 채운다 (마이그레이션 시점으로 일괄 갱신 방지).
-- 트리거는 백필 이후에 만든다. 다시 실행해도 이미 갱신된 값을 되돌리지 않는다.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'speakers' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE speakers ADD COLUMN updated_at timestamptz;
    UPDATE speakers SET updated_at = created_at;
    ALTER TABLE speakers ALTER COLUMN updated_at SET DEFAULT now();
    ALTER TABLE speakers ALTER COLUMN updated_at SET NOT NULL;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION update_speakers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS speakers_updated_at_trigger ON speakers;
CREATE TRIGGER speakers_updated_at_trigger
  BEFORE UPDATE ON speakers
  FOR EACH ROW EXECUTE FUNCTION update_speakers_updated_at();
