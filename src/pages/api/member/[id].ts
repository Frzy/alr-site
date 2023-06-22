import { authOptions } from '@/lib/auth'
import { findMember, memberToUnAuthMember } from '@/lib/spreadsheet'
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'

import type { Member } from '@/types/common'
import type { Api } from '@/types/api'

async function GetHandle(req: NextApiRequest, res: NextApiResponse<Member | Api.Error>) {
  const session = await getServerSession(req, res, authOptions)
  const { id } = req.query
  const member = await findMember((m) => m.id === id)

  if (!member) return res.status(404).json({ code: 404, message: 'member not found' })

  return res.status(200).json(session ? member : memberToUnAuthMember(member))
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
