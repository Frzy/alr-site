import { NextApiRequest, NextApiResponse } from 'next'
import {
  deleteCalendarEvent,
  deleteFutureCalendarEvents,
  getSingleCalendarEvent,
  updateCalendarEvent,
  updateFurtureRecurringEvents,
} from '@/lib/calendar'
import { RECURRENCE_MODE } from '@/utils/constants'
import HttpError from '@/lib/http-error'

async function GetHandle(req: NextApiRequest, res: NextApiResponse) {
  const { eventId } = req.query as { [key: string]: string }
  const event = await getSingleCalendarEvent({
    eventId,
  })

  if (!event) throw new HttpError(404, 'Not Found')

  return event
}

async function DeleteHandle(req: NextApiRequest, res: NextApiResponse) {
  const { eventId, mode, stopDate } = req.query as { [key: string]: string }

  if (mode === RECURRENCE_MODE.FUTURE && stopDate) {
    await deleteFutureCalendarEvents(eventId, stopDate)
  } else {
    await deleteCalendarEvent({ eventId })
  }

  return null
}

async function PutHandle(req: NextApiRequest, res: NextApiResponse) {
  const { eventId } = req.query as { [key: string]: string }
  const { mode, stopDate, event } = JSON.parse(req.body)

  if (mode === RECURRENCE_MODE.FUTURE && stopDate) {
    return await updateFurtureRecurringEvents(eventId, event, stopDate)
  }

  return await updateCalendarEvent({ eventId, requestBody: event }, true)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    let response
    switch (req.method) {
      case 'GET':
        response = GetHandle(req, res)
        res.status(200)
        break
      case 'DELETE':
        response = DeleteHandle(req, res)
        res.status(204)
        break
      case 'PUT':
        response = PutHandle(req, res)
        res.status(200)
        break
      default:
        throw new HttpError(405, 'Method Not Allowed')
    }

    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(response))
  } catch (error) {
    res.json(error)
    res.status(error instanceof HttpError ? error.status : 400).end()
  }
}
