import type { ICalendarEvent, IServerCalendarEvent } from '@/types/common'
import dayjs from 'dayjs'
import type { Fetcher } from 'swr'

const EVENTS_ENDPOINT = '/api/calendar/events'

function mapper(cEvent: IServerCalendarEvent): ICalendarEvent {
  const startDate = dayjs(cEvent.startDate)
  const endDate = dayjs(cEvent.endDate)
  const originalStartDate = cEvent.originalStartTime ? dayjs(cEvent.originalStartDate) : undefined
  const muster = cEvent.extendedProperties?.shared?.muster
    ? dayjs(cEvent.extendedProperties?.shared?.muster)
    : dayjs(startDate)
  const ksu = cEvent.extendedProperties?.shared?.ksu
    ? dayjs(cEvent.extendedProperties?.shared?.ksu)
    : dayjs(startDate).add(15, 'minutes')

  return {
    ...cEvent,
    endDate,
    startDate,
    originalStartDate,
    ksu,
    muster,
  }
}

export const fetchCalendarEventsBetweenDates: Fetcher<ICalendarEvent[], string> = async (key) => {
  const [startDateString, endDateString] = key.split('|')
  const start = dayjs(startDateString)
  const end = dayjs(endDateString)

  if (!start.isValid() || !end.isValid()) throw new Error(`Invalid date string: ${key}`)

  const queryParams = new URLSearchParams({
    start: start.format(),
    end: end.format(),
  })

  const response = await fetch(`${EVENTS_ENDPOINT}?${queryParams.toString()}`)

  const serverEvents = (await response.json()) as IServerCalendarEvent[]

  return serverEvents.map(mapper)
}
