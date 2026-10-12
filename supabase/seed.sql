-- 로컬 Supabase(e2e 테스트) 시드 데이터. `supabase start` / `supabase db reset` 때 적용된다.
-- 운영 DB 에는 적용하지 않는다.

INSERT INTO public.speakers (id, name, title, company, bio_short, bio_full, fields, is_visible, sort_order) VALUES
  ('00000000-0000-4000-8000-000000000001', '테스트강사가', '교수', '테스트대학교', '리더십을 연구하는 테스트 강사입니다.', '리더십과 조직문화를 연구합니다.', '{리더십,HR}', true, 1),
  ('00000000-0000-4000-8000-000000000002', '테스트강사나', '대표', '테스트컴퍼니', 'AI 전환을 돕는 테스트 강사입니다.', 'AI와 디지털 전환을 이야기합니다.', '{IT,경영전략}', true, 2),
  ('00000000-0000-4000-8000-000000000003', '테스트강사다', '작가', '', '심리와 스트레스를 다루는 테스트 강사입니다.', '마음 관리와 회복을 이야기합니다.', '{심리,건강}', true, 3),
  ('00000000-0000-4000-8000-000000000004', '비공개강사', '연구원', '테스트연구소', '공개되지 않아야 하는 강사입니다.', '', '{리더십}', false, 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.insights (id, type, title, summary, content_html, status, published_at, meta) VALUES
  ('00000000-0000-4000-8000-000000000101', 'issue', '테스트 인사이트', '테스트용 인사이트 요약입니다.', '<p>테스트용 인사이트 본문입니다.</p>', 'published', now(), '{"tags":["리더십"]}')
ON CONFLICT (id) DO NOTHING;
