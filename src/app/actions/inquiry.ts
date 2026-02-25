'use server'

import { createClient } from '@/lib/supabase/server'
import { sendInquiryConfirmation } from '@/lib/email'
import { redirect } from 'next/navigation'
import type { InquiryType } from '@/types'

export async function submitInquiry(formData: FormData) {
  const supabase = await createClient()

  const type = formData.get('type') as InquiryType
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const company = formData.get('company') as string
  const desired_speaker = formData.get('desired_speaker') as string | null
  const lecture_date = formData.get('lecture_date') as string | null
  const attendee_count = formData.get('attendee_count')
    ? Number(formData.get('attendee_count'))
    : null
  const venue = formData.get('venue') as string | null
  const budget_range = formData.get('budget_range') as string | null
  const content = formData.get('content') as string

  const { error } = await supabase.from('inquiries').insert({
    type,
    name,
    email,
    phone,
    company,
    desired_speaker: desired_speaker || null,
    lecture_date: lecture_date || null,
    attendee_count,
    venue: venue || null,
    budget_range: budget_range || null,
    content,
    status: 'new',
  })

  if (error) {
    throw new Error('문의 접수에 실패했습니다. 잠시 후 다시 시도해주세요.')
  }

  // 이메일 발송 (오류 발생해도 계속)
  try {
    await sendInquiryConfirmation({ to: email, name, inquiryType: type })
  } catch (emailError) {
    console.error('이메일 발송 실패:', emailError)
  }

  redirect('/inquiry/success')
}

export async function submitSpeakerRegistration(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const company = formData.get('company') as string
  const lecture_topics = formData.get('lecture_topics') as string
  const lecture_history = formData.get('lecture_history') as string | null
  const content = `강연 주제: ${lecture_topics}\n\n주요 강연 이력:\n${lecture_history || '없음'}`

  const { error } = await supabase.from('inquiries').insert({
    type: 'speaker_register',
    name,
    email,
    phone,
    company,
    content,
    status: 'new',
  })

  if (error) {
    throw new Error('강사 등록 문의 접수에 실패했습니다.')
  }

  try {
    await sendInquiryConfirmation({
      to: email,
      name,
      inquiryType: 'speaker_register',
    })
  } catch (e) {
    console.error('이메일 발송 실패:', e)
  }

  redirect('/inquiry/success')
}
