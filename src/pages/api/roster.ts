import { authOptions } from '@/lib/auth'
import { getMembersBy, memberToUnAuthMember } from '@/lib/spreadsheet'
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import type { Member } from '@/types/common'

async function GetHandle(req: NextApiRequest, res: NextApiResponse<Member[]>) {
  const session = await getServerSession(req, res, authOptions)
  const roster = await getMembersBy()

  roster.sort((a, b) => {
    if (!a.name || !b.name) return 0

    if (a.name <= b.name) return -1
    if (a.name > b.name) return 1

    return 0
  })

  if (session) return res.status(200).json(roster)

  return res.status(200).json(roster.map(memberToUnAuthMember))
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
