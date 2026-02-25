-- ============================================================
-- 최선화닷컴 초기 스키마
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Users (Supabase Auth 확장) ──────────────────────────
-- Supabase Auth가 auth.users를 관리, 추가 정보를 public.profiles에 저장

CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL DEFAULT '',
  provider    TEXT NOT NULL DEFAULT 'email' CHECK (provider IN ('email', 'google')),
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'unverified')),
  marketing_agreed BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- RLS 활성화
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "유저는 자신의 프로필만 조회/수정 가능" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- ─── FAQ 카테고리 ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.faq_categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── FAQ ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.faqs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES public.faq_categories(id) ON DELETE SET NULL,
  question    TEXT NOT NULL,
  answer      TEXT NOT NULL,
  is_visible  BOOLEAN NOT NULL DEFAULT true,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "공개 FAQ는 누구나 조회 가능" ON public.faqs
  FOR SELECT USING (is_visible = true);

-- ─── 공지사항 ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notices (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  is_pinned   BOOLEAN NOT NULL DEFAULT false,
  is_visible  BOOLEAN NOT NULL DEFAULT true,
  published_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "공개 공지사항은 누구나 조회 가능" ON public.notices
  FOR SELECT USING (is_visible = true AND published_at <= NOW());

-- ─── 강사 ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.speakers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  title           TEXT NOT NULL DEFAULT '',
  company         TEXT NOT NULL DEFAULT '',
  photo_url       TEXT,
  bio_short       TEXT NOT NULL DEFAULT '',
  bio_full        TEXT NOT NULL DEFAULT '',
  fields          TEXT[] NOT NULL DEFAULT '{}',
  fee_range       TEXT CHECK (fee_range IN ('under_100', '100_300', 'over_300')),
  careers         JSONB NOT NULL DEFAULT '[]',
  lecture_histories JSONB NOT NULL DEFAULT '[]',
  media_links     TEXT[] NOT NULL DEFAULT '{}',
  news_links      TEXT[] NOT NULL DEFAULT '{}',
  is_visible      BOOLEAN NOT NULL DEFAULT false,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.speakers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "공개 강사는 누구나 조회 가능" ON public.speakers
  FOR SELECT USING (is_visible = true);

-- ─── 강연 ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lectures (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  speaker_id   UUID NOT NULL REFERENCES public.speakers(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  thumbnail_url TEXT,
  fields       TEXT[] NOT NULL DEFAULT '{}',
  duration     TEXT NOT NULL DEFAULT '2h' CHECK (duration IN ('1h', '2h', 'half_day', 'full_day')),
  target       TEXT NOT NULL DEFAULT '',
  summary      TEXT NOT NULL DEFAULT '',
  goals        TEXT[] NOT NULL DEFAULT '{}',
  program      JSONB NOT NULL DEFAULT '[]',
  effects      TEXT[] NOT NULL DEFAULT '{}',
  content_json JSONB,
  is_visible   BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.lectures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "공개 강연은 누구나 조회 가능" ON public.lectures
  FOR SELECT USING (is_visible = true);

-- ─── 문의 ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.inquiries (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type             TEXT NOT NULL CHECK (type IN ('lecture_plan', 'recruitment', 'speaker_register')),
  name             TEXT NOT NULL,
  email            TEXT NOT NULL,
  phone            TEXT NOT NULL,
  company          TEXT NOT NULL DEFAULT '',
  desired_speaker  TEXT,
  lecture_date     DATE,
  attendee_count   INTEGER,
  venue            TEXT,
  budget_range     TEXT,
  content          TEXT NOT NULL,
  file_url         TEXT,
  status           TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'confirmed', 'processing', 'done')),
  assigned_admin_id UUID,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS 없음 (어드민만 접근, API Route에서 service role key로 처리)

-- ─── 문의 메모 ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.inquiry_memos (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inquiry_id   UUID NOT NULL REFERENCES public.inquiries(id) ON DELETE CASCADE,
  admin_id     UUID NOT NULL,
  admin_name   TEXT NOT NULL DEFAULT '',
  content      TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 인덱스 ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_speakers_is_visible ON public.speakers (is_visible, sort_order);
CREATE INDEX IF NOT EXISTS idx_speakers_fields ON public.speakers USING GIN (fields);
CREATE INDEX IF NOT EXISTS idx_lectures_speaker_id ON public.lectures (speaker_id);
CREATE INDEX IF NOT EXISTS idx_lectures_is_visible ON public.lectures (is_visible);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notices_published ON public.notices (is_visible, is_pinned, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_faqs_category ON public.faqs (category_id, sort_order);
