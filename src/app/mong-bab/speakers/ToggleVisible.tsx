'use client'

import { useState, useTransition } from 'react'
import { toggleSpeakerVisibility } from '@/app/actions/admin'

interface Props {
  speakerId: string
  isVisible: boolean
}

export default function ToggleVisible({ speakerId, isVisible }: Props) {
  const [visible, setVisible] = useState(isVisible)
  const [isPending, startTransition] = useTransition()

  function toggle() {
    startTransition(async () => {
      const result = await toggleSpeakerVisibility(speakerId, !visible)
      if (result.ok) setVisible(!visible)
    })
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      aria-label={visible ? '공개 → 비공개' : '비공개 → 공개'}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${visible ? 'bg-green-500' : 'bg-gray-200'}`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
          visible ? 'translate-x-4' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}
