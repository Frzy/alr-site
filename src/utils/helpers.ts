import { ICalendarEvent } from '@/component/calendar/calendar.timeline'

import type { calendar_v3 } from 'googleapis'
import moment, { Moment } from 'moment'
import { EVENT_COLOR, EVENT_TYPE } from './constants'

export function getPhoneLink(phoneNumber: string) {
  return phoneNumber.replace(/[^0-9]/gi, '')
}
export function stringToColor(string: string) {
  let hash = 0
  let i

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash)
  }

  let color = '#'

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff
    color += `00${value.toString(16)}`.slice(-2)
  }
  /* eslint-enable no-bitwise */

  return color
}
export function getCalendarEventType(event: calendar_v3.Schema$Event) {
  if (event.summary?.toLowerCase().indexOf(EVENT_TYPE.RIDE) !== -1) return EVENT_TYPE.RIDE

  if (event.summary?.toLowerCase().indexOf(EVENT_TYPE.MEETING) !== -1) return EVENT_TYPE.MEETING

  return EVENT_TYPE.EVENT
}
export function getCalendarEventColor(type: EVENT_TYPE) {
  return EVENT_COLOR[type]
}
export function getCalendarEventFromGoogleEvent(
  events: calendar_v3.Schema$Event[] = [],
): ICalendarEvent[] {
  const now = moment()
  return events
    .map((e) => {
      const startDate = moment(e.start?.date || e.start?.dateTime)
      const endDate = moment(e.end?.date || e.end?.dateTime)
      const originalStartDate = e.originalStartTime
        ? moment(e.originalStartTime.date || e.originalStartTime.dateTime)
        : undefined
      const isAllDayEvent = !startDate.isSame(endDate, 'day')
      // This is becuase google is an exclusive end date
      if (e.end?.date) endDate.subtract(1, 'day').endOf('day')
      const dayTotal = endDate.diff(startDate, 'day') + 1
      const isPastEvent = now.isAfter(endDate)
      const eventType = getCalendarEventType(e)

      return {
        ...e,
        endDate,
        eventType,
        isAllDayEvent,
        dayTotal,
        isPastEvent,
        startDate,
        originalStartDate,
      }
    })
    .map((e) => {
      const startDate = moment(e.start?.date || e.start?.dateTime)
      const endDate = moment(e.end?.date || e.end?.dateTime)
      const isAllDayEvent = !startDate.isSame(endDate, 'day')
      // This is becuase google is an exclusive end date
      if (e.end?.date) endDate.subtract(1, 'day').endOf('day')
      const dayTotal = endDate.diff(startDate, 'day') + 1
      const isPastEvent = now.isAfter(endDate)
      const eventType = getCalendarEventType(e)

      return {
        ...e,
        dayTotal,
        endDate,
        eventType,
        isAllDayEvent,
        isPastEvent,
        startDate,
      }
    })
}
export function stripHTML(html: string | undefined | null) {
  if (!html) return ''

  let doc = new DOMParser().parseFromString(html, 'text/html')

  return doc.body.textContent || ''
}

type Recurrence = {
  FREQ?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
  COUNT?: string
  INTERVAL?: string
  UNTIL?: string
  BYDAY?: string
}

export function getRecurrenceStringParts(recString: string): Recurrence {
  const rStr = recString.replace('RRULE:', '')
  return rStr.split(';').reduce((a, b) => {
    const subParts = b.split('=')

    return { ...a, [subParts[0]]: subParts[1] }
  }, {})
}

export function getHumanReadableRecurrenceString(startDate: Moment, recString: string) {
  const rObj = getRecurrenceStringParts(recString)
  let result = ''

  function getDayFromByDay(ByDay: string) {
    const days = []

    if (ByDay.indexOf('SU') !== -1) days.push({ key: 'SU', day: 'Sunday' })
    if (ByDay.indexOf('MO') !== -1) days.push({ key: 'MO', day: 'Monday' })
    if (ByDay.indexOf('TU') !== -1) days.push({ key: 'TU', day: 'Tuesday' })
    if (ByDay.indexOf('WE') !== -1) days.push({ key: 'WE', day: 'Wednesday' })
    if (ByDay.indexOf('TH') !== -1) days.push({ key: 'TH', day: 'Thursday' })
    if (ByDay.indexOf('FR') !== -1) days.push({ key: 'FR', day: 'Friday' })
    if (ByDay.indexOf('SA') !== -1) days.push({ key: 'SA', day: 'Saturday' })

    const sorteDays = days
      .map((s) => s.key)
      .sort()
      .join(',')

    if (sorteDays === 'FR,MO,TH,TU,WE') return 'the weekdays'
    if (sorteDays === 'SA,SU') return 'the weekends'

    return days.map((s) => s.day).join(', ')
  }
  function getTimeFromByDay(ByDay: string) {
    if (ByDay.startsWith('-')) {
      if (ByDay.indexOf('1') !== -1) return 'last'
      if (ByDay.indexOf('2') !== -1) return 'second to last'
    } else {
      if (ByDay.indexOf('1') !== -1) return 'first'
      if (ByDay.indexOf('2') !== -1) return 'second'
      if (ByDay.indexOf('3') !== -1) return 'third'
    }
  }

  if (rObj.FREQ === 'YEARLY') {
    if (rObj.INTERVAL) {
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

    if (rObj.INTERVAL) {
      result = `Every ${rObj.INTERVAL} months on the ${dayOfMonth}`
    } else {
      result = `Monthly on the ${dayOfMonth}`
    }
  } else if (rObj.FREQ === 'WEEKLY') {
    let dayOfMonth = startDate.format('Do')

    if (rObj.BYDAY) {
      const day = getDayFromByDay(rObj.BYDAY)

      dayOfMonth = `${day}`
    }

    if (rObj.INTERVAL) {
      result = `Every ${rObj.INTERVAL} weeks on ${dayOfMonth}`
    } else {
      result = `Weekly on ${dayOfMonth}`
    }
  } else if (rObj.FREQ === 'DAILY') {
    if (rObj.INTERVAL) {
      result = `Every ${rObj.INTERVAL} days`
    } else {
      result = `Daily`
    }
  }

  if (rObj.COUNT) result += `, ${rObj.COUNT} times`
  if (rObj.UNTIL) {
    const untilDate = moment(rObj.UNTIL, 'YYYYMMDD')
    result += `, until ${untilDate.format('MMM D, YYYY')}`
  }

  return result
}
