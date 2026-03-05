// ─── 강사/강연 분야 (value = DB에 저장되는 한글 값) ────────
export const SPEAKER_FIELDS = [
  // 경제/경영
  { value: '경제',       label: '경제' },
  { value: '경제전망',   label: '경제전망' },
  { value: '재테크',     label: '재테크' },
  { value: '창업',       label: '창업' },
  { value: '스타트업',   label: '스타트업' },
  // 리더십/조직
  { value: '리더십',     label: '리더십' },
  { value: '코칭',       label: '코칭' },
  { value: '임파워먼트', label: '임파워먼트' },
  { value: '성과관리',   label: '성과관리' },
  { value: '조직관리',   label: '조직관리' },
  // 소통/스킬
  { value: '소통',       label: '소통' },
  { value: 'CS',         label: 'CS' },
  { value: '스피치',     label: '스피치' },
  { value: '업무스킬',   label: '업무스킬' },
  // HR/교육
  { value: 'HR',         label: 'HR' },
  { value: '교육',       label: '교육' },
  { value: '자녀교육',   label: '자녀교육' },
  { value: '취업',       label: '취업' },
  { value: '면접',       label: '면접' },
  // 마케팅/영업
  { value: '마케팅',     label: '마케팅' },
  { value: '영업',       label: '영업' },
  // 동기/자기계발
  { value: '동기부여',   label: '동기부여' },
  { value: '열정',       label: '열정' },
  { value: '자기계발',   label: '자기계발' },
  { value: '창의',       label: '창의' },
  // AI/기술
  { value: 'AI',         label: 'AI' },
  { value: 'IT',         label: 'IT' },
  { value: '미래',       label: '미래' },
  { value: '트렌드',     label: '트렌드' },
  // 인문/예술/역사
  { value: '인문학',     label: '인문학' },
  { value: '문학',       label: '문학' },
  { value: '예술',       label: '예술' },
  { value: '역사',       label: '역사' },
  // 건강/심리
  { value: '건강',       label: '건강' },
  { value: '심리',       label: '심리' },
  { value: '스트레스',   label: '스트레스' },
  { value: '힐링',       label: '힐링' },
  { value: '명상',       label: '명상' },
  { value: '라이프',     label: '라이프' },
  // 법/사회
  { value: '법정필수',   label: '법정필수' },
  { value: '법률',       label: '법률' },
  { value: '정치',       label: '정치' },
  { value: '사회',       label: '사회' },
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
