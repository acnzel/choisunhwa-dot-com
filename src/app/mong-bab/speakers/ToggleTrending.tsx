'use client'

import { useState, useTransition } from 'react'
import { toggleSpeakerTrending } from '@/app/actions/admin'

interface Props {
  speakerId: string
  isTrending: boolean
}

export default function ToggleTrending({ speakerId, isTrending }: Props) {
  const [trending, setTrending] = useState(isTrending)
  const [isPending, startTransition] = useTransition()

  function toggle() {
    startTransition(async () => {
      const result = await toggleSpeakerTrending(speakerId, !trending)
      if (result.ok) setTrending(!trending)
    })
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      aria-label={trending ? '지금 뜨는 해제' : '지금 뜨는 지정'}
      title={trending ? '지금 뜨는 해제' : '지금 뜨는 지정'}
      style={{
        background: 'none', border: 'none', cursor: isPending ? 'not-allowed' : 'pointer',
        opacity: isPending ? 0.5 : 1, fontSize: '18px', lineHeight: 1,
        transition: 'opacity 0.15s, transform 0.15s',
        transform: trending ? 'scale(1.15)' : 'scale(1)',
      }}
    >
      {trending ? '🔥' : '🌑'}
    </button>
  )
}
