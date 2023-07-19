import { ICalendarEvent, IRequestBodyCalendarEvent, RecurrenceOptions } from '@/types/common'
import { ENDPOINT, RECURRENCE_MODE } from './constants'
import moment, { Moment } from 'moment'

async function queryRequest(
  url: string,
  method: 'GET' | 'DELETE',
  queries: Record<string, string>,
) {
  const params = new URLSearchParams(queries)

  return fetch(`${url}?${params}`, { method })
}

async function bodyRequest(url: string, method: 'PUT' | 'POST' | 'PATCH', data: unknown) {
  return fetch(url, {
    method,
    body: JSON.stringify(data),
  })
}

export function createCalendarEvent<T = unknown>(calendarEvent: IRequestBodyCalendarEvent) {
  return new Promise(async (resolve, reject) => {
    const url = `${ENDPOINT.EVENTS}`
    const response = await bodyRequest(url, 'POST', calendarEvent)
    const data = (await response.json()) as T

    if (response.ok) {
      resolve(data)
    } else {
      reject(data)
    }
  })
}
export function udpateCalendarEvent<T = unknown>(
  calendarEvent: ICalendarEvent,
  body: IRequestBodyCalendarEvent,
  recurrenceOptions: RecurrenceOptions = { mode: RECURRENCE_MODE.SINGLE },
) {
  return new Promise(async (resolve, reject) => {
    const { mode, stopDate } = recurrenceOptions
    const params: { [key: string]: string } = {
      mode,
    }
    let id = calendarEvent.id

    if (mode === RECURRENCE_MODE.FUTURE && stopDate) {
      id = calendarEvent.recurringEventId

      if (calendarEvent.isAllDayEvent) {
        params.stopDate = moment(stopDate).format('YYYYMMDD')
      } else {
        params.stopDate = moment(stopDate).utc().format('YYYYMMDDTHHmmss[Z]')
      }

      body.start = calendarEvent.start
      body.end = calendarEvent.end
    } else if (mode === RECURRENCE_MODE.ALL) {
      id = calendarEvent.recurringEventId
    }

    const url = `${ENDPOINT.EVENT}/${id}`
    const response = await bodyRequest(url, 'PUT', { ...params, event: body })
    const data = (await response.json()) as T

    if (response.ok) {
      resolve(data)
    } else {
      reject(data)
    }
  })
}
export async function deleteCalendarEvent(
  calendarEvent: ICalendarEvent,
  recurrenceOptions: RecurrenceOptions = { mode: RECURRENCE_MODE.SINGLE },
) {
  const { mode, stopDate } = recurrenceOptions
  const params: Record<string, string> = { mode }
  let id = calendarEvent.id

  if (mode === RECURRENCE_MODE.FUTURE && stopDate) {
    if (calendarEvent.isAllDayEvent) {
      params.stopDate = moment(stopDate).format('YYYYMMDD')
    } else {
      params.stopDate = moment(stopDate).utc().format('YYYYMMDDTHHmmss[Z]')
    }
    id = calendarEvent.recurringEventId
  } else if (mode === RECURRENCE_MODE.ALL) {
    id = calendarEvent.recurringEventId
  }

  await queryRequest(`${ENDPOINT.EVENT}/${id}`, 'DELETE', params)
}
