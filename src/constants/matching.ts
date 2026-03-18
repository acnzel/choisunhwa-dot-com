// ─── Wizard Step 1: 목적/상황 카드 14개 ─────────────────────────
// dbFields: DB speakers.fields[] 한글 값과 일치 (28개 카테고리)
export const WIZARD_FIELDS = [
  {
    id: 'leadership',
    label: '리더십을 키워야 해요',
    icon: '👑',
    dbFields: ['리더십'],
  },
  {
    id: 'org_culture',
    label: '조직문화를 바꾸고 싶어요',
    icon: '🏢',
    dbFields: ['HR', '갈등관리', '팀워크'],
  },
  {
    id: 'motivation',
    label: '직원 동기부여·사기 진작',
    icon: '🔥',
    dbFields: ['동기부여', '심리', '행복'],
  },
  {
    id: 'ai_digital',
    label: 'AI·디지털 전환이 필요해요',
    icon: '🤖',
    dbFields: ['IT', '경영전략'],
  },
  {
    id: 'communication',
    label: '소통·갈등·세대 문제',
    icon: '💬',
    dbFields: ['소통', '갈등관리'],
  },
  {
    id: 'sales',
    label: '영업·마케팅 역량 강화',
    icon: '📊',
    dbFields: ['영업'],
  },
  {
    id: 'mental',
    label: '스트레스·멘탈·번아웃 관리',
    icon: '🧠',
    dbFields: ['심리', '건강', '힐링'],
  },
  {
    id: 'strategy',
    label: '경영 전략·비즈니스 혁신',
    icon: '💼',
    dbFields: ['경영전략', '경제'],
  },
  {
    id: 'esg',
    label: 'ESG·지속가능경영',
    icon: '🌱',
    dbFields: ['ESG'],
  },
  {
    id: 'startup',
    label: '창업·스타트업·혁신',
    icon: '🚀',
    dbFields: ['창업', '창의'],
  },
  {
    id: 'teamwork',
    label: '팀워크·업무 효율·조직활성화',
    icon: '🤝',
    dbFields: ['팀워크', '업무스킬', '비즈니스매너'],
  },
  {
    id: 'self_growth',
    label: '자기계발·커리어 성장',
    icon: '📈',
    dbFields: ['자기계발', '취업'],
  },
  {
    id: 'finance',
    label: '재테크·재무·경제 이해',
    icon: '💰',
    dbFields: ['재테크', '경제'],
  },
  {
    id: 'humanities',
    label: '인문학·문화·라이프',
    icon: '📚',
    dbFields: ['인문학', '라이프', '행복', '정치'],
  },
] as const

export type WizardFieldId = (typeof WIZARD_FIELDS)[number]['id']

// ─── Wizard Step 2: 구체적 주제 (Step 1 선택에 따른 동적 표시) ──
export const TOPICS_BY_FIELD: Record<WizardFieldId, string[]> = {
  leadership: [
    'MZ세대와 일하는 법',
    '성과 내는 팀을 만드는 법',
    '나다운 리더십 찾기',
    '위기 상황의 리더십',
    '어떤 주제든 괜찮아요',
  ],
  org_culture: [
    '세대 갈등 해소와 협업',
    '변화 관리와 조직 혁신',
    '일하는 방식 재설계',
    '성과 문화 만들기',
    '어떤 주제든 괜찮아요',
  ],
  motivation: [
    '번아웃 극복과 회복탄력성',
    '삶의 의미와 일의 가치',
    '팀 에너지 끌어올리기',
    '긍정 심리와 행복한 직장',
    '어떤 주제든 괜찮아요',
  ],
  ai_digital: [
    'ChatGPT·생성AI 실무 활용',
    '조직의 AI 도입 전략',
    '데이터 기반 의사결정',
    'AI 시대 인재상과 일하는 방식',
    '어떤 주제든 괜찮아요',
  ],
  communication: [
    'MZ세대와의 소통법',
    '갈등 해소와 관계 회복',
    '피드백과 대화 스킬',
    '협업 문화 만들기',
    '어떤 주제든 괜찮아요',
  ],
  sales: [
    '고객 설득과 협상 전략',
    '디지털 마케팅 실전',
    '영업 성과 향상',
    '브랜드 스토리텔링',
    '어떤 주제든 괜찮아요',
  ],
  mental: [
    '직장 스트레스 극복',
    '회복탄력성 키우기',
    '감정 코칭과 마음챙김',
    '일과 삶의 균형',
    '어떤 주제든 괜찮아요',
  ],
  strategy: [
    '경영 전략 수립',
    '비즈니스 모델 혁신',
    '미래 산업 트렌드',
    '의사결정과 실행력',
    '어떤 주제든 괜찮아요',
  ],
  esg: [
    'ESG 경영 전략 수립',
    '기후 위기와 기업 대응',
    '사회적 가치와 지속가능성',
    'ESG 평가와 보고서',
    '어떤 주제든 괜찮아요',
  ],
  startup: [
    '창업 아이디어와 실행',
    '스타트업 성장 전략',
    '혁신적 사고와 창의성',
    '실패와 피봇의 경험',
    '어떤 주제든 괜찮아요',
  ],
  teamwork: [
    '팀빌딩과 협업 강화',
    '업무 생산성과 기획력',
    '효과적인 보고와 발표',
    '비즈니스 매너와 에티켓',
    '어떤 주제든 괜찮아요',
  ],
  self_growth: [
    '자기 브랜딩과 커리어',
    '목표 설정과 습관 형성',
    '취업·이직 전략',
    '강점 발견과 성장 마인드셋',
    '어떤 주제든 괜찮아요',
  ],
  finance: [
    '경제 흐름과 투자 인사이트',
    '재무 리터러시 기초',
    '부동산·주식 재테크',
    '글로벌 경제와 전망',
    '어떤 주제든 괜찮아요',
  ],
  humanities: [
    '인문학으로 보는 세상',
    '역사와 리더십의 교훈',
    '문화·예술과 창의적 사고',
    '라이프스타일과 행복',
    '어떤 주제든 괜찮아요',
  ],
}

// ─── Wizard Step 3: 강연 대상 ────────────────────────────────
export const WIZARD_TARGETS = [
  { id: '임원/경영진',      label: '임원 / 경영진' },
  { id: '팀장/중간관리자',  label: '팀장 / 중간 관리자' },
  { id: '전체직원',         label: '전체 직원' },
  { id: '신입/주니어',      label: '신입 / 주니어' },
  { id: '영업/마케팅팀',    label: '영업 / 마케팅 팀' },
  { id: '공공기관/공무원',  label: '공공기관 / 공무원' },
  { id: '학생/청년',        label: '학생 / 청년' },
] as const
