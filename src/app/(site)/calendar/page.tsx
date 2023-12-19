import CalendarView from '@/components/Views/CalendarView'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ALR 91: Calendar',
  description: 'American Legion Riders Chapter 91 Calendar',
}

export default function LoginPage(): React.ReactNode {
  return <CalendarView />
}
