import type { BadgeTone } from '@/components/admin/AdminList'

export type ApplicationStatus = 'pending' | 'approved' | 'rejected'

export interface Application {
  id: string
  name: string
  email: string
  phone?: string
  title?: string
  company?: string
  fields: string[]
  bio_short?: string
  bio_full?: string
  lecture_topics?: string
  career?: string
  education?: string
  photo_url?: string
  youtube_url?: string
  fee_range?: string
  status: ApplicationStatus
  admin_note?: string
  reviewed_at?: string
  /** 승인 시 등록된 강사. 강사를 지우면 null */
  speaker_id?: string | null
  created_at: string
}

export const APPLICATION_STATUS: Record<ApplicationStatus, { label: string; tone: BadgeTone }> = {
  pending: { label: '검토 대기', tone: 'yellow' },
  approved: { label: '승인', tone: 'green' },
  rejected: { label: '거절', tone: 'red' },
}
