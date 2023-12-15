import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { getNextAlrIDNumber } from '@/lib/roster'
import { NextApiRequest, NextApiResponse } from 'next'

import type { Member } from '@/types/common'
import type { Api } from '@/types/api'
import HttpError from '@/lib/http-error'

type NextIdResponse = {
  nextId: string
}

async function GetHandle(req: NextApiRequest, res: NextApiResponse<NextIdResponse | Api.Error>) {
  const session = await getServerSession(req, res, authOptions)

  if (!session) throw new HttpError(403, 'Not Authorized')

  const nextId = await getNextAlrIDNumber()

  return nextId
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
