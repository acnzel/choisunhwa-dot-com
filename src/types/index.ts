// ============================================================
// 최선화닷컴 — 공통 타입 정의
// ============================================================

// ─── 사용자 ──────────────────────────────────────────────────
export type AuthProvider = 'email' | 'google'
export type UserStatus = 'active' | 'inactive' | 'unverified'

export interface User {
  id: string
  email: string
  name: string
  provider: AuthProvider
  status: UserStatus
  email_verified_at: string | null
  marketing_agreed: boolean
  created_at: string
  last_login_at: string | null
}

// ─── 강사 ──────────────────────────────────────────────────
export type FeeRange = 'under_100' | '100_300' | 'over_300'
export type SpeakerStatus = 'visible' | 'hidden' | 'reviewing'

export interface SpeakerCareer {
  year: string
  content: string
}

export interface SpeakerLectureHistory {
  org_name: string
  logo_url?: string
}

export interface Speaker {
  id: string
  name: string
  title: string
  company: string
  photo_url: string | null
  bio_short: string
  bio_full: string
  fields: string[]
  fee_range: FeeRange | null
  is_visible: boolean
  sort_order: number
  careers: SpeakerCareer[]
  lecture_histories: SpeakerLectureHistory[]
  media_links: string[]
  news_links: string[]
  created_at: string
}

// ─── 강연 ──────────────────────────────────────────────────
export type LectureDuration = '1h' | '2h' | 'half_day' | 'full_day'

export interface LectureProgramItem {
  time: string
  content: string
}

export interface Lecture {
  id: string
  speaker_id: string
  speaker?: Speaker
  title: string
  thumbnail_url: string | null
  fields: string[]
  duration: LectureDuration
  target: string
  summary: string
  goals: string[]
  program: LectureProgramItem[]
  effects: string[]
  content_json: object | null
  is_visible: boolean
  created_at: string
}

// ─── 문의 ──────────────────────────────────────────────────
export type InquiryType = 'lecture_plan' | 'recruitment' | 'speaker_register'
export type InquiryStatus = 'new' | 'confirmed' | 'processing' | 'done'

export interface Inquiry {
  id: string
  type: InquiryType
  name: string
  email: string
  phone: string
  company: string
  desired_speaker?: string
  lecture_date?: string
  attendee_count?: number
  venue?: string
  budget_range?: string
  content: string
  file_url?: string
  status: InquiryStatus
  assigned_admin_id?: string
  created_at: string
}

export interface InquiryMemo {
  id: string
  inquiry_id: string
  admin_id: string
  admin_name: string
  content: string
  created_at: string
}

// ─── FAQ ──────────────────────────────────────────────────
export interface FaqCategory {
  id: string
  name: string
  sort_order: number
}

export interface Faq {
  id: string
  category_id: string
  category?: FaqCategory
  question: string
  answer: string
  is_visible: boolean
  sort_order: number
}

// ─── 공지사항 ─────────────────────────────────────────────
export interface Notice {
  id: string
  title: string
  content: string
  is_pinned: boolean
  is_visible: boolean
  published_at: string
  created_at: string
}

// ─── 공통 ────────────────────────────────────────────────
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ApiResponse<T> {
  data: T
  meta?: PaginationMeta
  error?: string
}
