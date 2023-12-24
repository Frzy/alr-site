import type { ICalendarEvent, IServerCalendarEvent, Recurrence } from '@/types/common'
import dayjs, { type Dayjs } from 'dayjs'
import type { calendar_v3 } from 'googleapis'
import type { Fetcher } from 'swr'
import {
  type CALENDAR_COLOR,
  CALENDAR_COLORS,
  DEFAULT_CALENDAR_COLOR,
  EVENT_TYPE,
  EVENT_TYPE_COLOR_ID,
} from './constants'
import { getContrastTextColor } from './helpers'

const EVENTS_ENDPOINT = '/api/calendar/events'

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

  return serverEvents.map(mapServerToClient)
}
export function mapGoogleToServer(calendarEvent: calendar_v3.Schema$Event): IServerCalendarEvent {
  const now = dayjs()
  const isAllDayEvent = !!calendarEvent.start?.date || !!calendarEvent.end?.date
  const startDate = dayjs(calendarEvent.start?.date ?? calendarEvent.start?.dateTime)
  const endDate = dayjs(calendarEvent.end?.date ?? calendarEvent.end?.dateTime)
  const originalStartDate = calendarEvent.originalStartTime
    ? dayjs(calendarEvent.originalStartTime.date ?? calendarEvent.originalStartTime.dateTime)
    : undefined
  const dayTotal = endDate.diff(startDate, 'day') + (isAllDayEvent ? 0 : 1)
  const isPastEvent = now.isAfter(endDate)
  const eventType = getCalendarEventType(calendarEvent)
  const color = getCalendarEventColor(calendarEvent)
  const textColor = getContrastTextColor(color.slice(1))

  return {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    id: calendarEvent.id!,
    summary: calendarEvent.summary ?? '',
    color,
    dayTotal,
    endDate: endDate.format(),
    eventType,
    isAllDayEvent,
    isPastEvent,
    originalStartDate: originalStartDate?.format(),
    startDate: startDate.format(),
    textColor,
    muster: calendarEvent.extendedProperties?.shared?.muster,
    ksu: calendarEvent.extendedProperties?.shared?.ksu,
    _originalEvent: calendarEvent,
  }
}
export function mapServerToClient(cEvent: IServerCalendarEvent): ICalendarEvent {
  const startDate = dayjs(cEvent.startDate)
  const endDate = dayjs(cEvent.endDate)
  const originalStartDate = cEvent.originalStartDate ? dayjs(cEvent.originalStartDate) : undefined
  const muster = cEvent.muster ? dayjs(cEvent.muster) : dayjs(cEvent.startDate)
  const ksu = cEvent.ksu ? dayjs(cEvent.ksu) : dayjs(cEvent.startDate).add(15, 'minutes')

  return {
    ...cEvent,
    endDate,
    startDate,
    originalStartDate,
    ksu,
    muster,
    _renderIndex: -1,
  }
}
export function getCalendarEventColor(calendarEvent: calendar_v3.Schema$Event): CALENDAR_COLOR {
  const colorId = calendarEvent.colorId ? parseInt(calendarEvent.colorId) : 0

  if (!isNaN(colorId)) return CALENDAR_COLORS[colorId]

  return DEFAULT_CALENDAR_COLOR
}
export function getCalendarEventType(calendarEvent: calendar_v3.Schema$Event): EVENT_TYPE {
  const colorId = calendarEvent.colorId

  if (colorId === EVENT_TYPE_COLOR_ID.RIDE) return EVENT_TYPE.RIDE
  if (colorId === EVENT_TYPE_COLOR_ID.UNOFFICAL_RIDE) return EVENT_TYPE.UNOFFICAL_RIDE
  if (colorId === EVENT_TYPE_COLOR_ID.MEETING) return EVENT_TYPE.MEETING

  return EVENT_TYPE.EVENT
}
export function getCalendarEventColorById(colorId: number): CALENDAR_COLOR {
  if (CALENDAR_COLORS[colorId]) return CALENDAR_COLORS[colorId]

  return DEFAULT_CALENDAR_COLOR
}
export function stripCalenarEvent(
  event: calendar_v3.Schema$Event,
): Omit<calendar_v3.Schema$Event, 'id' | 'iCalUID'> {
  const { id, iCalUID, ...calendarEvent } = event

  return calendarEvent
}
export function getHumanReadableRecurrenceString(startDate: Dayjs, recString: string): string {
  const rObj = getRecurrenceStringParts(recString)
  let result = ''

  function getDayFromByDay(ByDay: string): string {
    const days = []

    if (ByDay.includes('SU')) days.push({ key: 'SU', day: 'Sunday' })
    if (ByDay.includes('MO')) days.push({ key: 'MO', day: 'Monday' })
    if (ByDay.includes('TU')) days.push({ key: 'TU', day: 'Tuesday' })
    if (ByDay.includes('WE')) days.push({ key: 'WE', day: 'Wednesday' })
    if (ByDay.includes('TH')) days.push({ key: 'TH', day: 'Thursday' })
    if (ByDay.includes('FR')) days.push({ key: 'FR', day: 'Friday' })
    if (ByDay.includes('SA')) days.push({ key: 'SA', day: 'Saturday' })

    const sorteDays = days
      .map((s) => s.key)
      .sort()
      .join(',')

    if (sorteDays === 'FR,MO,TH,TU,WE') return 'the weekdays'
    if (sorteDays === 'SA,SU') return 'the weekends'

    return days.map((s) => s.day).join(', ')
  }
  function getTimeFromByDay(ByDay: string): string {
    if (ByDay.startsWith('-')) {
      if (ByDay.includes('1')) return 'last'
      if (ByDay.includes('2')) return 'second to last'
    } else {
      if (ByDay.includes('1')) return 'first'
      if (ByDay.includes('2')) return 'second'
      if (ByDay.includes('3')) return 'third'
    }

    return ''
  }

  if (rObj.FREQ === 'YEARLY') {
    if (rObj.INTERVAL && parseInt(rObj.INTERVAL) > 1) {
      result = `Every ${rObj.INTERVAL} years on ${startDate.format('MMMM D')}`
    } else {
      result = `Annually on ${startDate.format('MMMM D')}`
    }
  } else if (rObj.FREQ === 'MONTHLY') {
    let dayOfMonth = startDate.format('Do')

    if (rObj.BYDAY) {
      const day = getDayFromByDay(rObj.BYDAY)
      const time = getTimeFromByDay(rObj.BYDAY)

      dayOfMonth = `${time} ${day}`
    }

    if (rObj.INTERVAL && parseInt(rObj.INTERVAL) > 1) {
      result = `Every ${rObj.INTERVAL} months on the ${dayOfMonth}`
    } else {
      result = `Monthly on the ${dayOfMonth}`
    }
  } else if (rObj.FREQ === 'WEEKLY') {
    let dayOfMonth = startDate.format('dddd')

    if (rObj.BYDAY) {
      const day = getDayFromByDay(rObj.BYDAY)

      dayOfMonth = `${day}`
    }

    if (rObj.INTERVAL && parseInt(rObj.INTERVAL) > 1) {
      result = `Every ${rObj.INTERVAL} weeks on ${dayOfMonth}`
    } else {
      result = `Weekly on ${dayOfMonth}`
    }
  } else if (rObj.FREQ === 'DAILY') {
    if (rObj.INTERVAL && parseInt(rObj.INTERVAL) > 1) {
      result = `Every ${rObj.INTERVAL} days`
    } else {
      result = `Daily`
    }
  }

  if (rObj.COUNT) result += `, ${rObj.COUNT} times`
  if (rObj.UNTIL) {
    const untilDate = dayjs(rObj.UNTIL)
    result += `, until ${untilDate.format('MMM D, YYYY')}`
  }

  return result
}
export function getRecurrenceStringParts(recString: string): Recurrence {
  const rStr = recString.replace('RRULE:', '')
  return rStr.split(';').reduce((a, b) => {
    const subParts = b.split('=')

    return { ...a, [subParts[0]]: subParts[1] }
  }, {})
}
export function getRecurrenceStringFromParts(parts: Recurrence): string {
  let recString = 'RRULE:'

  for (const [key, value] of Object.entries(parts)) {
    if (value) recString += `${key}=${value};`
  }

  return recString.slice(0, -1)
}
export function updateEventStartDate(initEvent: ICalendarEvent, date: Dayjs): ICalendarEvent {
  const event = { ...initEvent }
  let startDate
  let endDate

  if (event.isAllDayEvent) {
    startDate = date.startOf('day')
    endDate = date.add(event.dayTotal, 'days').startOf('day')

    event.startDate = startDate
    event.endDate = endDate
  } else {
    const dateString = date.format('YYYY-MM-DD')
    const startTimeString = event.startDate.format('HH:mm:ssZ')
    const endTimeString = event.endDate.format('HH:mm:ssZ')

    startDate = dayjs(`${dateString}T${startTimeString}`)
    endDate = dayjs(`${dateString}T${endTimeString}`)
  }

  event.startDate = startDate
  event.endDate = endDate

  return event
}
export function sortDayEvents(
  initEvents: ICalendarEvent[],
  date: Dayjs,
): (ICalendarEvent | null)[] {
  const events = [...initEvents]
  const singleDayEvents = events.filter((e) => e.dayTotal === 1)
  let multipleDayEvents = events.filter((e) => e.dayTotal > 1)
  let maxIndex = events.length
  let rIndex = 0

  multipleDayEvents.sort((a, b) => {
    if (a.startDate.isBefore(b.startDate)) return -1
    if (a.startDate.isAfter(b.startDate)) return 1

    return 0
  })

  singleDayEvents.sort((a, b) => {
    if (a.startDate.isBefore(b.startDate)) return -1
    if (a.startDate.isAfter(b.startDate)) return 1

    return 0
  })

  multipleDayEvents = multipleDayEvents.map((e) => {
    if (e._renderIndex === -1) {
      maxIndex = Math.max(maxIndex, rIndex)

      e._renderIndex = rIndex
      rIndex += 1
    } else if (rIndex === e._renderIndex) {
      rIndex += 1
    }

    return e
  })

  let sortedEvents = Array(maxIndex).fill(null)

  multipleDayEvents.forEach((e) => {
    sortedEvents[e._renderIndex] = e
  })

  sortedEvents = sortedEvents.map((e) => {
    if (!e && singleDayEvents[0]) {
      return singleDayEvents.shift()
    }

    return e
  })

  return [...sortedEvents, ...singleDayEvents]
}
export function resetEvent(event: ICalendarEvent): ICalendarEvent {
  return mapServerToClient(mapGoogleToServer(event._originalEvent))
}
export function getDaysEvents(data: ICalendarEvent[], day: Dayjs): ICalendarEvent[] {
  if (data) {
    return data.filter((event) => {
      const start = event.startDate.startOf('day')
      const end = event.endDate.endOf('day')

      if (event.isAllDayEvent) return day.isBetween(start, end, 'day', '[)')

      return day.isBetween(start, end, 'day', '[]')
    })
  }

  return []
}
