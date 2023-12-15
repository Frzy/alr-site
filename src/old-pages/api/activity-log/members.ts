import { getActivityLogEntries, groupLogsByMember } from '@/lib/activity.log'
import { LogsByMember, Member } from '@/types/common'
import { NextApiRequest, NextApiResponse } from 'next'
import HttpError from '@/lib/http-error'
import moment from 'moment'

async function GetHandle(req: NextApiRequest, res: NextApiResponse<LogsByMember[]>) {
  const { start, end, includeInactiveMembers } = req.query as {
    [key: string]: string
  }
  let logs
  const memberFilter = (m: Member) => {
    return includeInactiveMembers === 'true' ? true : m.isActive
  }

  if (start && end) {
    logs = await getActivityLogEntries((log) =>
      moment(log.date).isBetween(moment(start), moment(end)),
    )
  } else if (start) {
    logs = await getActivityLogEntries((log) => moment(log.date).isAfter(moment(start)))
  } else if (end) {
    logs = await getActivityLogEntries((log) => moment(log.date).isBefore(moment(end)))
  } else {
    logs = await getActivityLogEntries()
  }

  const response = await groupLogsByMember(logs, memberFilter)

  return response.sort((a, b) => a.member.name.localeCompare(b.member.name))
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
