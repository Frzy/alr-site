import type { ICalendarEvent } from '@/types/common'
import AllDayEvent from '../AllDayEvent'
import { type Dayjs } from 'dayjs'

interface WeekAllDayEventProps {
  startDate: Dayjs
  endDate: Dayjs
  event: ICalendarEvent
  dayOfWeek: number
}

export default function WeekAllDayEvent({
  dayOfWeek,
  endDate,
  event,
  startDate,
}: WeekAllDayEventProps): JSX.Element {
  return (
    <AllDayEvent
      event={event}
      hasRightArrow={dayOfWeek === 6 && event.endDate.isAfter(endDate)}
      hasLeftArrow={dayOfWeek === 0 && event.startDate.isBefore(startDate)}
      dragOptions={{ id: event.id, data: { allDayEvent: true } }}
      sx={{ mb: 0.25 }}
      draggable
    />
  )
}
