import { ACTIVE_ROLES } from '@/utils/constants'
import { getMembersBy, memberToUnAuthMember } from '@/lib/member'
import { getServerAuthSession } from '@/lib/auth'
import BaseLayout from '@/components/BaseLayout'
import RosterView from '@/components/Views/RosterView'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ALR 91: Roster',
  description: 'American Legion Riders Chapter 91 Roster',
}

export default async function RosterPage(): Promise<JSX.Element> {
  const session = await getServerAuthSession()
  const members = await getMembersBy((m) => ACTIVE_ROLES.includes(m.role))

  members.sort((a, b) => a.name.localeCompare(b.name))

  return (
    <BaseLayout title='ALR 91 Roster'>
      <RosterView members={session ? members : members.map(memberToUnAuthMember)} />
    </BaseLayout>
  )
}
