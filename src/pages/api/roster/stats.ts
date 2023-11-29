import { getMembersBy, memberToUnAuthMember } from '@/lib/roster'
import { NextApiRequest, NextApiResponse } from 'next'
import type { MembershipStats } from '@/types/common'
import HttpError from '@/lib/http-error'

async function GetHandle(req: NextApiRequest, res: NextApiResponse<MembershipStats>) {
  const roster = await getMembersBy()
  const counts = {} as MembershipStats

  roster.reduce((curr, next) => {
    if (curr[next.role]) {
      curr[next.role] += 1
    } else {
      curr[next.role] = 1
    }

    return curr
  }, counts)

  return counts
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
