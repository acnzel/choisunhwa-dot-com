'use client'

import { useState, useTransition } from 'react'
import { toggleSpeakerBest } from '@/app/actions/admin'

interface Props {
  speakerId: string
  isBest: boolean
}

export default function ToggleBest({ speakerId, isBest }: Props) {
  const [best, setBest] = useState(isBest)
  const [isPending, startTransition] = useTransition()

  function toggle() {
    startTransition(async () => {
      const result = await toggleSpeakerBest(speakerId, !best)
      if (result.ok) setBest(!best)
    })
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      aria-label={best ? 'BEST 해제' : 'BEST 지정'}
      title={best ? 'BEST 해제' : 'BEST 지정'}
      style={{
        background: 'none', border: 'none', cursor: isPending ? 'not-allowed' : 'pointer',
        opacity: isPending ? 0.5 : 1, fontSize: '18px', lineHeight: 1,
        transition: 'opacity 0.15s, transform 0.15s',
        transform: best ? 'scale(1.15)' : 'scale(1)',
      }}
    >
      {best ? '⭐' : '☆'}
    </button>
  )
}
