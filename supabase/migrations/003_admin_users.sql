-- ============================================================
-- 어드민 전용 테이블 (일반 회원 profiles와 완전 분리)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.admin_users (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email      TEXT NOT NULL UNIQUE,
  name       TEXT NOT NULL DEFAULT '어드민',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 어드민 테이블은 RLS 없이 service_role만 접근
-- (미들웨어에서 service_role key로 검증)

-- 초기 어드민 계정 (admin@choisunhwa.com)
INSERT INTO public.admin_users (email, name)
VALUES ('admin@choisunhwa.com', '최선화 어드민')
ON CONFLICT (email) DO NOTHING;

-- auth.users → profiles 자동 생성 트리거
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, provider)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    CASE WHEN NEW.app_metadata->>'provider' = 'google' THEN 'google' ELSE 'email' END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
