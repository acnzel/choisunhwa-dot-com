-- Migration 021: speaker_applications 공개 insert 정책 제거
-- 012 의 "Anyone can apply" 는 with check (true) 여서 anon 키로 API 검증(zod)을 거치지 않고
-- 신청서를 직접 넣을 수 있었다. 공개 신청 폼은 /api/speaker-applications 가 service role 로
-- 넣으므로 정책을 지운다. 이제 이 테이블은 service role 정책만 남는다.

DROP POLICY IF EXISTS "Anyone can apply" ON public.speaker_applications;
