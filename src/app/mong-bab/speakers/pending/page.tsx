import { redirect } from 'next/navigation'

// /mong-bab/speakers/pending → /mong-bab/speaker-applications
export default function PendingRedirect() {
  redirect('/mong-bab/speaker-applications')
}
