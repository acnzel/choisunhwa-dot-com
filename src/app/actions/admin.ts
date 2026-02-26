'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ─── 강사 ──────────────────────────────────────────────

export async function toggleSpeakerVisibility(speakerId: string, isVisible: boolean) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('speakers')
    .update({ is_visible: isVisible })
    .eq('id', speakerId)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/mong-bab/speakers')
  revalidatePath('/speakers')
  return { ok: true }
}

export async function upsertSpeaker(formData: FormData) {
  const supabase = createAdminClient()

  const id = formData.get('id') as string | null
  const name = formData.get('name') as string
  const title = (formData.get('title') as string) || ''
  const company = (formData.get('company') as string) || ''
  const bio_short = (formData.get('bio_short') as string) || ''
  const bio_full = (formData.get('bio_full') as string) || ''
  const photo_url = (formData.get('photo_url') as string) || null
  const fee_range = (formData.get('fee_range') as string) || null
  const sort_order = parseInt((formData.get('sort_order') as string) || '0', 10)
  const is_visible = formData.get('is_visible') === 'true'

  // 배열 파싱
  const fields = formData.getAll('fields') as string[]

  // media_links — textarea에서 줄바꿈으로 구분
  const mediaRaw = (formData.get('media_links') as string) || ''
  const media_links = mediaRaw.split('\n').map(s => s.trim()).filter(Boolean)

  const newsRaw = (formData.get('news_links') as string) || ''
  const news_links = newsRaw.split('\n').map(s => s.trim()).filter(Boolean)

  // careers — JSON 형태로 전달
  let careers: { year: string; content: string }[] = []
  try {
    careers = JSON.parse((formData.get('careers_json') as string) || '[]')
  } catch { /* ignore */ }

  let lecture_histories: { org_name: string; logo_url?: string }[] = []
  try {
    lecture_histories = JSON.parse((formData.get('lecture_histories_json') as string) || '[]')
  } catch { /* ignore */ }

  const payload = {
    name, title, company, bio_short, bio_full, photo_url,
    fee_range: fee_range || null,
    sort_order, is_visible, fields, media_links, news_links,
    careers, lecture_histories,
  }

  let speakerId = id

  if (id) {
    const { error } = await supabase.from('speakers').update(payload).eq('id', id)
    if (error) throw new Error(error.message)
  } else {
    const { data, error } = await supabase.from('speakers').insert(payload).select('id').single()
    if (error) throw new Error(error.message)
    speakerId = data.id
  }

  revalidatePath('/mong-bab/speakers')
  revalidatePath('/speakers')
  redirect(`/mong-bab/speakers/${speakerId}?saved=1`)
}

export async function deleteSpeaker(speakerId: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('speakers').delete().eq('id', speakerId)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/mong-bab/speakers')
  revalidatePath('/speakers')
  return { ok: true }
}

// ─── 강연 ──────────────────────────────────────────────

export async function toggleLectureVisibility(lectureId: string, isVisible: boolean) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('lectures')
    .update({ is_visible: isVisible })
    .eq('id', lectureId)

  if (error) return { ok: false, error: error.message }
  revalidatePath('/mong-bab/lectures')
  revalidatePath('/lectures')
  return { ok: true }
}

export async function upsertLecture(formData: FormData) {
  const supabase = createAdminClient()

  const id = formData.get('id') as string | null
  const speaker_id = formData.get('speaker_id') as string
  const title = formData.get('title') as string
  const thumbnail_url = (formData.get('thumbnail_url') as string) || null
  const duration = (formData.get('duration') as string) || '2h'
  const target = (formData.get('target') as string) || ''
  const summary = (formData.get('summary') as string) || ''
  const is_visible = formData.get('is_visible') === 'true'
  const fields = formData.getAll('fields') as string[]

  const goalsRaw = (formData.get('goals') as string) || ''
  const goals = goalsRaw.split('\n').map(s => s.trim()).filter(Boolean)

  const effectsRaw = (formData.get('effects') as string) || ''
  const effects = effectsRaw.split('\n').map(s => s.trim()).filter(Boolean)

  let program: { time: string; content: string }[] = []
  try {
    program = JSON.parse((formData.get('program_json') as string) || '[]')
  } catch { /* ignore */ }

  const payload = { speaker_id, title, thumbnail_url, duration, target, summary, is_visible, fields, goals, effects, program }

  let lectureId = id

  if (id) {
    const { error } = await supabase.from('lectures').update(payload).eq('id', id)
    if (error) throw new Error(error.message)
  } else {
    const { data, error } = await supabase.from('lectures').insert(payload).select('id').single()
    if (error) throw new Error(error.message)
    lectureId = data.id
  }

  revalidatePath('/mong-bab/lectures')
  revalidatePath('/lectures')
  redirect(`/mong-bab/lectures/${lectureId}?saved=1`)
}

// ─── 문의 상태 변경 ──────────────────────────────────────

export async function updateInquiryStatus(inquiryId: string, status: string) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('inquiries')
    .update({ status })
    .eq('id', inquiryId)

  if (error) return { ok: false, error: error.message }
  revalidatePath('/mong-bab/inquiries')
  return { ok: true }
}
