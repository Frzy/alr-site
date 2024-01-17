'use client'

import { mapToClientMember } from '@/utils/member'
import * as React from 'react'
import ActivityLogForm from '@/components/Activity Log/Form'
import BaseLayout from '@/components/BaseLayout'
import type { ServerMember } from '@/types/common'

export default function ActivityLogFormView({
  serverMembers = [],
  activityName,
  date,
  activityType,
  hours,
  miles,
  fromCalendar,
}: {
  serverMembers: ServerMember[]
  activityName?: string
  date?: string
  activityType?: string
  hours?: number
  miles?: number
  fromCalendar?: boolean
}): JSX.Element {
  const members = serverMembers.map(mapToClientMember)

  return (
    <BaseLayout title='Activity Log Submission Form'>
      <ActivityLogForm
        members={members}
        activityName={activityName}
        date={date}
        activityType={activityType}
        hours={hours}
        miles={miles}
        fromCalendar={fromCalendar}
      />
    </BaseLayout>
  )
}
