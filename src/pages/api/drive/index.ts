import { getFolderContents } from '@/lib/drive'
import { drive_v3 } from 'googleapis'
import { NextApiRequest, NextApiResponse } from 'next'

async function GetHandle(
  req: NextApiRequest,
  res: NextApiResponse<drive_v3.Schema$FileList | undefined>,
) {
  const { fileId } = req.query
  const folders = await getFolderContents(!Array.isArray(fileId) ? fileId : fileId[0])

  return res.status(200).json(folders)
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
