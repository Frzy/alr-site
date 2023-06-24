import { authOptions } from '@/lib/auth'
import { getMembersBy, memberToUnAuthMember } from '@/lib/roster'
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import type { Member } from '@/types/common'

const OFFICER_ORDER = {
  Director: 1,
  'Vice Director': 2,
  'Jr Vice': 3,
  Secretary: 4,
  Treasurer: 5,
  'Sgt at Arms': 6,
  'Road Captain': 7,
  Historian: 8,
  Chaplain: 9,
  'Past Director': 10,
}

async function GetHandle(req: NextApiRequest, res: NextApiResponse<Member[]>) {
  const session = await getServerSession(req, res, authOptions)
  const officers = await getMembersBy((member) => !!member.office)

  officers.sort((a, b) => {
    if (!a.office || !b.office) return 0

    if (OFFICER_ORDER[a.office] <= OFFICER_ORDER[b.office]) return -1
    if (OFFICER_ORDER[a.office] > OFFICER_ORDER[b.office]) return 1

    return 0
  })

  if (session) return res.status(200).json(officers)

  return res.status(200).json(officers.map(memberToUnAuthMember))
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
