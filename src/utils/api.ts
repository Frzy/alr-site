import type { ICalendarEvent, IServerCalendarEvent, RecurrenceOptions } from '@/types/common'
import { ENDPOINT, RECURRENCE_MODE } from './constants'
import {
  getRecurrenceStringFromParts,
  getRecurrenceStringParts,
  mapClientToRequest,
  mapServerToClient,
} from './calendar'
import { SendNotification } from './helpers'

export async function queryRequest(
  method: 'GET' | 'DELETE',
  url: string,
  queries?: Record<string, string>,
): Promise<Response> {
  const params = new URLSearchParams(queries)

  return params.toString()
    ? await fetch(`${url}?${params.toString()}`, { method })
    : await fetch(url, { method })
}
export async function bodyRequest(
  method: 'PUT' | 'POST' | 'PATCH',
  url: string,
  data: unknown,
): Promise<Response> {
  return await fetch(url, {
    method,
    body: JSON.stringify(data),
  })
}

// Calendar Events
export async function createCalendarEvent(
  event: ICalendarEvent,
  skipNotification?: boolean,
): Promise<ICalendarEvent | undefined> {
  try {
    const requestBody = mapClientToRequest(event)
    const response = await bodyRequest('POST', '/api/calendar/events', requestBody)
    const { data } = await response.json()
    if (!skipNotification) SendNotification(`Event was created`, 'success')

    return mapServerToClient(data as IServerCalendarEvent)
  } catch (error) {
    if (!skipNotification) SendNotification(`Failed to create event`, 'error')
  }
}
export async function udpateCalendarEvent(
  event: ICalendarEvent,
  options: RecurrenceOptions = { mode: RECURRENCE_MODE.SINGLE },
): Promise<ICalendarEvent | undefined> {
  const { mode } = options

  try {
    switch (mode) {
      case RECURRENCE_MODE.ALL: {
        const requestBody = mapClientToRequest(event)
        const response = await bodyRequest(
          'PUT',
          `/api/calendar/event/${event?._event?.recurringEventId}`,
          requestBody,
        )
        const { data } = await response.json()

        SendNotification(`Events were updated`, 'success')
        return mapServerToClient(data as IServerCalendarEvent)
      }
      case RECURRENCE_MODE.FUTURE: {
        await deleteCalendarEvent(event, options, true)
        const data = await createCalendarEvent(event, true)

        if (data) {
          SendNotification(`Events were updated`, 'success')
          return data
        } else {
          throw new Error('No create response object')
        }
      }
      case RECURRENCE_MODE.SINGLE: {
        const requestBody = mapClientToRequest(event)
        const response = await bodyRequest('PUT', `/api/calendar/event/${event.id}`, requestBody)
        const { data } = await response.json()

        SendNotification(`Event was updated`, 'success')

        return mapServerToClient(data as IServerCalendarEvent)
      }
    }
  } catch (error) {
    SendNotification('Failed to update event()', 'error')
  }
}
export async function deleteCalendarEvent(
  event: ICalendarEvent,
  options: RecurrenceOptions = { mode: RECURRENCE_MODE.SINGLE },
  skipNotification?: boolean,
): Promise<void> {
  const { mode } = options
  const isRecurringEvent = !!event?._event?.recurringEventId

  try {
    switch (mode) {
      case RECURRENCE_MODE.ALL:
        void (await queryRequest('DELETE', `${ENDPOINT.EVENT}/${event?._event?.recurringEventId}`))
        if (!skipNotification) SendNotification(`Events were deleted`, 'success')
        break
      case RECURRENCE_MODE.FUTURE: {
        if (!event._recurrenceEvent)
          throw new Error('Calendar event does not have a recurrence event')
        if (!Array.isArray(event.recurrence))
          throw new Error('Calendar event does not have a recurrence string')

        const stopDate = event.startDate.utc().subtract(1, 'day').endOf('day')
        const recurrenceString = event.recurrence[0]
        const parts = getRecurrenceStringParts(recurrenceString)
        parts.COUNT = undefined
        parts.UNTIL = stopDate.utc().format(event.isAllDayEvent ? 'YYYYMMDD' : 'YYYYMMDDTHHmmss[Z]')
        const recurrence = getRecurrenceStringFromParts(parts)

        void (await bodyRequest('PUT', `/api/calendar/event/${event._recurrenceEvent.id}`, {
          ...event._recurrenceEvent,
          recurrence: [recurrence],
        }))
        if (!skipNotification) SendNotification(`Events were deleted`, 'success')
        break
      }
      case RECURRENCE_MODE.SINGLE:
        if (isRecurringEvent) {
          void (await bodyRequest('PUT', `/api/calendar/event/${event.id}`, {
            ...event._event,
            status: 'cancelled',
          }))
        } else {
          void (await queryRequest('DELETE', `${ENDPOINT.EVENT}/${event.id}`))
        }
        if (!skipNotification) SendNotification(`Event was deleted`, 'success')
        break
    }
  } catch (error) {
    if (!skipNotification) SendNotification('Failed to delete event(s)', 'error')
  }
}
