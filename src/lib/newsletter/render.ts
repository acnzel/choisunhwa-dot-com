import type { NewsletterContent } from './generate'

// 메일·카톡에 붙여 넣을 내보내기 형식. 메일 클라이언트는 <style> 을 버리는 곳이 많아 인라인 스타일만 쓴다.

export function ctaUrl(siteUrl: string, draftId: string, programTitle: string) {
  const params = new URLSearchParams({ ref: `briefing-${draftId}`, topic: programTitle })
  return `${siteUrl}/inquiry/plan?${params}`
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export function renderHtml(c: NewsletterContent, comment: string, siteUrl: string, draftId: string) {
  const modules = c.modules
    .map(
      m => `<tr><td style="padding:12px 0;border-top:1px solid #eee;">
<p style="margin:0;font-size:12px;color:#888;">${m.part}부 · ${esc(m.theme)}</p>
<p style="margin:4px 0;font-size:15px;font-weight:bold;color:#1a1a2e;"><a href="${siteUrl}/speakers/${m.speaker_id}" style="color:#1a1a2e;text-decoration:none;">${esc(m.lecture_title)}</a></p>
<p style="margin:0;font-size:13px;color:#555;"><a href="${siteUrl}/speakers/${m.speaker_id}" style="color:#1a1a2e;">${esc(m.speaker_name)}</a>${m.speaker_title ? ` · ${esc(m.speaker_title)}` : ''}</p>
<p style="margin:6px 0 0;font-size:13px;color:#333;">${esc(m.connection)}</p>
</td></tr>`,
    )
    .join('\n')

  return `<div style="max-width:600px;font-family:sans-serif;line-height:1.6;color:#222;">
<ul style="padding-left:18px;margin:0 0 16px;">${c.issue_summary.map(l => `<li>${esc(l)}</li>`).join('')}</ul>
<p><strong>왜 지금인가</strong><br>${esc(c.why_now)}</p>
<div style="background:#f7f7f9;border-radius:12px;padding:16px;margin:20px 0;">
<p style="margin:0;font-size:12px;color:#888;">최선화닷컴 제안 프로그램</p>
<p style="margin:4px 0 0;font-size:18px;font-weight:bold;color:#1a1a2e;">${esc(c.program_title)}</p>
<p style="margin:4px 0 8px;font-size:13px;color:#555;">${esc(c.target)} · ${esc(c.format)}</p>
<table style="width:100%;border-collapse:collapse;">${modules}</table>
</div>
<p><strong>최선화의 한 마디</strong><br>${esc(comment).replace(/\n/g, '<br>')}</p>
<p style="margin:24px 0;"><a href="${esc(ctaUrl(siteUrl, draftId, c.program_title))}" style="display:inline-block;padding:12px 20px;background:#1a1a2e;color:#fff;border-radius:10px;text-decoration:none;font-weight:bold;">우리 회사에 맞춘 기획안 무료로 받기</a></p>
</div>`
}

export function renderText(c: NewsletterContent, comment: string, siteUrl: string, draftId: string) {
  return [
    c.subject,
    '',
    ...c.issue_summary.map(l => `- ${l}`),
    '',
    `[왜 지금인가]`,
    c.why_now,
    '',
    `[제안 프로그램] ${c.program_title}`,
    `${c.target} · ${c.format}`,
    ...c.modules.flatMap(m => [
      '',
      `${m.part}부 · ${m.theme}`,
      `${m.lecture_title} — ${m.speaker_name}${m.speaker_title ? ` (${m.speaker_title})` : ''}`,
      m.connection,
    ]),
    '',
    `[최선화의 한 마디]`,
    comment,
    '',
    `우리 회사에 맞춘 기획안 무료로 받기: ${ctaUrl(siteUrl, draftId, c.program_title)}`,
  ].join('\n')
}
