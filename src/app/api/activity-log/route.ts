import { addActivityLogEntries } from '@/lib/activity.log'
import { getServerAuthSession } from '@/lib/auth'
import type { RawRowData } from '@/types/common'
import { type ACTIVITY_TYPE } from '@/utils/constants'
import dayjs from 'dayjs'

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

interface CreateActivityLog {
  members: {
    name: string
    entity: ENTITY[]
  }[]
  activityName: string
  activityType: ACTIVITY_TYPE
  date: string
  hours: number
  miles?: number
  monies?: number
}

export async function POST(request: Request): Promise<Response> {
  const session = await getServerAuthSession()
  if (!session) return Response.json(null, { status: 401, statusText: 'Unauthenticated' })

  const body: CreateActivityLog = await request.json()

  const logs: RawRowData[] = body.members.map((m) => ({
    Timestamp: dayjs().format('M/D/YYYY H:mm:ss'),
    Name: m.name,
    Entity: m.entity
      .map((e) => EntityMap[e])
      .sort()
      .join(', '),
    Date: dayjs(body.date).format('M/D/YYYY'),
    Activity: body.activityName,
    'Activity Type': body.activityType,
    Hours: body.hours,
    Monies: body.monies ?? '',
    Miles: body.miles ?? '',
  }))

  await addActivityLogEntries(logs)

  return Response.json({ success: true })
}
