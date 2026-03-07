-- Phase 2: lectures 테이블에 article_type 컬럼 추가
-- MVP에서는 content_json->>'article_type' 사용; 이 컬럼은 Phase 2에서 활성화
ALTER TABLE lectures
  ADD COLUMN IF NOT EXISTS article_type text
    NOT NULL DEFAULT 'lecture'
    CHECK (article_type IN ('lecture', 'editor_pick', 'field_report', 'behind', 'monthly'));

-- 기존 rows: content_json에 article_type이 있으면 동기화
UPDATE lectures
  SET article_type = content_json->>'article_type'
  WHERE content_json->>'article_type' IS NOT NULL;

COMMENT ON COLUMN lectures.article_type IS
  'lecture(기본강연) | editor_pick | field_report | behind | monthly';
