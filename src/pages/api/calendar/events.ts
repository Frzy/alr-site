import { NextApiRequest, NextApiResponse } from 'next'
import { createCalendarEvent, getCalendarEvents, stripCalenarEvent } from '@/lib/calendar'

async function GetHandle(req: NextApiRequest, res: NextApiResponse) {
  const { start: timeMin = undefined, end: timeMax = undefined } = req.query as {
    [key: string]: string
  }

  try {
    const events = await getCalendarEvents({
      timeMin,
      timeMax,
      orderBy: 'startTime',
      singleEvents: true,
    })

    return res.status(200).json(events)
  } catch (error) {
    return res.status(400).end(error)
  }
}

async function PostHandle(req: NextApiRequest, res: NextApiResponse) {
  const body = JSON.parse(req.body)

  try {
    const response = createCalendarEvent({ requestBody: stripCalenarEvent(body) })
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
    case 'POST':
      PostHandle(req, res)
      break
    default:
      res.status(405).end()
  }
}
