-- Migration 017: 문의 유형에 plan_request(교육 기획안 요청) 추가
-- /inquiry/plan 요청은 그동안 lecture_plan 으로 저장하고 본문 첫 줄 '[교육 기획안 요청]' 으로 구분했다.
-- 유형으로 분리해 어드민 목록·대시보드에서 강연기획 문의와 따로 보이게 한다.
-- 허용 값을 넓히기만 하므로 코드 배포 전에 먼저 적용해도 기존 동작에 영향이 없다. 다시 실행해도 안전하다.

DO $$
DECLARE
  con record;
BEGIN
  -- 001 의 인라인 CHECK 는 자동 이름이라 환경마다 다를 수 있어 정의로 찾는다.
  FOR con IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.inquiries'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%lecture_plan%'
      AND conname <> 'inquiries_type_check_v2'
  LOOP
    EXECUTE format('ALTER TABLE public.inquiries DROP CONSTRAINT %I', con.conname);
  END LOOP;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.inquiries'::regclass AND conname = 'inquiries_type_check_v2'
  ) THEN
    ALTER TABLE public.inquiries ADD CONSTRAINT inquiries_type_check_v2
      CHECK (type IN ('lecture_plan', 'recruitment', 'speaker_register', 'plan_request'));
  END IF;
END $$;

-- 머리말로 구분하던 기존 요청을 새 유형으로 옮기고 머리말을 뗀다.
UPDATE public.inquiries
SET type = 'plan_request',
    content = substring(content FROM char_length('[교육 기획안 요청]') + 2)
WHERE type = 'lecture_plan'
  AND content LIKE '[교육 기획안 요청]' || E'\n' || '%';
