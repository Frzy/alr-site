import { ICalendarEvent, IRequestBodyCalendarEvent } from '@/types/common'
import {
  CALENDAR_COLORS,
  CALENDAR_COLOR_ID,
  DEFAULT_CALENDAR_COLOR,
  EVENT_TYPE,
  EVENT_TYPE_COLOR_ID,
} from '@/utils/constants'
import {
  getContrastTextColor,
  getRecurrenceStringFromParts,
  getRecurrenceStringParts,
} from '@/utils/helpers'
import { google, type calendar_v3 } from 'googleapis'
import moment from 'moment'

function getCalendarEventColor(calendarEvent: calendar_v3.Schema$Event) {
  const colorId = calendarEvent.colorId ? parseInt(calendarEvent.colorId) : 0

  if (!isNaN(colorId)) return CALENDAR_COLORS[colorId]

  return DEFAULT_CALENDAR_COLOR
}
function getCalendarEventType(calendarEvent: calendar_v3.Schema$Event) {
  const colorId = calendarEvent.colorId

  if (colorId === EVENT_TYPE_COLOR_ID.RIDE) return EVENT_TYPE.RIDE
  if (colorId === EVENT_TYPE_COLOR_ID.UNOFFICAL_RIDE) return EVENT_TYPE.UNOFFICAL_RIDE
  if (colorId === EVENT_TYPE_COLOR_ID.MEETING) return EVENT_TYPE.MEETING

  return EVENT_TYPE.EVENT
}

export function stripCalenarEvent(event: calendar_v3.Schema$Event) {
  const { id, iCalUID, ...calendarEvent } = event

  return calendarEvent
}
export function getServerCalendarEvent(calendarEvent: calendar_v3.Schema$Event): ICalendarEvent {
  const now = moment()
  const startDate = moment(calendarEvent.start?.date || calendarEvent.start?.dateTime)
  const endDate = moment(calendarEvent.end?.date || calendarEvent.end?.dateTime)
  const originalStartDate = calendarEvent.originalStartTime
    ? moment(calendarEvent.originalStartTime.date || calendarEvent.originalStartTime.dateTime)
    : undefined
  const isAllDayEvent = !!calendarEvent.start?.date || !!calendarEvent.end?.date
  // This is becuase google is an exclusive end date
  const dayTotal = endDate.diff(startDate, 'day') + (isAllDayEvent ? 0 : 1)
  if (isAllDayEvent) endDate.subtract(1, 'day').endOf('day')
  const isPastEvent = now.isAfter(endDate)
  const eventType = getCalendarEventType(calendarEvent)
  const color = getCalendarEventColor(calendarEvent)
  const textColor = getContrastTextColor(color.slice(1))

  return {
    ...calendarEvent,
    endDate,
    eventType,
    isAllDayEvent,
    dayTotal,
    isPastEvent,
    startDate,
    originalStartDate,
    color,
    textColor,
  }
}
export function getGoogleCalendarApi() {
  const jwtClient = new google.auth.JWT(
    process.env.GOOGLE_CLIENT_EMAIL,
    undefined,
    process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    ['https://www.googleapis.com/auth/calendar'],
  )

  const calendarApi = google.calendar({ version: 'v3', auth: jwtClient })

  return calendarApi
}
export async function getCalendarEvents(
  options: calendar_v3.Params$Resource$Events$List,
  noParse: boolean = false,
) {
  const calendarApi = getGoogleCalendarApi()
  const response = await calendarApi.events.list({
    ...options,
    calendarId: process.env.GOOGLE_CALENDAR_ID,
  })

  if (response.data.items) {
    return noParse ? response.data.items : response.data.items.map(getServerCalendarEvent)
  }

  return []
}
export async function getSingleCalendarEvent(
  options: calendar_v3.Params$Resource$Events$Get,
  noParse: boolean = false,
) {
  const calendarApi = getGoogleCalendarApi()
  const response = await calendarApi.events.get({
    ...options,
    calendarId: process.env.GOOGLE_CALENDAR_ID,
  })

  return noParse ? response.data : getServerCalendarEvent(response.data)
}
export async function createCalendarEvent(options: calendar_v3.Params$Resource$Events$Insert) {
  const calendarApi = getGoogleCalendarApi()
  try {
    const response = await calendarApi.events.insert({
      ...options,
      calendarId: process.env.GOOGLE_CALENDAR_ID,
    })

    return response
  } catch (error) {
    throw error
  }
}
export async function updateCalendarEvent(
  options: calendar_v3.Params$Resource$Events$Update,
  merge = false,
) {
  const calendarApi = getGoogleCalendarApi()
  let { requestBody, ...opts } = options

  if (merge) {
    const event = await getSingleCalendarEvent({ eventId: options.eventId }, true)

    requestBody = { ...event, ...requestBody }
  }

  const response = await calendarApi.events.update({
    ...opts,
    requestBody,
    supportsAttachments: true,
    calendarId: process.env.GOOGLE_CALENDAR_ID,
  })

  return response.data
}
export async function deleteCalendarEvent(options: calendar_v3.Params$Resource$Events$Delete) {
  const calendarApi = getGoogleCalendarApi()
  await calendarApi.events.delete({
    ...options,
    calendarId: process.env.GOOGLE_CALENDAR_ID,
  })
}
export async function updateFurtureRecurringEvents(
  eventId: string,
  updates: IRequestBodyCalendarEvent,
  stopDate: string,
) {
  // Update old Recurring event to end on the stop date

  const calendarEvent: calendar_v3.Schema$Event = await getSingleCalendarEvent({ eventId }, true)

  if (calendarEvent && calendarEvent.recurrence) {
    const parts = getRecurrenceStringParts(calendarEvent.recurrence[0])
    parts['UNTIL'] = stopDate
    const recString = getRecurrenceStringFromParts(parts)
    await updateCalendarEvent({
      eventId,
      requestBody: { ...calendarEvent, recurrence: [recString] },
    })
  }

  // create new recurring event
  const requestBody = { ...stripCalenarEvent(calendarEvent), ...updates }
  const response = await createCalendarEvent({ requestBody })

  return response
}
export async function deleteFutureCalendarEvents(eventId: string, stopDate: string) {
  const calendarEvent: calendar_v3.Schema$Event = await getSingleCalendarEvent({ eventId }, true)

  if (calendarEvent && calendarEvent.recurrence) {
    const parts = getRecurrenceStringParts(calendarEvent.recurrence[0])

    parts['UNTIL'] = stopDate

    const recString = getRecurrenceStringFromParts(parts)

    const response = await updateCalendarEvent({
      eventId,
      requestBody: { ...calendarEvent, recurrence: [recString] },
    })

    return response
  }
}
