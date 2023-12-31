import { cache } from 'react'
import 'server-only'

import type { IRequestBodyCalendarEvent } from '@/types/common'
import {
  getRecurrenceStringFromParts,
  getRecurrenceStringParts,
  stripCalenarEvent,
} from '@/utils/calendar'
import { google, type calendar_v3 } from 'googleapis'

export function getGoogleCalendarApi(): calendar_v3.Calendar {
  const jwtClient = new google.auth.JWT(
    process.env.GOOGLE_CLIENT_EMAIL,
    undefined,
    process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    ['https://www.googleapis.com/auth/calendar'],
  )

  const calendarApi = google.calendar({ version: 'v3', auth: jwtClient })

  return calendarApi
}

export async function getGoogleCalendarEvents(
  options: calendar_v3.Params$Resource$Events$List,
): Promise<calendar_v3.Schema$Event[]> {
  const calendarApi = getGoogleCalendarApi()
  const response = await calendarApi.events.list({
    ...options,
    calendarId: process.env.GOOGLE_CALENDAR_ID,
  })

  if (response.data.items) return response.data.items

  return []
}
export async function getGoogleCalendarEvent(
  options: calendar_v3.Params$Resource$Events$Get,
): Promise<calendar_v3.Schema$Event> {
  const calendarApi = getGoogleCalendarApi()
  const response = await calendarApi.events.get({
    ...options,
    calendarId: process.env.GOOGLE_CALENDAR_ID,
  })

  return response.data
}

export async function cancelCalendarEvent(
  options: calendar_v3.Params$Resource$Events$Update,
): Promise<calendar_v3.Schema$Event> {
  const calendarApi = getGoogleCalendarApi()
  const { requestBody, ...requestOptions } = options

  const response = await calendarApi.events.update({
    ...requestOptions,
    requestBody: {
      status: 'cancelled',
    },
  })

  return response.data
}

export async function createCalendarEvent(
  options: calendar_v3.Params$Resource$Events$Insert,
): Promise<calendar_v3.Schema$Event> {
  const calendarApi = getGoogleCalendarApi()
  const response = await calendarApi.events.insert({
    ...options,
    calendarId: process.env.GOOGLE_CALENDAR_ID,
  })

  return response.data
}
export async function updateCalendarEvent(
  options: calendar_v3.Params$Resource$Events$Update,
  merge = false,
): Promise<calendar_v3.Schema$Event> {
  const calendarApi = getGoogleCalendarApi()
  let { requestBody, ...opts } = options

  if (merge) {
    const event = await getCalendarEvent({ eventId: options.eventId })

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
export async function deleteCalendarEvent(
  options: calendar_v3.Params$Resource$Events$Delete,
): Promise<void> {
  const calendarApi = getGoogleCalendarApi()
  const response = await calendarApi.events.delete({
    ...options,
    calendarId: process.env.GOOGLE_CALENDAR_ID,
  })

  return response.data
}
export async function updateFurtureRecurringEvents(
  eventId: string,
  updates: IRequestBodyCalendarEvent,
  stopDate: string,
): Promise<calendar_v3.Schema$Event> {
  // Update old Recurring event to end on the stop date

  const calendarEvent: calendar_v3.Schema$Event = await getCalendarEvent({ eventId })

  if (calendarEvent?.recurrence) {
    const parts = getRecurrenceStringParts(calendarEvent.recurrence[0])
    parts.UNTIL = stopDate
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
export async function deleteFutureCalendarEvents(
  eventId: string,
  stopDate: string,
): Promise<calendar_v3.Schema$Event | undefined> {
  const calendarEvent: calendar_v3.Schema$Event = await getCalendarEvent({ eventId })

  if (calendarEvent?.recurrence) {
    const parts = getRecurrenceStringParts(calendarEvent.recurrence[0])
    parts.UNTIL = stopDate
    const recString = getRecurrenceStringFromParts(parts)

    const response = await updateCalendarEvent({
      eventId,
      requestBody: { ...calendarEvent, recurrence: [recString] },
    })

    return response
  }

  return undefined
}

export const getCalendarEvents = cache(getGoogleCalendarEvents)
export const getCalendarEvent = cache(getGoogleCalendarEvent)
