import { getFolderContents } from '@/lib/drive'
import HttpError from '@/lib/http-error'
import { drive_v3 } from 'googleapis'
import { NextApiRequest, NextApiResponse } from 'next'

async function GetHandle(
  req: NextApiRequest,
  res: NextApiResponse<drive_v3.Schema$FileList | undefined>,
) {
  const { fileId } = req.query
  const folders = await getFolderContents(!Array.isArray(fileId) ? fileId : fileId[0])

  return folders
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
