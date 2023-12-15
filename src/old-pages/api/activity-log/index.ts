import { addActivityLogEntries, getActivityLogStats } from '@/lib/activity.log'
import HttpError from '@/lib/http-error'
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

  return { success: true }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    let response

    switch (req.method) {
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
