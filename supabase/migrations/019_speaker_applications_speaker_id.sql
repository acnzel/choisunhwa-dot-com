-- Migration 019: 승인한 강사 신청서와 등록된 강사를 연결한다.
-- 승인 API 가 비공개 강사를 만든 뒤 그 id 를 남긴다. 강사를 지우면 연결만 끊기고 신청서는 남는다.
-- 승인 전 신청서와 이 마이그레이션 이전에 승인된 신청서는 NULL 이다.

ALTER TABLE public.speaker_applications
  ADD COLUMN IF NOT EXISTS speaker_id uuid REFERENCES public.speakers(id) ON DELETE SET NULL;
