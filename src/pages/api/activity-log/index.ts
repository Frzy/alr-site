import { addActivityLogEntries, getActivityLogStats } from '@/lib/activity.log'
import { ActivityLogStats } from '@/types/common'
import { ACTIVITY_TYPE } from '@/utils/constants'
import moment from 'moment'
import { NextApiRequest, NextApiResponse } from 'next'

export enum ENTITY {
  LEGION = 'AL',
  SAL = 'SAL',
  AUXILIARY = 'AUX',
  RIDER = 'ALR',
}

const EntityMap = {
  [ENTITY.LEGION]: 'Legion',
  [ENTITY.SAL]: 'SAL',
  [ENTITY.AUXILIARY]: 'ALA',
  [ENTITY.RIDER]: 'ALR',
}

type CreateActivityLog = {
  members: {
    name: string
    entity: ENTITY[]
  }[]
  activityName: string
  activityType: ACTIVITY_TYPE
  date: string
  hours: number
  miles: number
  monies?: number
}

async function PostHandle(req: NextApiRequest, res: NextApiResponse) {
  const body: CreateActivityLog = req.body

  const rows = body.members.map((m) => {
    return {
      Timestamp: moment().format('M/D/YYYY H:mm:ss'),
      Name: m.name,
      Entity: m.entity
        .map((e) => EntityMap[e])
        .sort()
        .join(', '),
      Date: moment(body.date).format('M/D/YYYY'),
      Activity: body.activityName,
      'Activity Type': body.activityType,
      Hours: body.hours,
      Monies: body.monies,
      Miles: body.miles,
    }
  })

  await addActivityLogEntries(rows)

  return res.status(201).end()
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'POST':
      PostHandle(req, res)
      break
    default:
      res.status(405).json(undefined)
  }
}
