'use client'

import type { ServerMember } from '@/types/common'
import MemberViewer from '../MemberList'
import { mapToClientMember } from '@/utils/member'

export default function RosterView({
  serverMembers = [],
}: {
  serverMembers: ServerMember[]
}): JSX.Element {
  const members = serverMembers.map(mapToClientMember)

  return <MemberViewer members={members} />
}
