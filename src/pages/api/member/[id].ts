import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { findMember, memberToUnAuthMember, updateMember } from '@/lib/roster'
import { NextApiRequest, NextApiResponse } from 'next'

import type { Member } from '@/types/common'
import type { Api } from '@/types/api'

async function GetHandle(req: NextApiRequest, res: NextApiResponse<Member | Api.Error>) {
  const session = await getServerSession(req, res, authOptions)
  const { id } = req.query
  const member = await findMember((m) => m.id === id)

  if (!member) return res.status(404).json({ code: 404, message: 'member not found' })

  return res.status(200).json(session ? member : memberToUnAuthMember(member))
}

async function PutHandle(req: NextApiRequest, res: NextApiResponse<Member | Api.Error>) {
  const session = await getServerSession(req, res, authOptions)
  const { body } = req
  try {
    const member = await updateMember(body)

    if (member) {
      res.status(200).json(member)
    } else {
      res.status(400).json({ code: 400, message: 'Unable to update member.' })
    }
    return
  } catch (e) {
    res.status(400).json({ code: 400, message: 'Unable to update member.' })
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      GetHandle(req, res)
      break
    case 'PUT':
      PutHandle(req, res)
      break
    default:
      res.status(405).json(undefined)
  }
}
