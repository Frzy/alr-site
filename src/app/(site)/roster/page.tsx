import { ACTIVE_ROLES } from '@/utils/constants'
import { getMembersBy, memberToUnAuthMember } from '@/lib/member'
import { getServerAuthSession } from '@/lib/auth'
import RosterView from '@/components/Views/RosterView'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ALR 91: Roster',
  description: 'American Legion Riders Chapter 91 Roster',
}

export default async function RosterPage(): Promise<JSX.Element> {
  const session = await getServerAuthSession()
  let serverMembers = await getMembersBy((m) => ACTIVE_ROLES.includes(m.role))

  if (!session) serverMembers = serverMembers.map(memberToUnAuthMember)

  const members = serverMembers.toSorted((a, b) => a.name.localeCompare(b.name))

  return <RosterView serverMembers={members} />
}
