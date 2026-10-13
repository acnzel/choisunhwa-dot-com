// 계절 트리거: 뉴스가 없어도 매년 같은 시기에 교육 수요가 생기는 이슈.
// fields 는 speakers.fields 값과 같은 어휘를 쓴다.
export interface SeasonTrigger {
  key: string
  months: number[] // 1~12. 이 달에 어드민 화면에 노출한다
  title: string
  description: string
  fields: string[]
}

export const SEASON_TRIGGERS: SeasonTrigger[] = [
  {
    key: 'onboarding',
    months: [1, 2, 3],
    title: '신입사원 입사 시즌',
    description: '신입·경력 입사자가 몰리는 시기. 조직 적응과 일하는 방식 교육 수요가 생긴다.',
    fields: ['업무스킬', '소통', '자기계발'],
  },
  {
    key: 'new-leaders',
    months: [1, 2, 3],
    title: '신임 팀장 승진 시즌',
    description: '정기 인사 직후 처음 팀장이 된 사람들이 생긴다. 리더 전환 교육 수요가 생긴다.',
    fields: ['리더십', 'HR', '소통'],
  },
  {
    key: 'mandatory-h1',
    months: [4, 5, 6],
    title: '법정의무교육 상반기 실시',
    description: '연 1회 이상 해야 하는 법정의무교육을 상반기에 몰아서 처리하려는 수요.',
    fields: ['법정필수'],
  },
  {
    key: 'midyear-review',
    months: [6, 7],
    title: '상반기 성과 리뷰와 하반기 동기부여',
    description: '상반기 평가 직후 조직 분위기를 다시 끌어올리는 교육 수요.',
    fields: ['동기부여', '리더십', '심리'],
  },
  {
    key: 'mandatory-deadline',
    months: [10, 11],
    title: '법정의무교육 연말 마감',
    description: '올해 법정의무교육을 아직 못 한 회사가 연말 전에 서둘러 처리하려는 수요.',
    fields: ['법정필수'],
  },
  {
    key: 'year-end',
    months: [11, 12],
    title: '송년 특강과 내년 준비',
    description: '송년회·종무식 특강, 내년 트렌드 전망 강연 수요.',
    fields: ['경제', '인문학', '힐링', '동기부여'],
  },
]

export function seasonTriggersFor(month: number): SeasonTrigger[] {
  return SEASON_TRIGGERS.filter(t => t.months.includes(month))
}
