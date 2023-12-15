import { NextApiRequest, NextApiResponse } from 'next'
import { createCalendarEvent, getCalendarEvents, stripCalenarEvent } from '@/lib/calendar'
import HttpError from '@/lib/http-error'

async function GetHandle(req: NextApiRequest, res: NextApiResponse) {
  const { start: timeMin = undefined, end: timeMax = undefined } = req.query as {
    [key: string]: string
  }

  return await getCalendarEvents({
    timeMin,
    timeMax,
    orderBy: 'startTime',
    singleEvents: true,
  })
}

async function PostHandle(req: NextApiRequest, res: NextApiResponse) {
  const body = JSON.parse(req.body)

  return createCalendarEvent({ requestBody: stripCalenarEvent(body) })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    let response

    switch (req.method) {
      case 'GET':
        response = await GetHandle(req, res)
        res.status(200)
        break
      case 'POST':
        response = await PostHandle(req, res)
        res.status(201)
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
