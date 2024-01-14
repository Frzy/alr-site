'use client'

import type { Member } from '@/types/common'
import MemberViewer from '../MemberList'

export default function RosterView({ members }: { members: Member[] }): JSX.Element {
  return <MemberViewer members={members} />
}
