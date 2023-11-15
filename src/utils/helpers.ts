import type { calendar_v3 } from 'googleapis'
import moment, { Moment } from 'moment'
import { EVENT_TYPE, OFFICER_ORDER, CALENDAR_COLORS, DEFAULT_CALENDAR_COLOR } from './constants'
import { ICalendarEvent, IServerCalendarEvent, Member, Recurrence } from '@/types/common'

export function getPhoneLink(phoneNumber: string) {
  return phoneNumber.replace(/[^0-9]/gi, '')
}
export function getSpeadsheetPhoneNumber(phoneNumber: string) {
  const pNumber = getPhoneLink(phoneNumber).split('')
  pNumber.splice(3, 0, '-')
  pNumber.splice(7, 0, '-')

  return pNumber.join('')
}
export function stringAvatar(member: Member) {
  return {
    sx: {
      bgcolor: stringToColor(member.name),
    },
    children: `${member.firstName.slice(0, 1)}${member.lastName.slice(0, 1)}`,
    alt: member.name,
  }
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
export function getFrontEndCalendarEvent(cEvent: IServerCalendarEvent): ICalendarEvent {
  const startDate = moment(cEvent.startDate)
  const endDate = moment(cEvent.endDate)
  const originalStartDate = cEvent.originalStartTime ? moment(cEvent.originalStartDate) : undefined
  const muster = cEvent.extendedProperties?.shared?.muster
    ? moment(cEvent.extendedProperties?.shared?.muster)
    : moment(startDate)
  const ksu = cEvent.extendedProperties?.shared?.ksu
    ? moment(cEvent.extendedProperties?.shared?.ksu)
    : moment(startDate).add(15, 'minutes')

  return {
    ...cEvent,
    endDate,
    startDate,
    originalStartDate,
    ksu,
    muster,
  }
}
export function stripHTML(html: string | undefined | null) {
  if (!html) return ''

  let doc = new DOMParser().parseFromString(html, 'text/html')

  return doc.body.textContent || ''
}
export function getRecurrenceStringFromParts(parts: Recurrence) {
  let recString = 'RRULE:'

  for (const [key, value] of Object.entries(parts)) {
    if (value) recString += `${key}=${value};`
  }

  return recString.slice(0, -1)
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
    const untilDate = moment(rObj.UNTIL)
    result += `, until ${untilDate.format('MMM D, YYYY')}`
  }

  return result
}
export function formatMoney(number: string | number) {
  const toFormat = typeof number === 'string' ? parseFloat(number) : number

  return toFormat.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}
export function officerSort(a: Member, b: Member) {
  if (!a.office || !b.office) return 0

  if (OFFICER_ORDER[a.office] <= OFFICER_ORDER[b.office]) return -1
  if (OFFICER_ORDER[a.office] > OFFICER_ORDER[b.office]) return 1

  return 0
}
export function getCalendarEventColorById(colorId: number) {
  if (CALENDAR_COLORS[colorId]) return CALENDAR_COLORS[colorId]

  return DEFAULT_CALENDAR_COLOR
}
export function getContrastTextColor(color: string | number[]) {
  return luma(color) >= 165 ? '#000' : '#FFF'
}
function luma(color: string | number[]) {
  // color can be a hx string or an array of RGB values 0-255
  var rgb = typeof color === 'string' ? hexToRGBArray(color) : color
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2] // SMPTE C, Rec. 709 weightings
}
function hexToRGBArray(colorStr: string) {
  let color = colorStr.startsWith('#') ? colorStr.slice(1) : colorStr
  if (color.length === 3)
    color =
      color.charAt(0) +
      color.charAt(0) +
      color.charAt(1) +
      color.charAt(1) +
      color.charAt(2) +
      color.charAt(2)
  else if (color.length !== 6) throw 'Invalid hex color: ' + color
  var rgb = []
  for (var i = 0; i <= 2; i++) rgb[i] = parseInt(color.substr(i * 2, 2), 16)
  return rgb
}
export function capitalizeAllWords(str: string) {
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
export function roundNumber(num: number, decimail = 1) {
  const dec = decimail * 10

  if (dec) return Math.floor(num) + Math.round((num % 1) * dec) / dec

  return Math.floor(num)
}