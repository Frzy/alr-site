import { downloadFile, getFolderContents } from '@/lib/drive'
import { drive_v3 } from 'googleapis'
import { NextApiRequest, NextApiResponse } from 'next'

async function GetHandle(req: NextApiRequest, res: NextApiResponse) {
  const { fileId } = req.query

  if (fileId) {
    const file = await downloadFile(!Array.isArray(fileId) ? fileId : fileId[0])

    if (file) {
      const { data, details } = file
      res.status(200)
      res.setHeader('Content-Type', details.mimeType ?? 'application/json')
      res.setHeader('Content-Length', data.length)

      return res.end(data)
    }
  }

  return res.status(400).json({ errorCode: 400, message: 'Invalid fileId query parameter' })
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
