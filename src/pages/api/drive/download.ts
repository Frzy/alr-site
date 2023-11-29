import { downloadFile, getFolderContents } from '@/lib/drive'
import HttpError from '@/lib/http-error'
import { drive_v3 } from 'googleapis'
import { NextApiRequest, NextApiResponse } from 'next'

async function GetHandle(req: NextApiRequest, res: NextApiResponse) {
  const { fileId } = req.query

  if (fileId) {
    const file = await downloadFile(!Array.isArray(fileId) ? fileId : fileId[0])

    if (file) return file
  }

  throw new HttpError(400, 'Invalid fileId query parameter')
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        const { data, details } = await GetHandle(req, res)
        res.status(200)
        res.setHeader('Content-Type', details.mimeType)
        res.setHeader('Content-Disposition', `attachment; filename=${details?.name ?? 'file'}.pdf`)
        res.setHeader('Content-Length', data.length)

        res.end(data)
        break
      default:
        throw new HttpError(405, 'Method Not Allowed')
    }
  } catch (error) {
    res.json(error)
    res.status(error instanceof HttpError ? error.status : 400).end()
  }
}
