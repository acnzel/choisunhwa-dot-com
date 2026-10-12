-- Migration 016: 비로그인 방문자의 문의 등록 허용
-- 문의 폼(app/actions/inquiry.ts)은 anon 권한으로 inquiries 에 INSERT 한다.
-- 레포 마이그레이션에는 0031 의 어드민 정책만 있어 로컬 DB 에서는 등록이 RLS 로 막혔다.
-- 운영 DB 는 문의 등록이 동작하고 있으므로 이 정책(또는 동등한 설정)이 이미 있다. 다시 실행해도 안전하다.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'inquiries' AND policyname = '누구나 문의 등록 가능'
  ) THEN
    CREATE POLICY "누구나 문의 등록 가능" ON public.inquiries
      FOR INSERT TO anon, authenticated
      WITH CHECK (status = 'new');
  END IF;
END $$;
