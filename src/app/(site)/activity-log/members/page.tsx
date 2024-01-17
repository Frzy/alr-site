import { type PageProps } from '@/types/common'
import * as React from 'react'
import type { Metadata } from 'next'
import ActivityLogMemberView from '@/components/Views/ActivityLogMemberView'

export const metadata: Metadata = {
  title: 'ALR 91: Member Activity Stats',
  description: 'American Legion Riders Chapter 91 Member Activity Stats',
}

export default async function ActivityLogClubPage({
  searchParams,
}: PageProps): Promise<JSX.Element> {
  return <ActivityLogMemberView />
}
