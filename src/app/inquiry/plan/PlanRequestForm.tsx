'use client'

import { useActionState } from 'react'
import { submitPlanRequest } from '@/app/actions/inquiry'
import { WIZARD_TARGETS } from '@/constants/matching'

const initialState = { error: '' }

const inputClass =
  'w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a1a2e] bg-white'

export default function PlanRequestForm() {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      try {
        await submitPlanRequest(formData)
        return { error: '' }
      } catch (e) {
        return { error: e instanceof Error ? e.message : '오류가 발생했습니다.' }
      }
    },
    initialState
  )

  return (
    <form action={formAction} className="space-y-6">
      {/* 기획안 3문항: 인원 · 대상 · 고민 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            교육 인원 *
          </label>
          <input type="number" name="attendee_count" required min={1} placeholder="50" className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            교육 대상 *
          </label>
          <select name="target" required defaultValue="" className={inputClass}>
            <option value="" disabled>선택해주세요</option>
            {WIZARD_TARGETS.map(({ id, label }) => (
              <option key={id} value={label}>
                {label}
              </option>
            ))}
            <option value="기타">기타 (고민란에 적어주세요)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          요즘 조직의 고민 *
        </label>
        <textarea
          name="concern"
          required
          minLength={10}
          maxLength={1000}
          rows={5}
          placeholder="예: 신임 팀장들이 팀원 면담을 어려워합니다. 연말 전에 한 번 교육을 하고 싶은데 어떤 주제가 맞을지 모르겠어요."
          className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a1a2e] bg-white resize-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            담당자 이름 *
          </label>
          <input type="text" name="name" required maxLength={50} placeholder="홍길동" className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            회사명 *
          </label>
          <input type="text" name="company" required maxLength={100} placeholder="(주)회사명" className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            기획안 받을 이메일 *
          </label>
          <input type="email" name="email" required placeholder="example@company.com" className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            연락처 *
          </label>
          <input type="tel" name="phone" required placeholder="010-0000-0000" pattern="[0-9\-]+" className={inputClass} />
        </div>
      </div>

      {/* 개인정보 동의 */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" name="privacy_agree" required className="mt-0.5 accent-[#1a1a2e]" />
          <p className="text-xs text-gray-600 leading-relaxed">
            <strong className="text-gray-800">개인정보 수집 및 이용 동의 (필수)</strong>
            <br />
            수집 항목: 이름, 이메일, 연락처, 회사명, 교육 인원·대상·고민. 이용 목적: 교육 기획안 작성 및 회신.
            보유 기간: 요청 처리 완료 후 1년. 동의를 거부할 권리가 있으나 서비스 이용이 제한됩니다.
          </p>
        </label>
      </div>

      {state.error && (
        <p className="text-sm text-red-500 bg-red-50 rounded-xl p-3">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full py-3 bg-[#1a1a2e] text-white text-sm font-semibold rounded-xl hover:bg-[#16213e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {pending ? '제출 중...' : '기획안 무료로 신청하기'}
      </button>
    </form>
  )
}
