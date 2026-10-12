-- 003_profiles_role.sql
-- profiles 테이블에 role 컬럼 추가 (user / admin)

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user'
  CHECK (role IN ('user', 'admin'));

-- 인덱스 (어드민 미들웨어에서 role 조회 성능)
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- RLS: 본인 프로필 읽기 허용 (미들웨어 role 체크용)
-- 이미 정책이 있다면 이 부분은 스킵됨
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles'
    AND policyname = 'profiles_select_own'
  ) THEN
    CREATE POLICY profiles_select_own ON profiles
      FOR SELECT
      USING (auth.uid() = id);
  END IF;
END $$;
