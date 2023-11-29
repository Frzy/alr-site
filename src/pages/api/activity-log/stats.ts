import { getActivityLogStats } from '@/lib/activity.log'
import HttpError from '@/lib/http-error'
import { ActivityLogStats } from '@/types/common'
import moment from 'moment'
import { NextApiRequest, NextApiResponse } from 'next'

async function GetHandle(req: NextApiRequest, res: NextApiResponse<ActivityLogStats>) {
  const { start, end } = req.query as {
    [key: string]: string
  }

  if (start && end)
    return await getActivityLogStats((log) =>
      moment(log.date).isBetween(moment(start), moment(end)),
    )

  if (start) return await getActivityLogStats((log) => moment(log.date).isAfter(moment(start)))

  if (end) return await getActivityLogStats((log) => moment(log.date).isBefore(moment(end)))

  return await getActivityLogStats()
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    let response

    switch (req.method) {
      case 'GET':
        response = await GetHandle(req, res)
        break
      default:
        throw new HttpError(405, 'Method Not Allowed')
    }

    res.status(200)
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(response))
  } catch (error) {
    res.json(error)
    res.status(error instanceof HttpError ? error.status : 400).end()
  }
}
