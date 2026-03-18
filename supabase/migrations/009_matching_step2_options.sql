-- Migration 009: 매칭 Wizard Step 2 옵션 테이블
-- Step 1 선택에 따른 Step 2 선택지를 어드민에서 수정 가능하도록 DB 관리
-- 현재는 src/constants/matching.ts 의 TOPICS_BY_FIELD 하드코딩으로 동작 중
-- 이 테이블 적용 후 어드민 CMS 연동 필요

CREATE TABLE IF NOT EXISTS matching_step2_options (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step1_id    TEXT NOT NULL,           -- WIZARD_FIELDS id (예: 'leadership')
  label       TEXT NOT NULL,           -- 표시 텍스트
  sort_order  INT  DEFAULT 0,
  is_visible  BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_matching_step2_step1_id ON matching_step2_options(step1_id);
CREATE INDEX IF NOT EXISTS idx_matching_step2_visible   ON matching_step2_options(is_visible);

-- RLS
ALTER TABLE matching_step2_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read" ON matching_step2_options FOR SELECT USING (is_visible = true);
CREATE POLICY "service_all" ON matching_step2_options FOR ALL USING (true);

-- 초기 데이터 삽입 (TOPICS_BY_FIELD 값과 동일)
INSERT INTO matching_step2_options (step1_id, label, sort_order) VALUES
  ('leadership', 'MZ세대와 일하는 법', 1),
  ('leadership', '성과 내는 팀을 만드는 법', 2),
  ('leadership', '나다운 리더십 찾기', 3),
  ('leadership', '위기 상황의 리더십', 4),
  ('leadership', '어떤 주제든 괜찮아요', 5),

  ('org_culture', '세대 갈등 해소와 협업', 1),
  ('org_culture', '변화 관리와 조직 혁신', 2),
  ('org_culture', '일하는 방식 재설계', 3),
  ('org_culture', '성과 문화 만들기', 4),
  ('org_culture', '어떤 주제든 괜찮아요', 5),

  ('motivation', '번아웃 극복과 회복탄력성', 1),
  ('motivation', '삶의 의미와 일의 가치', 2),
  ('motivation', '팀 에너지 끌어올리기', 3),
  ('motivation', '긍정 심리와 행복한 직장', 4),
  ('motivation', '어떤 주제든 괜찮아요', 5),

  ('ai_digital', 'ChatGPT·생성AI 실무 활용', 1),
  ('ai_digital', '조직의 AI 도입 전략', 2),
  ('ai_digital', '데이터 기반 의사결정', 3),
  ('ai_digital', 'AI 시대 인재상과 일하는 방식', 4),
  ('ai_digital', '어떤 주제든 괜찮아요', 5),

  ('communication', 'MZ세대와의 소통법', 1),
  ('communication', '갈등 해소와 관계 회복', 2),
  ('communication', '피드백과 대화 스킬', 3),
  ('communication', '협업 문화 만들기', 4),
  ('communication', '어떤 주제든 괜찮아요', 5),

  ('sales', '고객 설득과 협상 전략', 1),
  ('sales', '디지털 마케팅 실전', 2),
  ('sales', '영업 성과 향상', 3),
  ('sales', '브랜드 스토리텔링', 4),
  ('sales', '어떤 주제든 괜찮아요', 5),

  ('mental', '직장 스트레스 극복', 1),
  ('mental', '회복탄력성 키우기', 2),
  ('mental', '감정 코칭과 마음챙김', 3),
  ('mental', '일과 삶의 균형', 4),
  ('mental', '어떤 주제든 괜찮아요', 5),

  ('strategy', '경영 전략 수립', 1),
  ('strategy', '비즈니스 모델 혁신', 2),
  ('strategy', '미래 산업 트렌드', 3),
  ('strategy', '의사결정과 실행력', 4),
  ('strategy', '어떤 주제든 괜찮아요', 5),

  ('esg', 'ESG 경영 전략 수립', 1),
  ('esg', '기후 위기와 기업 대응', 2),
  ('esg', '사회적 가치와 지속가능성', 3),
  ('esg', 'ESG 평가와 보고서', 4),
  ('esg', '어떤 주제든 괜찮아요', 5),

  ('startup', '창업 아이디어와 실행', 1),
  ('startup', '스타트업 성장 전략', 2),
  ('startup', '혁신적 사고와 창의성', 3),
  ('startup', '실패와 피봇의 경험', 4),
  ('startup', '어떤 주제든 괜찮아요', 5),

  ('teamwork', '팀빌딩과 협업 강화', 1),
  ('teamwork', '업무 생산성과 기획력', 2),
  ('teamwork', '효과적인 보고와 발표', 3),
  ('teamwork', '비즈니스 매너와 에티켓', 4),
  ('teamwork', '어떤 주제든 괜찮아요', 5),

  ('self_growth', '자기 브랜딩과 커리어', 1),
  ('self_growth', '목표 설정과 습관 형성', 2),
  ('self_growth', '취업·이직 전략', 3),
  ('self_growth', '강점 발견과 성장 마인드셋', 4),
  ('self_growth', '어떤 주제든 괜찮아요', 5),

  ('finance', '경제 흐름과 투자 인사이트', 1),
  ('finance', '재무 리터러시 기초', 2),
  ('finance', '부동산·주식 재테크', 3),
  ('finance', '글로벌 경제와 전망', 4),
  ('finance', '어떤 주제든 괜찮아요', 5),

  ('humanities', '인문학으로 보는 세상', 1),
  ('humanities', '역사와 리더십의 교훈', 2),
  ('humanities', '문화·예술과 창의적 사고', 3),
  ('humanities', '라이프스타일과 행복', 4),
  ('humanities', '어떤 주제든 괜찮아요', 5);
