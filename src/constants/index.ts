// ─── 강사/강연 분야 ─────────────────────────────────────────
export const SPEAKER_FIELDS = [
  { value: 'leadership', label: '리더십' },
  { value: 'motivation', label: '동기부여' },
  { value: 'marketing', label: '마케팅' },
  { value: 'org_culture', label: '조직문화' },
  { value: 'ai_tech', label: 'AI/기술' },
  { value: 'communication', label: '커뮤니케이션' },
  { value: 'sales', label: '영업' },
  { value: 'self_development', label: '자기계발' },
  { value: 'hr', label: '인사/교육' },
  { value: 'finance', label: '재무/경영' },
] as const

// ─── 강연료 범위 ─────────────────────────────────────────
export const FEE_RANGES = [
  { value: 'under_100', label: '100만원 미만' },
  { value: '100_300', label: '100~300만원' },
  { value: 'over_300', label: '300만원 이상' },
] as const

// ─── 강연 시간 ─────────────────────────────────────────
export const LECTURE_DURATIONS = [
  { value: '1h', label: '1시간' },
  { value: '2h', label: '2시간' },
  { value: 'half_day', label: '반일 (4시간)' },
  { value: 'full_day', label: '하루 (8시간)' },
] as const

// ─── 문의 유형 ─────────────────────────────────────────
export const INQUIRY_TYPES = [
  { value: 'lecture_plan', label: '강연기획 문의' },
  { value: 'recruitment', label: '강사섭외 문의' },
  { value: 'speaker_register', label: '강사등록 문의' },
] as const

// ─── 문의 상태 ─────────────────────────────────────────
export const INQUIRY_STATUSES = [
  { value: 'new', label: '신규', color: 'blue' },
  { value: 'confirmed', label: '확인', color: 'yellow' },
  { value: 'processing', label: '처리중', color: 'orange' },
  { value: 'done', label: '완료', color: 'green' },
] as const

// ─── FAQ 기본 카테고리 ─────────────────────────────────
export const FAQ_DEFAULT_CATEGORIES = [
  '강연 문의',
  '강사 등록',
  '이용 방법',
  '기타',
] as const

// ─── 예산 범위 (문의 폼) ──────────────────────────────────
export const BUDGET_RANGES = [
  { value: 'under_100', label: '100만원 미만' },
  { value: '100_300', label: '100~300만원' },
  { value: '300_500', label: '300~500만원' },
  { value: 'over_500', label: '500만원 이상' },
  { value: 'undecided', label: '미정' },
] as const

// ─── 파일 업로드 제한 ─────────────────────────────────
export const FILE_UPLOAD = {
  PROFILE_IMAGE: {
    maxSize: 2 * 1024 * 1024, // 2MB
    accept: ['image/jpeg', 'image/png', 'image/webp'],
  },
  SPEAKER_DOCUMENT: {
    maxSize: 10 * 1024 * 1024, // 10MB
    accept: [
      'application/pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  },
} as const

// ─── 페이지네이션 ─────────────────────────────────────
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MOBILE_SPEAKERS_LIMIT: 10,
} as const
