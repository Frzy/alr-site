import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { findMember, memberToUnAuthMember, updateMember } from '@/lib/roster'
import { NextApiRequest, NextApiResponse } from 'next'

import type { Member } from '@/types/common'
import type { Api } from '@/types/api'
import HttpError from '@/lib/http-error'
import { getActivityLogEntries, groupLogsByMember } from '@/lib/activity.log'
import moment from 'moment'
import { MIN_EVENTS, MIN_RIDES, RIDER_ROLES } from '@/utils/constants'

async function GetHandle(req: NextApiRequest, res: NextApiResponse<Member | Api.Error>) {
  const { start, end } = req.query
  const startDate = start ? moment(start) : moment().startOf('year')
  const endDate = end ? moment(end) : moment().endOf('year')
  let logs

  if (startDate.isValid() && endDate.isValid()) {
    logs = await getActivityLogEntries((log) => moment(log.date).isBetween(startDate, endDate))
  } else {
    logs = await getActivityLogEntries()
  }

  const memberLogs = await groupLogsByMember(logs, (m) => m.isActive)

  return memberLogs
    .sort((a, b) => a.member.name.localeCompare(b.member.name))
    .map((mLog) => {
      const { member, events: totalEvents } = mLog
      const isRider = RIDER_ROLES.indexOf(member.role) !== -1
      const totalRides = mLog.breakdown.Ride.events
      const totalRiderEvents = mLog.events - Math.min(MIN_RIDES, totalRides)
      const hasRides = isRider ? totalRides >= MIN_RIDES : true
      const hasEvents = isRider ? totalRiderEvents >= MIN_EVENTS : totalEvents >= MIN_EVENTS

      return {
        eligible: hasRides && hasEvents,
        rides: totalRides,
        events: isRider ? totalRiderEvents : totalEvents,
        member,
      }
    })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  try {
    let response

    if (!session) throw new HttpError(403, 'Not Authorized')

    switch (req.method) {
      case 'GET':
        response = await GetHandle(req, res)
        break
      default:
        throw new HttpError(405, 'Method Not Allowed')
    }

    res.setHeader('Content-Type', 'application/json')
    res.status(200)
    res.end(JSON.stringify(response))
  } catch (error) {
    res.json(error)
    res.status(error instanceof HttpError ? error.status : 400).end()
  }
}
