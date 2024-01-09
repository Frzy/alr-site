import { ACTIVE_ROLES } from '@/utils/constants'
import { getMembersBy } from '@/lib/roster'
import * as React from 'react'
import BaseLayout from '@/components/BaseLayout'
import type { Metadata } from 'next'
import ActivityLogForm from '@/components/Activity Log/Form'

export const metadata: Metadata = {
  title: 'ALR 91: Activity Log Entry',
  description: 'American Legion Riders Chapter 91 Activity Log Entry Form',
}

export default async function ActivityLogEntryPage(): Promise<JSX.Element> {
  const members = (await getMembersBy((m) => ACTIVE_ROLES.includes(m.role))).toSorted((a, b) => {
    return a.name.localeCompare(b.name)
  })

  return (
    <BaseLayout>
      <ActivityLogForm members={members} />
    </BaseLayout>
  )
}
