import { authOptions } from '@/lib/auth'
import { createMember, getMembersBy, memberToUnAuthMember } from '@/lib/roster'
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import type { Member } from '@/types/common'
import HttpError from '@/lib/http-error'

async function GetHandle(req: NextApiRequest, res: NextApiResponse<Member[]>) {
  const session = await getServerSession(req, res, authOptions)
  const memebrs = await getMembersBy()

  memebrs.sort((a, b) => a.name.localeCompare(b.name))

  return session ? memebrs : memebrs.map(memberToUnAuthMember)
}

async function PostHandle(req: NextApiRequest, res: NextApiResponse<Member>) {
  const session = await getServerSession(req, res, authOptions)
  const member = req.body as Member

  if (!session?.user) throw new HttpError(401, 'Unauthorized')
  if (!session.user.office) throw new HttpError(403, 'Forbidden')

  return await createMember(member)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    let response

    switch (req.method) {
      case 'GET':
        response = await GetHandle(req, res)

        res.setHeader('Content-Type', 'application/json')
        res.status(200)
        res.end(JSON.stringify(response))
        break
      case 'POST':
        response = await PostHandle(req, res)

        res.setHeader('Content-Type', 'application/json')
        res.status(201)
        res.end(JSON.stringify(response))
        break
      default:
        throw new HttpError(405, 'Method Not Allowed')
    }
  } catch (error) {
    res.json(error)
    res.status(error instanceof HttpError ? error.status : 400).end()
  }
}
