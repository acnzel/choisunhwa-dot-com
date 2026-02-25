-- ============================================================
-- 어드민 role 추가
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
  CHECK (role IN ('user', 'admin'));

-- 어드민은 모든 프로필 조회 가능
CREATE POLICY "어드민은 모든 프로필 조회 가능" ON public.profiles
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    )
  );

-- 어드민 체크용 함수
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- speakers: 어드민은 비공개 강사도 조회/수정 가능
CREATE POLICY "어드민은 모든 강사 접근 가능" ON public.speakers
  FOR ALL USING (public.is_admin());

-- lectures: 어드민은 비공개 강연도 조회/수정 가능
CREATE POLICY "어드민은 모든 강연 접근 가능" ON public.lectures
  FOR ALL USING (public.is_admin());

-- faqs: 어드민은 모든 FAQ 접근 가능
CREATE POLICY "어드민은 모든 FAQ 접근 가능" ON public.faqs
  FOR ALL USING (public.is_admin());

-- notices: 어드민은 모든 공지사항 접근 가능
CREATE POLICY "어드민은 모든 공지사항 접근 가능" ON public.notices
  FOR ALL USING (public.is_admin());

-- speaker_reviews: 어드민은 모든 후기 접근 가능
CREATE POLICY "어드민은 모든 후기 접근 가능" ON public.speaker_reviews
  FOR ALL USING (public.is_admin());

-- inquiries: 어드민 접근 (service role 외에도 RLS로 허용)
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "어드민은 모든 문의 접근 가능" ON public.inquiries
  FOR ALL USING (public.is_admin());

-- inquiry_memos: 어드민 접근
ALTER TABLE public.inquiry_memos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "어드민은 모든 메모 접근 가능" ON public.inquiry_memos
  FOR ALL USING (public.is_admin());
