import { ACTIVE_ROLES, type ACTIVITY_TYPE, ACTIVITY_TYPES } from '@/utils/constants'
import { getMembersBy } from '@/lib/member'
import * as React from 'react'
import BaseLayout from '@/components/BaseLayout'
import type { Metadata } from 'next'
import ActivityLogForm from '@/components/Activity Log/Form'
import dayjs from 'dayjs'

export const metadata: Metadata = {
  title: 'ALR 91: Activity Log Entry',
  description: 'American Legion Riders Chapter 91 Activity Log Entry Form',
}

export default async function ActivityLogEntryPage({
  searchParams,
}: {
  searchParams: Partial<Record<'name' | 'date' | 'type' | 'hours' | 'miles' | 'calendar', string>>
}): Promise<JSX.Element> {
  const {
    name,
    date: dateString,
    type: typeStr,
    hours: hourStr,
    miles: mileStr,
    calendar,
  } = searchParams

  const members = (await getMembersBy((m) => ACTIVE_ROLES.includes(m.role))).toSorted((a, b) => {
    return a.name.localeCompare(b.name)
  })

  const date = dayjs(dateString)
  const type =
    (`${typeStr?.charAt(0).toUpperCase()}${typeStr?.slice(1)}` as ACTIVITY_TYPE) ?? undefined
  const hours = hourStr ? parseFloat(hourStr) : undefined
  const miles = mileStr ? parseFloat(mileStr) : undefined

  return (
    <BaseLayout>
      <ActivityLogForm
        members={members}
        activityName={name}
        date={date.isValid() ? date.format() : undefined}
        activityType={ACTIVITY_TYPES.includes(type) ? type : undefined}
        hours={hours ? (!isNaN(hours) && hours >= 0 ? hours : undefined) : undefined}
        miles={miles ? (!isNaN(miles) && miles >= 0 ? miles : undefined) : undefined}
        fromCalendar={calendar === 'true'}
      />
    </BaseLayout>
  )
}
