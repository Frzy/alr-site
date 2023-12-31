import { getContrastTextColor } from './helpers'
import { type SvgIconProps } from '@mui/material'
import dayjs, { type Dayjs } from 'dayjs'
import EventIcon from '@mui/icons-material/LocalActivity'
import MeetingIcon from '@mui/icons-material/Groups'
import OtherIcon from '@mui/icons-material/Event'
import RideIcon from '@mui/icons-material/TwoWheeler'
import type { calendar_v3 } from 'googleapis'
import type { Fetcher } from 'swr'
import type { ICalendarEvent, IServerCalendarEvent, Recurrence } from '@/types/common'
import {
  type CALENDAR_COLOR,
  CALENDAR_COLORS,
  DEFAULT_CALENDAR_COLOR,
  EVENT_TYPE,
  EVENT_TYPE_COLOR_ID,
  EVENT_TYPE_COLOR,
  COLOR_OPTIONS,
  DEFAULT_CALENDAR_COLOR_ID,
} from './constants'

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
  const dayTotal = endDate.diff(startDate, 'day')
  const isMultipleDayEvent = dayTotal > 1
  const isPastEvent = now.isAfter(endDate)
  const eventType = getCalendarEventType(calendarEvent)
  const color = getCalendarEventColor(calendarEvent)
  const textColor = getContrastTextColor(color.slice(1))

  return {
    _event: calendarEvent,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    id: calendarEvent.id!,
    color,
    dayTotal,
    description: calendarEvent.description ?? undefined,
    endDate: endDate.format(),
    eventType,
    isAllDayEvent,
    isMultipleDayEvent,
    isPastEvent,
    ksu: calendarEvent.extendedProperties?.shared?.ksu,
    location: calendarEvent?.location ?? undefined,
    miles: calendarEvent.extendedProperties?.shared?.miles
      ? parseInt(calendarEvent.extendedProperties.shared.miles)
      : undefined,
    muster: calendarEvent.extendedProperties?.shared?.muster,
    musterLocation: calendarEvent.extendedProperties?.shared?.musterLocation,
    originalStartDate: originalStartDate?.format(),
    recurrence: calendarEvent.recurrence,
    startDate: startDate.format(),
    summary: calendarEvent.summary ?? undefined,
    textColor,
  }
}
export function mapServerToClient(cEvent: IServerCalendarEvent): ICalendarEvent {
  const startDate = dayjs(cEvent.startDate)
  const endDate = dayjs(cEvent.endDate)
  const originalStartDate = cEvent.originalStartDate ? dayjs(cEvent.originalStartDate) : undefined
  const muster = cEvent.muster ? dayjs(cEvent.muster) : undefined
  const ksu = cEvent.ksu ? dayjs(cEvent.ksu) : undefined

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
export function mapClientToRequest(cEvent: ICalendarEvent): calendar_v3.Schema$Event {
  function getMixin(): Partial<calendar_v3.Schema$Event> {
    if (cEvent._event) {
      const {
        created,
        creator,
        etag,
        hangoutLink,
        htmlLink,
        iCalUID,
        id,
        kind,
        locked,
        organizer,
        originalStartTime,
        recurringEventId,
        updated,
        ...other
      } = cEvent._event

      return other
    }

    return {}
  }

  const start: calendar_v3.Schema$EventDateTime = { timeZone: 'America/Phoenix' }
  const end: calendar_v3.Schema$EventDateTime = { timeZone: 'America/Phoenix' }
  const shared: Record<string, string> = {}
  const mixin = getMixin()

  if (cEvent.isAllDayEvent) {
    start.date = cEvent.startDate.startOf('day').format('YYYY-MM-DD')
    end.date = cEvent.endDate.startOf('day').format('YYYY-MM-DD')
  } else {
    start.dateTime = cEvent.startDate.format()
    end.dateTime = cEvent.endDate.format()
  }

  if (cEvent?.ksu) {
    shared.ksu = cEvent.ksu.format()
  }
  if (cEvent.miles) {
    shared.miles = `${cEvent.miles}`
  }
  if (cEvent.muster) {
    shared.muster = cEvent.muster.format()
  }
  if (cEvent.musterLocation) {
    shared.musterLocation = cEvent.musterLocation
  }

  return {
    ...mixin,
    colorId: getColorIdByEventType(cEvent.eventType),
    description: cEvent.description,
    location: cEvent.location,
    recurrence: cEvent.recurrence,
    summary: cEvent.summary,
    start,
    end,
    extendedProperties: Object.keys(shared).length ? { shared } : null,
  }
}
export function getBlankEventForDate(date: Dayjs): ICalendarEvent {
  const now = dayjs()
  const startDate = getClosestHalfHour(combineDateAndTime(date, dayjs()))
  const endDate = startDate.add(1, 'hour').add(1, 'day')
  const event: ICalendarEvent = {
    endDate,
    id: crypto.randomUUID(),
    isAllDayEvent: true,
    startDate,
    _renderIndex: -1,
    color: EVENT_TYPE_COLOR.EVENT,
    dayTotal: 1,
    eventType: EVENT_TYPE.EVENT,
    isMultipleDayEvent: false,
    isPastEvent: startDate.isBefore(now),
    textColor: getContrastTextColor(EVENT_TYPE_COLOR.EVENT.slice(1)),
    isNew: true,
  }

  return event
}
export function getColorIdByEventType(eventType: EVENT_TYPE): string {
  switch (eventType) {
    case EVENT_TYPE.RIDE:
      return EVENT_TYPE_COLOR_ID.RIDE
    case EVENT_TYPE.UNOFFICAL_RIDE:
      return EVENT_TYPE_COLOR_ID.UNOFFICAL_RIDE
    case EVENT_TYPE.EVENT:
      return EVENT_TYPE_COLOR_ID.EVENT
    case EVENT_TYPE.MEETING:
      return EVENT_TYPE_COLOR_ID.MEETING
    case EVENT_TYPE.OTHER:
      return EVENT_TYPE_COLOR_ID.OTHER
    default:
      return DEFAULT_CALENDAR_COLOR_ID
  }
}
export function getCalendarEventColor(calendarEvent: calendar_v3.Schema$Event): CALENDAR_COLOR {
  const option = COLOR_OPTIONS.find((o) => o.value === calendarEvent.colorId)

  return option ? option.color : DEFAULT_CALENDAR_COLOR
}
export function getCalendarEventType(calendarEvent: calendar_v3.Schema$Event): EVENT_TYPE {
  const colorId = calendarEvent.colorId?.toUpperCase()

  if (colorId === EVENT_TYPE_COLOR_ID.RIDE) return EVENT_TYPE.RIDE
  if (colorId === EVENT_TYPE_COLOR_ID.UNOFFICAL_RIDE) return EVENT_TYPE.UNOFFICAL_RIDE
  if (colorId === EVENT_TYPE_COLOR_ID.MEETING) return EVENT_TYPE.MEETING
  if (colorId === EVENT_TYPE_COLOR_ID.EVENT) return EVENT_TYPE.EVENT
  if (colorId === EVENT_TYPE_COLOR_ID.OTHER) return EVENT_TYPE.OTHER

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
    const untilDate = dayjs(rObj.UNTIL, 'YYYYMMDD')
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

  const startDateString = date.format('YYYY-MM-DD')
  const endDateString = date.add(event.dayTotal, 'day').format('YYYY-MM-DD')
  const startTimeString = event.startDate.format('HH:mm:ssZ')
  const endTimeString = event.endDate.format('HH:mm:ssZ')

  event.startDate = dayjs(`${startDateString}T${startTimeString}`)
  event.endDate = dayjs(`${endDateString}T${endTimeString}`)

  return event
}
export function sortDayEvents(initEvents: ICalendarEvent[]): (ICalendarEvent | null)[] {
  const events = [...initEvents]
  const singleDayEvents = events.filter((e) => !e.isMultipleDayEvent)
  let multipleDayEvents = events.filter((e) => e.isMultipleDayEvent)
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
    if (sortedEvents[e._renderIndex]) {
      sortedEvents[e._renderIndex + 1] = e
      e._renderIndex += 1
    } else {
      sortedEvents[e._renderIndex] = e
    }
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
  if (event._event) return mapServerToClient(mapGoogleToServer(event._event))

  return event
}
export function getDaysEvents(data: ICalendarEvent[], day: Dayjs): ICalendarEvent[] {
  if (data) {
    const dayStart = day.startOf('day')
    const dayEnd = day.endOf('day')

    const temp = data.filter((event) => {
      if (event.isAllDayEvent && event.isMultipleDayEvent) {
        return day.isBetween(event.startDate, event.endDate, 'day', '[)')
      } else if (event.isMultipleDayEvent) {
        return day.isBetween(event.startDate, event.endDate, 'day', '[]')
      }

      return event.startDate.isBetween(dayStart, dayEnd, 'day', '[]')
    })

    return temp
  }

  return []
}
export function getEventPrintUrl(event: ICalendarEvent): string {
  if (event?._event?.htmlLink) {
    const query = event._event.htmlLink.split('?')

    const queryParams = new URLSearchParams(query[query.length - 1])

    queryParams.set('sf', 'true')
    queryParams.set('pjs', 'true')
    queryParams.set('src', event._event.organizer?.email ?? '')

    return `https://calendar.google.com/calendar/u/0/printevent?${queryParams.toString()}`
  }

  return ''
}
export function getLocationMapLink(location: string): string {
  const query = new URLSearchParams({ q: location })

  return `https://www.google.com/maps?${query.toString()}`
}
export function parseLocationString(location: string): string[] | string {
  const parts = location.split(', ')

  if (parts.length > 1 && parts[1].match(/^\d/)) {
    const [name, ...other] = parts
    const address = other.join(', ')

    return [name, address]
  }

  return location
}
export function getCalendarEventTypeColor(type: EVENT_TYPE): EVENT_TYPE_COLOR {
  switch (type) {
    case EVENT_TYPE.UNOFFICAL_RIDE:
      return EVENT_TYPE_COLOR.UNOFFICAL_RIDE
    case EVENT_TYPE.RIDE:
      return EVENT_TYPE_COLOR.RIDE
    case EVENT_TYPE.MEETING:
      return EVENT_TYPE_COLOR.MEETING
    case EVENT_TYPE.EVENT:
      return EVENT_TYPE_COLOR.EVENT

    default:
      return EVENT_TYPE_COLOR.OTHER
  }
}
export function getCalendarEventTypeIcon(type: EVENT_TYPE, props: SvgIconProps = {}): JSX.Element {
  switch (type) {
    case EVENT_TYPE.UNOFFICAL_RIDE:
    case EVENT_TYPE.RIDE:
      return <RideIcon {...props} />
    case EVENT_TYPE.MEETING:
      return <MeetingIcon {...props} />
    case EVENT_TYPE.EVENT:
      return <EventIcon {...props} />
    default:
      return <OtherIcon {...props} />
  }
}
export function getClosestHalfHour(date: Dayjs): Dayjs {
  const remainder = 30 - (date.minute() % 30)

  return date.add(remainder, 'minutes')
}
export function combineDateAndTime(date: Dayjs, time: Dayjs): Dayjs {
  const dateFormat = 'MM-DD-YYYY'
  const timeFormat = 'HH:mm'
  const dateString = date.format(dateFormat)
  const timeString = time.format(timeFormat)

  return dayjs(`${dateString}T${timeString}`, `${dateFormat}T${timeFormat}`)
}