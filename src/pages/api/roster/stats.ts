import { getMembersBy, memberToUnAuthMember } from '@/lib/roster'
import { NextApiRequest, NextApiResponse } from 'next'
import type { Member, MembershipStats, ObjectFromList } from '@/types/common'
import { ROLES } from '@/utils/constants'

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

  return res.status(200).json(counts)
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
