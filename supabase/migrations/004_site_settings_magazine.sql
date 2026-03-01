-- ============================================================
-- 사이트 설정 테이블 (히어로 카피, 신뢰 지표, 프로세스 단계)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 누구나 조회 가능 (공개 설정값)
CREATE POLICY "site_settings 공개 조회" ON public.site_settings
  FOR SELECT USING (true);

-- 어드민만 수정 가능
CREATE POLICY "site_settings 어드민 수정" ON public.site_settings
  FOR ALL USING (public.is_admin());

-- 초기 기본값 삽입
INSERT INTO public.site_settings (key, value) VALUES
  ('hero', '{
    "headline": "강연 한 번이 조직을 바꿉니다.",
    "subheadline": "최선화닷컴은 단순한 소개가 아닙니다.\n기획부터 현장까지, 서로 끌리는 강사와 기업을 연결합니다."
  }'),
  ('trust_stats', '[
    {"label": "누적 강연 기획", "value": "500건+"},
    {"label": "파트너 기업/기관", "value": "200곳+"},
    {"label": "고객 만족도", "value": "98%"}
  ]'),
  ('process_steps', '[
    {"step": "01", "title": "의뢰 접수", "description": "강연 목적, 대상, 예산을 간단히 알려주세요"},
    {"step": "02", "title": "24시간 내 연락", "description": "담당자가 직접 연락해 요구사항을 확인합니다"},
    {"step": "03", "title": "맞춤 강사 제안", "description": "조직에 딱 맞는 강사 2~3명을 추천드립니다"},
    {"step": "04", "title": "계약 & 진행", "description": "일정, 장소, 내용 조율 후 강연이 시작됩니다"}
  ]')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- 매거진 아티클 테이블
-- ============================================================
CREATE TYPE IF NOT EXISTS magazine_tab AS ENUM ('editor_pick', 'field_report', 'off_stage', 'coming_up');

CREATE TABLE IF NOT EXISTS public.magazine_articles (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tab          magazine_tab NOT NULL,
  title        TEXT NOT NULL,
  summary      TEXT NOT NULL DEFAULT '',
  thumbnail_url TEXT,
  content      TEXT NOT NULL DEFAULT '',
  author       TEXT NOT NULL DEFAULT '에디터',
  read_minutes INTEGER NOT NULL DEFAULT 3,
  event_date   DATE,                          -- coming_up 탭용
  is_visible   BOOLEAN NOT NULL DEFAULT false,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.magazine_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "공개 아티클 조회" ON public.magazine_articles
  FOR SELECT USING (is_visible = true);

CREATE POLICY "어드민 아티클 전체 접근" ON public.magazine_articles
  FOR ALL USING (public.is_admin());

-- 탭별 노출 ON/OFF 설정
INSERT INTO public.site_settings (key, value) VALUES
  ('magazine_tabs', '{
    "editor_pick": false,
    "field_report": false,
    "off_stage": false,
    "coming_up": false
  }')
ON CONFLICT (key) DO NOTHING;
