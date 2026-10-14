-- Migration 020: speaker_applications 공개 조회 정책 제거
-- 012 의 "Applicant read own" 은 이름과 달리 using (true) 여서 anon 키로 모든 신청자의
-- 이름·이메일·연락처를 읽을 수 있었다. 앱은 이 테이블을 service role(어드민 API)로만 읽으므로
-- 정책을 지운다. 신청서 제출(insert)과 service role 정책은 그대로 둔다.

DROP POLICY IF EXISTS "Applicant read own" ON public.speaker_applications;
