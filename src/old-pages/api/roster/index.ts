import { authOptions } from '@/lib/auth'
import { getMembersBy, memberToUnAuthMember } from '@/lib/roster'
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import type { Member } from '@/types/common'
import HttpError from '@/lib/http-error'

async function GetHandle(req: NextApiRequest, res: NextApiResponse<Member[]>) {
  const session = await getServerSession(req, res, authOptions)
  const roster = await getMembersBy()

  roster.sort((a, b) => {
    if (!a.name || !b.name) return 0

    if (a.name <= b.name) return -1
    if (a.name > b.name) return 1

    return 0
  })

  return session ? roster : roster.map(memberToUnAuthMember)
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

    res.setHeader('Content-Type', 'application/json')
    res.status(200)
    res.end(JSON.stringify(response))
  } catch (error) {
    res.json(error)
    res.status(error instanceof HttpError ? error.status : 400).end()
  }
}
