// ─── 강사/강연 분야 — 28개 통합 카테고리 ───────────────────
// value = DB 저장값(기본키), label = 필터 버튼에 표시되는 통합 레이블
export const SPEAKER_FIELDS = [
  { value: '경영전략',     label: '경영전략/비즈니스/산업/혁신' },
  { value: '경제',         label: '경제/경제전망' },
  { value: '리더십',       label: '리더십/코칭' },
  { value: '영업',         label: '영업/마케팅/CS/협상' },
  { value: 'HR',           label: 'HR/성과관리/조직관리/인사/노무/법무' },
  { value: 'IT',           label: 'IT/미래/트렌드/빅데이터' },
  { value: '소통',         label: '소통/커뮤니케이션' },
  { value: '업무스킬',     label: '업무스킬/기획력/보고서/문해력' },
  { value: '동기부여',     label: '동기부여/열정/도전' },
  { value: '인문학',       label: '인문학/문화/예술/역사' },
  { value: '건강',         label: '건강' },
  { value: '심리',         label: '심리/스트레스/멘탈' },
  { value: '창의',         label: '창의/뇌과학' },
  { value: '재테크',       label: '재테크/투자' },
  { value: '교육',         label: '교육/자녀교육' },
  { value: '취업',         label: '취업/면접' },
  { value: '라이프',       label: '라이프' },
  { value: '법정필수',     label: '법정필수/법률' },
  { value: '정치',         label: '정치/사회/문화' },
  { value: '창업',         label: '창업/스타트업' },
  { value: '힐링',         label: '힐링/명상' },
  { value: '자기계발',     label: '자기계발' },
  { value: '행복',         label: '행복/가족' },
  { value: '위기관리',     label: '위기관리' },
  { value: '팀워크',       label: '팀워크/팀빌딩' },
  { value: '비즈니스매너', label: '비즈니스매너' },
  { value: '갈등관리',     label: '갈등관리/문제해결/변화관리' },
  { value: 'ESG',          label: 'ESG/기후변화/환경' },
] as const

// ─── 구 카테고리 → 신 카테고리 별칭 (DB 기존값 역호환) ────────
// 기존 speakers.fields에 저장된 옛 값 → 신 primaryValue로 매핑
// 필터 쿼리 시 overlaps()에 함께 포함, 카드 태그 표시에도 사용
export const FIELD_ALIASES: Record<string, string> = {
  '경제전망':   '경제',
  '코칭':       '리더십',
  '마케팅':     '영업',
  'CS':         '영업',
  '성과관리':   'HR',
  '조직관리':   'HR',
  'AI':         'IT',
  '미래':       'IT',
  '트렌드':     'IT',
  '커뮤니케이션': '소통',
  '스피치':     '소통',
  '열정':       '동기부여',
  '임파워먼트': '동기부여',
  '문학':       '인문학',
  '예술':       '인문학',
  '역사':       '인문학',
  '스트레스':   '심리',
  '자녀교육':   '교육',
  '면접':       '취업',
  '법률':       '법정필수',
  '사회':       '정치',
  '스타트업':   '창업',
  '명상':       '힐링',
  // ── 인사이트 태그 alias (BUG-N-014) ──
  '번아웃':       '심리',
  '멘탈헬스':     '심리',
  '심리적안전감': '심리',
  '회복탄력성':   '심리',
  '팀장':         '리더십',
  '1on1':         '리더십',
  'MZ세대':       'HR',
  'MZ':           'HR',
  '조직문화':     'HR',
  '직원복지':     'HR',
  '조용한퇴사':   '동기부여',
  '창의력':       '창의',
  'AI강연':       'IT',
}

// ─── 전체 fieldMap 생성 헬퍼 (기본 + 별칭 포함) ─────────────
export function buildFieldMap(): Record<string, string> {
  const map: Record<string, string> = {}
  for (const { value, label } of SPEAKER_FIELDS) {
    map[value] = label
  }
  for (const [alias, primary] of Object.entries(FIELD_ALIASES)) {
    const primaryLabel = SPEAKER_FIELDS.find((f) => f.value === primary)?.label
    if (primaryLabel) map[alias] = primaryLabel
  }
  return map
}

// ─── 필터 값 → 쿼리용 확장 값 배열 ─────────────────────────
// 'HR' → ['HR', '성과관리', '조직관리'] 등 overlaps 쿼리에 사용
export function getFieldWithAliases(primaryValue: string): string[] {
  const aliases = Object.entries(FIELD_ALIASES)
    .filter(([, pv]) => pv === primaryValue)
    .map(([alias]) => alias)
  return [primaryValue, ...aliases]
}

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
