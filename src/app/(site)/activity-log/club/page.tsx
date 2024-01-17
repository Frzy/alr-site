import { getActivityLogStats } from '@/lib/activity.log'
import type { PageProps } from '@/types/common'
import * as React from 'react'
import ActivityLogClubView from '@/components/Views/ActivityLogClubView'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import type { Metadata } from 'next'
dayjs.extend(isBetween)

export const metadata: Metadata = {
  title: 'ALR 91: Club Activity Stats',
  description: 'American Legion Riders Chapter 91 Club Activity Log Stats',
}

export default async function ActivityLogClubPage({
  searchParams,
}: PageProps): Promise<JSX.Element> {
  const { year } = searchParams
  const fetchYear = Array.isArray(year) ? year[0] : year ?? `${dayjs().year()}`

  const startDate = dayjs(fetchYear).startOf('year')
  const endDate = dayjs(fetchYear).endOf('year')
  const stats = await getActivityLogStats((l) => dayjs(l.date).isBetween(startDate, endDate))

  return <ActivityLogClubView serverStats={stats} />
}
