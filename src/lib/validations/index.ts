import { z } from 'zod'

// ─── 문의 폼 ──────────────────────────────────────────────
export const InquiryFormSchema = z.object({
  type: z.enum(['lecture_plan', 'recruitment', 'speaker_register']),
  name: z.string().min(1, '이름을 입력해주세요').max(50),
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  phone: z
    .string()
    .min(1, '연락처를 입력해주세요')
    .regex(/^[0-9\-+\s]+$/, '올바른 연락처 형식이 아닙니다'),
  company: z.string().max(100).optional().default(''),
  desired_speaker: z.string().max(200).optional(),
  lecture_date: z.string().optional(),
  attendee_count: z.number().int().positive().optional(),
  venue: z.string().max(200).optional(),
  budget_range: z.string().optional(),
  content: z.string().min(10, '내용을 10자 이상 입력해주세요').max(1000),
  file_url: z.string().url().optional(),
})

export type InquiryFormInput = z.infer<typeof InquiryFormSchema>

// ─── 회원 가입 ────────────────────────────────────────────
export const SignupSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  password: z
    .string()
    .min(8, '비밀번호는 8자 이상이어야 합니다')
    .regex(
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
      '영문, 숫자, 특수문자를 각 1개 이상 포함해야 합니다'
    ),
  name: z.string().min(1, '이름을 입력해주세요').max(20),
  marketing_agreed: z.boolean().default(false),
})

export type SignupInput = z.infer<typeof SignupSchema>

// ─── 강사 관리 (어드민) ──────────────────────────────────
export const SpeakerSchema = z.object({
  name: z.string().min(1).max(50),
  title: z.string().max(100).default(''),
  company: z.string().max(100).default(''),
  bio_short: z.string().max(100).default(''),
  bio_full: z.string().default(''),
  fields: z.array(z.string()).default([]),
  fee_range: z.enum(['under_100', '100_300', 'over_300']).nullable().optional(),
  careers: z
    .array(z.object({ year: z.string(), content: z.string() }))
    .default([]),
  lecture_histories: z
    .array(z.object({ org_name: z.string(), logo_url: z.string().optional() }))
    .default([]),
  media_links: z.array(z.string().url()).default([]),
  news_links: z.array(z.string().url()).default([]),
  photo_url: z.string().url().nullable().optional(),
  is_visible: z.boolean().default(false),
  sort_order: z.number().int().default(0),
})

export type SpeakerInput = z.infer<typeof SpeakerSchema>

// ─── 강연 관리 (어드민) ──────────────────────────────────
export const LectureSchema = z.object({
  speaker_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  thumbnail_url: z.string().url().nullable().optional(),
  fields: z.array(z.string()).default([]),
  duration: z.enum(['1h', '2h', 'half_day', 'full_day']).default('2h'),
  target: z.string().max(200).default(''),
  summary: z.string().max(100).default(''),
  goals: z.array(z.string()).default([]),
  program: z
    .array(z.object({ time: z.string(), content: z.string() }))
    .default([]),
  effects: z.array(z.string()).default([]),
  content_json: z.record(z.string(), z.unknown()).nullable().optional(),
  is_visible: z.boolean().default(false),
})

export type LectureInput = z.infer<typeof LectureSchema>

// ─── FAQ (어드민) ─────────────────────────────────────────
export const FaqSchema = z.object({
  category_id: z.string().uuid().nullable().optional(),
  question: z.string().min(1).max(300),
  answer: z.string().min(1),
  is_visible: z.boolean().default(true),
  sort_order: z.number().int().default(0),
})

export type FaqInput = z.infer<typeof FaqSchema>

// ─── 공지사항 (어드민) ───────────────────────────────────
export const NoticeSchema = z.object({
  title: z.string().min(1).max(300),
  content: z.string().min(1),
  is_pinned: z.boolean().default(false),
  is_visible: z.boolean().default(true),
  published_at: z.string().datetime().optional(),
})

export type NoticeInput = z.infer<typeof NoticeSchema>

// ─── 메모 (어드민) ───────────────────────────────────────
export const MemoSchema = z.object({
  content: z.string().min(1).max(1000),
  admin_name: z.string().min(1).max(50),
})

export type MemoInput = z.infer<typeof MemoSchema>
