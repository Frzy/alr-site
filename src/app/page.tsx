import * as React from 'react'
import HomeView from '@/component/Views/HomeView'
import type { Metadata } from 'next'
import { getOfficers } from '@/utils'

export const metadata: Metadata = {
  title: 'ALR 91: Portal',
  description: 'American Legion Riders Chapter 91 Portal',
}

export const revalidate = 3600

export default async function HomePage(): Promise<JSX.Element> {
  const officers = await getOfficers()

  return <HomeView officers={officers} />
}
