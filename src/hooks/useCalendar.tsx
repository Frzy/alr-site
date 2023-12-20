'use client'

import React from 'react'
import dayjs, { type Dayjs } from 'dayjs'
import { usePathname, useRouter } from 'next/navigation'
import isBetween from 'dayjs/plugin/isBetween'

dayjs.extend(isBetween)

interface CalendarContextProps {
  date: Dayjs
  setDate: (date: Dayjs) => void
}

const CalendarContext = React.createContext<CalendarContextProps | null>(null)

export default function CalendarProvider({
  children,
  date: initDate,
}: {
  date: Dayjs
  children: React.ReactNode
}): JSX.Element {
  const [date, setDate] = React.useState<Dayjs>(initDate)
  const pathname = usePathname()
  const router = useRouter()
  function handleSetDate(newDate: Dayjs): void {
    if (date.isSame(newDate, 'day')) return

    const queryParams = new URLSearchParams({ date: newDate.format('M/D/YYYY') })
    router.push(`${pathname}?${queryParams.toString()}`)

    setDate(newDate)
  }

  React.useEffect(() => {
    setDate(initDate)
  }, [initDate])

  return (
    <CalendarContext.Provider value={{ date, setDate: handleSetDate }}>
      {children}
    </CalendarContext.Provider>
  )
}

export function useCalendar(): CalendarContextProps {
  const context = React.useContext(CalendarContext)

  if (context === null) {
    throw new Error('useCalendar must be used within a CalendarProvider')
  }

  return context
}
