import MonthView from '@/components/Calendar/Month/View'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ALR 91: Month Calendar',
  description: 'American Legion Riders Chapter 91 Month Calendar',
}

export default function CalendarMonthPage(): JSX.Element {
  return <MonthView />
}
