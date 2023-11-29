import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { findMember, memberToUnAuthMember, updateMember } from '@/lib/roster'
import { NextApiRequest, NextApiResponse } from 'next'

import type { Member } from '@/types/common'
import type { Api } from '@/types/api'
import HttpError from '@/lib/http-error'

async function GetHandle(req: NextApiRequest, res: NextApiResponse<Member | Api.Error>) {
  const session = await getServerSession(req, res, authOptions)
  const { id } = req.query
  const member = await findMember((m) => m.id === id)

  if (!member) throw new HttpError(404, 'Member not found')

  return session ? member : memberToUnAuthMember(member)
}

async function PutHandle(req: NextApiRequest, res: NextApiResponse<Member | Api.Error>) {
  const session = await getServerSession(req, res, authOptions)
  const body: Member = req.body

  if (!session?.user) throw new HttpError(401, 'Unauthinticated')

  if (body.id !== session.user.id && !session.user.office)
    throw new HttpError(401, 'Permission Denied')

  try {
    const member = await updateMember(body)

    if (!member) throw new HttpError(400, 'Unable to update member')

    return member
  } catch (e) {
    throw new HttpError(400, 'Unable to update member')
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    let response

    switch (req.method) {
      case 'GET':
        response = await GetHandle(req, res)
        break
      case 'PUT':
        response = await PutHandle(req, res)
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
