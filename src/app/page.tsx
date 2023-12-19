import * as React from 'react'
import HomeView from '@/components/Views/HomeView'
import type { Metadata } from 'next'
import { getOfficers } from '@/utils'
import BaseLayout from '@/components/Views/BaseLayout'

export const metadata: Metadata = {
  title: 'ALR 91: Portal',
  description: 'American Legion Riders Chapter 91 Portal',
}

export const revalidate = 3600

export default async function HomePage(): Promise<JSX.Element> {
  const officers = await getOfficers()

  return (
    <BaseLayout>
      <HomeView officers={officers} />
    </BaseLayout>
  )
}
