import { getActivityLogStats } from '@/lib/activity.log'
import { ActivityLogStats } from '@/types/common'
import { NextApiRequest, NextApiResponse } from 'next'

async function GetHandle(req: NextApiRequest, res: NextApiResponse<ActivityLogStats>) {
  const stats = await getActivityLogStats()

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
