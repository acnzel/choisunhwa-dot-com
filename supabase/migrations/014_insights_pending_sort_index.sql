-- 트렌드 브리핑 관리 페이지(auto_generated=true, status='draft' 목록)가
-- created_at DESC 로 정렬하므로 정렬까지 포함하는 인덱스로 교체
DROP INDEX IF EXISTS insights_auto_generated_idx;

CREATE INDEX IF NOT EXISTS insights_auto_generated_status_created_idx
  ON insights (auto_generated, status, created_at DESC)
  WHERE auto_generated = true;
