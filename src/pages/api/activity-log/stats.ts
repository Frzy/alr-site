import { getActivityLogStats } from '@/lib/activity.log'
import { ActivityLogStats } from '@/types/common'
import moment from 'moment'
import { NextApiRequest, NextApiResponse } from 'next'

async function GetHandle(req: NextApiRequest, res: NextApiResponse<ActivityLogStats>) {
  const { start, end } = req.query as {
    [key: string]: string
  }
  let stats

  if (start && end) {
    stats = await getActivityLogStats((log) =>
      moment(log.date).isBetween(moment(start), moment(end)),
    )
  } else if (start) {
    stats = await getActivityLogStats((log) => moment(log.date).isAfter(moment(start)))
  } else if (end) {
    stats = await getActivityLogStats((log) => moment(log.date).isBefore(moment(end)))
  } else {
    stats = await getActivityLogStats()
  }

  return res.status(200).json(stats)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      GetHandle(req, res)
      break
    default:
      res.status(405).json(undefined)
  }
}
