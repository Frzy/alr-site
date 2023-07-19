import { NextApiRequest, NextApiResponse } from 'next'
import {
  deleteCalendarEvent,
  deleteFutureCalendarEvents,
  getSingleCalendarEvent,
  updateCalendarEvent,
  updateFurtureRecurringEvents,
} from '@/lib/calendar'
import { RECURRENCE_MODE } from '@/utils/constants'

async function GetHandle(req: NextApiRequest, res: NextApiResponse) {
  const { eventId } = req.query as { [key: string]: string }

  try {
    const event = await getSingleCalendarEvent({
      eventId,
    })

    if (event) {
      return res.status(200).json(event)
    } else {
      return res.status(404).json({})
    }
  } catch (error) {
    return res.status(400).end(error)
  }
}

async function deleteHandle(req: NextApiRequest, res: NextApiResponse) {
  const { eventId, mode, stopDate } = req.query as { [key: string]: string }

  if (mode === RECURRENCE_MODE.FUTURE && stopDate) {
    await deleteFutureCalendarEvents(eventId, stopDate)
  } else {
    await deleteCalendarEvent({ eventId })
  }

  return res.status(200).json(null)
}

async function putHandle(req: NextApiRequest, res: NextApiResponse) {
  const { eventId } = req.query as { [key: string]: string }
  const { mode, stopDate, event } = JSON.parse(req.body)
  let response

  try {
    if (mode === RECURRENCE_MODE.FUTURE && stopDate) {
      response = await updateFurtureRecurringEvents(eventId, event, stopDate)
    } else {
      response = await updateCalendarEvent({ eventId, requestBody: event }, true)
    }

    return res.status(200).json(response)
  } catch (error) {
    return res.status(400).json(error)
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      GetHandle(req, res)
      break
    case 'DELETE':
      deleteHandle(req, res)
      break
    case 'PUT':
      putHandle(req, res)
      break
    default:
      res.status(405).end()
  }
}
