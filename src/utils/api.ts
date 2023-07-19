import {
  ICalendarEvent,
  IRequestBodyCalendarEvent,
  IServerCalendarEvent,
  RecurrenceOptions,
} from '@/types/common'
import { ENDPOINT, RECURRENCE_MODE } from './constants'
import moment, { Moment } from 'moment'
import { Fetcher } from 'swr'
import { FetcherResponse } from 'swr/_internal'
import { getFrontEndCalendarEvent } from './helpers'

async function queryRequest(
  method: 'GET' | 'DELETE',
  url: string,
  queries?: Record<string, string>,
) {
  const params = new URLSearchParams(queries)

  return params.toString() ? fetch(`${url}?${params}`, { method }) : fetch(url, { method })
}

async function bodyRequest(method: 'PUT' | 'POST' | 'PATCH', url: string, data: unknown) {
  return fetch(url, {
    method,
    body: JSON.stringify(data),
  })
}

export function createCalendarEvent<T = unknown>(calendarEvent: IRequestBodyCalendarEvent) {
  return new Promise(async (resolve, reject) => {
    const url = `${ENDPOINT.EVENTS}`
    const response = await bodyRequest('POST', url, calendarEvent)
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
    const response = await bodyRequest('PUT', url, { ...params, event: body })
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

  await queryRequest('DELETE', `${ENDPOINT.EVENT}/${id}`, params)
}
export const fetcher: Fetcher<ICalendarEvent[], [string, Record<string, string>]> = async (
  args,
) => {
  // const [url, query] = args
  // const response = await queryRequest('GET', url, query)
  // const data = (await response.json()) as IServerCalendarEvent[]

  // return data.map(getFrontEndCalendarEvent)

  return []
}
