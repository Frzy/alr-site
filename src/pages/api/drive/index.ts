import { test } from '@/lib/drive'
import { getMembersBy, memberToUnAuthMember } from '@/lib/roster'
import { NextApiRequest, NextApiResponse } from 'next'

async function GetHandle(req: NextApiRequest, res: NextApiResponse<boolean>) {
  const roster = await test()

  return res.status(200).json(true)
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
