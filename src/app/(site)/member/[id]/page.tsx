import BaseLayout from '@/components/BaseLayout'
import MemberNotFound from '@/components/Views/MemberNotFound'
import MemberView from '@/components/Views/MemberView'
import { getActivityLogEntries } from '@/lib/activity.log'
import { getServerAuthSession } from '@/lib/auth'
import { findMember, memberToUnAuthMember } from '@/lib/member'
import type { PageProps } from '@/types/common'
import type { Metadata, ResolvingMetadata } from 'next'

export async function generateMetadata(
  { params, searchParams }: PageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { id } = params
  const severMember = await findMember((m) => m.id === id)

  if (severMember) {
    return {
      title: `ALR 91: ${severMember.name}`,
      description: `American Legion Riders Chapter 91 ${severMember.name} membership page`,
    }
  }

  return {
    title: `ALR 91: No Member Found`,
    description: `American Legion Riders Chapter 91 no mamber found`,
  }
}

export default async function MemberPage({ params }: PageProps): Promise<JSX.Element> {
  const { id } = params
  const session = await getServerAuthSession()
  let severMember = await findMember((m) => m.id === id)

  if (!session && severMember) {
    severMember = memberToUnAuthMember(severMember)
  }

  if (severMember) {
    const isViewingOwnProfile = session?.user.id === id
    const isAdmin = session?.user.isAdmin ?? false
    const name = `${severMember.lastName}, ${severMember.firstName}${
      severMember.suffix ? ` ${severMember.suffix}` : ''
    }`
    const logs = await getActivityLogEntries((log) => {
      return log.name === name
    })

    return (
      <BaseLayout title={`${severMember.name} (${severMember.role})`}>
        <MemberView
          severMember={severMember}
          isViewingOwnProfile={isViewingOwnProfile}
          isMember={!!session?.user}
          isAdmin={isAdmin}
          logs={logs}
        />
      </BaseLayout>
    )
  }

  return (
    <BaseLayout title='Member not found'>
      <MemberNotFound />
    </BaseLayout>
  )
}
