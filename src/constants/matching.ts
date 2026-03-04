// ─── Wizard Step 1: 분야 선택 ────────────────────────────────
export const WIZARD_FIELDS = [
  { id: 'leadership', label: '리더십 / 조직문화',    icon: '👑', dbFields: ['leadership', 'org_culture'] },
  { id: 'motivation', label: '동기부여 / 자기계발',   icon: '🔥', dbFields: ['motivation', 'self_development'] },
  { id: 'marketing',  label: '마케팅 / 영업',        icon: '📊', dbFields: ['marketing', 'sales'] },
  { id: 'communication', label: '소통 / 커뮤니케이션', icon: '💬', dbFields: ['communication'] },
  { id: 'ai',         label: 'AI / 디지털 전환',     icon: '🤖', dbFields: ['ai_tech'] },
  { id: 'psychology', label: '심리 / 힐링 / 웰니스',  icon: '🧠', dbFields: ['motivation'] },
  { id: 'finance',    label: '재무 / 경영 전략',      icon: '💼', dbFields: ['finance'] },
  { id: 'other',      label: '기타 / 전체',           icon: '✏️', dbFields: [] },
] as const

export type WizardFieldId = (typeof WIZARD_FIELDS)[number]['id']

// ─── Wizard Step 2: 주제 (분야별 동적) ──────────────────────
export const TOPICS_BY_FIELD: Record<WizardFieldId, string[]> = {
  leadership:    ['성과 높이는 팀 빌딩', '세대 갈등 해소', '조직 변화 관리', 'MZ 세대 리더십'],
  motivation:    ['번아웃 극복', '목표 설정', '자기 효능감 향상', '변화 수용'],
  marketing:     ['고객 설득 전략', '디지털 마케팅', '영업 성과 향상', '브랜드 스토리텔링'],
  communication: ['세대 간 소통', '협업 문화 만들기', '피드백 스킬', '갈등 해결'],
  ai:            ['ChatGPT 실무 활용', '디지털 트랜스포메이션', 'AI 리터러시', '업무 자동화'],
  psychology:    ['스트레스 관리', '회복탄력성', '감정 코칭', '마음챙김'],
  finance:       ['경영 전략 수립', '재무 리터러시', '스타트업 성장 전략', '투자 인사이트'],
  other:         ['어떤 주제든 괜찮아요 (전체 매칭)'],
}

// ─── Wizard Step 3: 강연 대상 ────────────────────────────────
export const WIZARD_TARGETS = [
  { id: 'executive',   label: '임원 / 경영진' },
  { id: 'manager',     label: '팀장 / 중간 관리자' },
  { id: 'all_staff',   label: '전체 직원' },
  { id: 'junior',      label: '신입 / 주니어' },
  { id: 'sales_team',  label: '영업 / 마케팅 팀' },
  { id: 'public',      label: '공공기관 / 공무원' },
  { id: 'youth',       label: '학생 / 청년' },
] as const
