import { GOOGLE_MIME_TYPE } from '@/utils/constants'
import { google } from 'googleapis'

const driveId = '1-Drg76QaTAcjNbfbtwg7EiH2eurJ1cGV'

export function getGoogleDriveApi() {
  const jwtClient = new google.auth.JWT(
    process.env.GOOGLE_CLIENT_EMAIL,
    undefined,
    process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    ['https://www.googleapis.com/auth/drive'],
  )

  const driveApi = google.drive({ version: 'v3', auth: jwtClient })

  return driveApi
}

export async function getFolderContents(fileId = driveId) {
  const api = getGoogleDriveApi()

  try {
    const response = await api.files.list({
      fields: 'kind,incompleteSearch,files(kind,id,name,mimeType,shortcutDetails,iconLink)',
      q: `'${fileId}' in parents`,
    })

    const { data } = response

    data.files = data.files
      ?.filter((f) => {
        return !f.name?.startsWith('_') ?? false
      })
      .map((f) => {
        const file = { ...f }
        if (f.mimeType === GOOGLE_MIME_TYPE.SHORTCUT && file.mimeType && file.shortcutDetails) {
          file.iconLink = file.iconLink?.replace(
            file.mimeType,
            `${file.shortcutDetails?.targetMimeType}+shared` ?? '',
          )
          file.mimeType = file.shortcutDetails?.targetMimeType
          file.id = file.shortcutDetails.targetId
        }

        return file
      })

    return data
  } catch (error) {
    console.log(error)
  }
}

export async function getDetails(fileId: string) {
  const api = getGoogleDriveApi()

  try {
    const res = await api.files.get({
      fileId,
      fields: 'kind,id,name,mimeType,shortcutDetails',
    })

    return res.data
  } catch (error) {
    console.log(error)
  }
}

export async function downloadFile(fileId: string, mimeType = 'application/pdf') {
  const api = getGoogleDriveApi()

  try {
    const details = await getDetails(fileId)
    let data

    if (details?.mimeType?.indexOf('vnd.google-apps') === -1) {
      const res = await api.files.get({ fileId, alt: 'media' }, { responseType: 'arraybuffer' })

      return {
        data: Buffer.from(res.data as any),
        details: { mimeType: details.mimeType, name: details?.name },
      }
    } else {
      const res = await api.files.export(
        {
          fileId,
          mimeType,
        },
        { responseType: 'arraybuffer' },
      )

      return { data: Buffer.from(res.data as any), details: { mimeType, name: details?.name } }
    }
  } catch (error) {
    console.log(error)
  }
}
