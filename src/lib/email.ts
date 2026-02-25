import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.EMAIL_FROM ?? 'noreply@choisunhwa.com'

// ─── 문의 접수 확인 이메일 ────────────────────────────────
export async function sendInquiryConfirmation({
  to,
  name,
  inquiryType,
}: {
  to: string
  name: string
  inquiryType: 'lecture_plan' | 'recruitment' | 'speaker_register'
}) {
  const typeLabel = {
    lecture_plan: '강연기획',
    recruitment: '강사섭외',
    speaker_register: '강사등록',
  }[inquiryType]

  return resend.emails.send({
    from: FROM,
    to,
    subject: `[최선화닷컴] ${typeLabel} 문의가 접수되었습니다`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="color: #111; margin-bottom: 8px;">문의 접수 확인</h2>
        <p style="color: #444; line-height: 1.6;">
          안녕하세요, <strong>${name}</strong>님.<br />
          <strong>${typeLabel}</strong> 문의가 정상적으로 접수되었습니다.
        </p>
        <div style="background: #f8f8f8; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <p style="margin: 0; color: #555; font-size: 14px;">
            ⏱ 영업일 기준 <strong>1~2일 이내</strong>에 담당자가 연락드리겠습니다.
          </p>
        </div>
        <p style="color: #888; font-size: 13px;">
          문의사항이 있으시면 아래로 연락해주세요.<br />
          최선화닷컴 | <a href="https://choisunhwa-dot-com.vercel.app" style="color: #555;">choisunhwa.com</a>
        </p>
      </div>
    `,
  })
}

// ─── 어드민 → 고객 처리 현황 알림 이메일 ─────────────────
export async function sendInquiryStatusUpdate({
  to,
  name,
  status,
  message,
}: {
  to: string
  name: string
  status: string
  message?: string
}) {
  const statusLabel = {
    confirmed: '확인 완료',
    processing: '처리 중',
    done: '처리 완료',
  }[status] ?? status

  return resend.emails.send({
    from: FROM,
    to,
    subject: `[최선화닷컴] 문의 처리 현황 안내 — ${statusLabel}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="color: #111; margin-bottom: 8px;">문의 처리 현황</h2>
        <p style="color: #444; line-height: 1.6;">
          안녕하세요, <strong>${name}</strong>님.<br />
          문의 처리 현황을 알려드립니다.
        </p>
        <div style="background: #f8f8f8; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <p style="margin: 0 0 8px; color: #333; font-weight: bold;">현재 상태: ${statusLabel}</p>
          ${message ? `<p style="margin: 0; color: #555; font-size: 14px;">${message}</p>` : ''}
        </div>
        <p style="color: #888; font-size: 13px;">
          최선화닷컴 | <a href="https://choisunhwa-dot-com.vercel.app" style="color: #555;">choisunhwa.com</a>
        </p>
      </div>
    `,
  })
}
