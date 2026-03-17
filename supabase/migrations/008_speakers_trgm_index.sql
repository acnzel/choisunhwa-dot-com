-- pg_trgm 확장 활성화 (ILIKE 성능 향상)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 이름 검색 인덱스
CREATE INDEX IF NOT EXISTS idx_speakers_name_trgm
  ON public.speakers USING GIN (name gin_trgm_ops);

-- 한 줄 소개 검색 인덱스
CREATE INDEX IF NOT EXISTS idx_speakers_bio_short_trgm
  ON public.speakers USING GIN (bio_short gin_trgm_ops);

-- 소속 검색 인덱스
CREATE INDEX IF NOT EXISTS idx_speakers_company_trgm
  ON public.speakers USING GIN (company gin_trgm_ops);

-- 직함 검색 인덱스
CREATE INDEX IF NOT EXISTS idx_speakers_title_trgm
  ON public.speakers USING GIN (title gin_trgm_ops);
