-- Migration 022: inquiries, inquiry_memos 의 RLS 를 켠다.
-- 운영 DB 에는 두 테이블의 RLS 가 꺼져 있어 공개 anon 키로 문의(고객 이름·연락처·내용)와
-- 어드민 메모를 읽고 고치고 지울 수 있었다(2026-10-14 스키마 대조에서 확인).
-- 어드민 화면·API 는 service role 로 접근하므로 RLS 와 무관하다.
-- 공개 문의 폼(app/actions/inquiry.ts)은 anon 으로 insert 만 하므로 016 의 insert 정책을 보장한다.
-- 다시 실행해도 안전하다.

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiry_memos ENABLE ROW LEVEL SECURITY;

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
