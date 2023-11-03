import { google } from 'googleapis'

const driveId = "'1ntPtvsLt_eC5cI9iYNdQ0LzCjX-S_8ZD'"
const minutesFolder = "'1reBGWptQ3nP4hls_hAB33ItlTMCAxfZ6'"
const folder = "'application/vnd.google-apps.folder'"

export function getGoogleDriveApi() {
  const jwtClient = new google.auth.JWT(
    process.env.GOOGLE_CLIENT_EMAIL,
    undefined,
    process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/\\n/g, '\n'),
    ['https://www.googleapis.com/auth/drive'],
  )

  const driveApi = google.drive({ version: 'v3', auth: jwtClient })

  return driveApi
}

export async function test() {
  const api = getGoogleDriveApi()

  try {
    const response = await api.files.list({
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
      q: `${driveId} in parents`,
    })

    const { data: drives } = response

    console.log(drives)
  } catch (error) {
    console.log(error)
  }
}
