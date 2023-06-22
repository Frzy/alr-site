import { authOptions } from '@/lib/auth'
import { getMembersBy, memberToUnAuthMember } from '@/lib/spreadsheet'
import { NextApiRequest, NextApiResponse } from 'next'
import { google } from 'googleapis'
import type { Member } from '@/types/common'
const calendarId =
  '7c1debf9c3121dbdf8cb233713f69c58bd92825973397b361517e7b95018ce1c@group.calendar.google.com'

async function GetHandle(req: NextApiRequest, res: NextApiResponse) {
  const { recurrenceId } = req.query as { [key: string]: string }

  try {
    const jwtClient = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      undefined,
      process.env.GOOGLE_PRIVATE_KEY,
      ['https://www.googleapis.com/auth/calendar'],
    )

    const calendarApi = google.calendar({ version: 'v3', auth: jwtClient })
    const response = await calendarApi.events.get({
      calendarId,
      eventId: recurrenceId,
    })
    const event = response.data

    return res.status(200).json(event)
  } catch (error) {
    return res.status(400).end(error)
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      GetHandle(req, res)
      break
    default:
      res.status(405).end()
  }
}
