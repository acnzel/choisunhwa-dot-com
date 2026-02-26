'use client'

import { useActionState } from 'react'
import { submitInquiry } from '@/app/actions/inquiry'
import { BUDGET_RANGES } from '@/constants'

interface Props {
  defaultSpeaker?: string
  defaultLecture?: string
  defaultName?: string    // F-4: 로그인 시 자동 채움
  defaultEmail?: string   // F-4: 로그인 시 자동 채움
}

const initialState = { error: '' }

export default function InquiryForm({ defaultSpeaker = '', defaultLecture = '', defaultName = '', defaultEmail = '' }: Props) {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      try {
        await submitInquiry(formData)
        return { error: '' }
      } catch (e) {
        return { error: e instanceof Error ? e.message : '오류가 발생했습니다.' }
      }
    },
    initialState
  )

  return (
    <form action={formAction} className="space-y-6">
      {/* 문의 유형 */}
      <fieldset>
        <legend className="text-sm font-semibold text-[#1a1a2e] mb-3">문의 유형 *</legend>
        <div className="flex gap-4">
          {[
            { value: 'lecture_plan', label: '강연기획' },
            { value: 'recruitment', label: '강사섭외' },
          ].map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                value={value}
                defaultChecked={value === 'recruitment' && !!defaultSpeaker || value === 'lecture_plan'}
                className="accent-[#1a1a2e]"
                required
              />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 담당자 이름 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            담당자 이름 *
          </label>
          <input
            type="text"
            name="name"
            required
            maxLength={50}
            placeholder="홍길동"
            defaultValue={defaultName}
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a1a2e] bg-white"
          />
        </div>

        {/* 연락처 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            연락처 *
          </label>
          <input
            type="tel"
            name="phone"
            required
            placeholder="010-0000-0000"
            pattern="[0-9\-]+"
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a1a2e] bg-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 이메일 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            이메일 *
          </label>
          <input
            type="email"
            name="email"
            required
            placeholder="example@company.com"
            defaultValue={defaultEmail}
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a1a2e] bg-white"
          />
        </div>

        {/* 소속 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            소속 기관/회사명 *
          </label>
          <input
            type="text"
            name="company"
            required
            placeholder="(주)회사명"
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a1a2e] bg-white"
          />
        </div>
      </div>

      {/* 원하는 강사 또는 분야 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          원하는 강사 또는 분야 <span className="text-gray-400 font-normal">(선택)</span>
        </label>
        <input
          type="text"
          name="desired_speaker"
          defaultValue={defaultSpeaker || defaultLecture}
          placeholder="예: 리더십, 마케팅, 홍길동 강사"
          className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a1a2e] bg-white"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* 강연 예정일 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            강연 예정일 <span className="text-gray-400 font-normal">(선택)</span>
          </label>
          <input
            type="date"
            name="lecture_date"
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a1a2e] bg-white"
          />
        </div>

        {/* 예상 인원 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            예상 인원 <span className="text-gray-400 font-normal">(선택)</span>
          </label>
          <input
            type="number"
            name="attendee_count"
            min={1}
            placeholder="50"
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a1a2e] bg-white"
          />
        </div>

        {/* 예산 범위 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            예산 범위 <span className="text-gray-400 font-normal">(선택)</span>
          </label>
          <select
            name="budget_range"
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a1a2e] bg-white"
          >
            <option value="">선택 안함</option>
            {BUDGET_RANGES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 강연 장소 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          강연 장소 <span className="text-gray-400 font-normal">(선택)</span>
        </label>
        <input
          type="text"
          name="venue"
          placeholder="예: 본사 대강당, 외부 행사장"
          className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a1a2e] bg-white"
        />
      </div>

      {/* 문의 내용 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          문의 내용 *
        </label>
        <CharCountTextarea
          name="content"
          required
          maxLength={1000}
          rows={5}
          placeholder="강연의 목적, 대상, 기대하는 내용 등을 자유롭게 작성해주세요."
        />
      </div>

      {/* 개인정보 동의 */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="privacy_agree"
            required
            className="mt-0.5 accent-[#1a1a2e]"
          />
          <p className="text-xs text-gray-600 leading-relaxed">
            <strong className="text-gray-800">개인정보 수집 및 이용 동의 (필수)</strong>
            <br />
            수집 항목: 이름, 이메일, 연락처, 소속. 이용 목적: 강연 문의 처리 및 답변.
            보유 기간: 문의 처리 완료 후 1년. 동의를 거부할 권리가 있으나 서비스 이용이 제한됩니다.
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
        {pending ? '제출 중...' : '문의 접수하기'}
      </button>
    </form>
  )
}

function CharCountTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { maxLength: number }) {
  const { maxLength, ...rest } = props
  return (
    <div className="relative">
      <textarea
        {...rest}
        maxLength={maxLength}
        className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a1a2e] bg-white resize-none"
        onChange={(e) => {
          const counter = e.currentTarget.nextElementSibling as HTMLElement
          if (counter) counter.textContent = `${e.currentTarget.value.length} / ${maxLength}`
        }}
      />
      <span className="absolute bottom-3 right-4 text-xs text-gray-400">0 / {maxLength}</span>
    </div>
  )
}
