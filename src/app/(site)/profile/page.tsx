import { getServerAuthSession } from '@/lib/auth'
import NotLoggedInView from '@/components/Views/NotLoggedInView'
import ProfileView from '@/components/Views/ProfileView'
import type { Metadata, ResolvingMetadata } from 'next'
import type { PageProps } from '@/types/common'
import { getActivityLogEntries } from '@/lib/activity.log'
import BaseLayout from '@/components/BaseLayout'
import { findMember } from '@/lib/member'

export async function generateMetadata(
  { params, searchParams }: PageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const authSession = await getServerAuthSession()
  const user = authSession?.user

  return {
    title: `ALR 91 Profile${user ? `: ${user.name}` : ''}`,
    description: 'American Legion Riders Chapter 91 Profile',
  }
}

export default async function ProfilePage(): Promise<JSX.Element> {
  const session = await getServerAuthSession()
  const user = session ? await findMember((m) => m.id === session?.user.id) : null

  if (session && user) {
    const name = `${user.lastName}, ${user.firstName}${user.suffix ? ` ${user.suffix}` : ''}`
    const logs = await getActivityLogEntries((log) => {
      return log.name === name
    })

    return (
      <BaseLayout title={`ALR 91 Profile${user ? `: ${user.name}` : ''}`}>
        <ProfileView severMember={user} logs={logs} title={`${user.name}'s Profile`} />
      </BaseLayout>
    )
  }

  return (
    <BaseLayout title='Unauthenticated'>
      <NotLoggedInView />
    </BaseLayout>
  )
}
