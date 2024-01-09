import * as React from 'react'
import HomeView from '@/components/Views/HomeView'
import type { Metadata } from 'next'
import BaseLayout from '@/components/BaseLayout'
import dayjs from 'dayjs'
import { getCalendarEvents } from '@/lib/calendar'
import { mapGoogleToServer } from '@/utils/calendar'

export const metadata: Metadata = {
  title: 'ALR 91: Portal',
  description: 'American Legion Riders Chapter 91 Portal',
}

export const revalidate = 3600

export default async function HomePage(): Promise<JSX.Element> {
  const date = dayjs()

  const googleEvents = await getCalendarEvents({
    timeMin: date.startOf('day').format(),
    timeMax: date.add(1, 'week').endOf('day').format(),
    orderBy: 'startTime',
    singleEvents: true,
  })
  const events = googleEvents.map(mapGoogleToServer)

  return (
    <BaseLayout>
      <HomeView events={events} />
    </BaseLayout>
  )
}
