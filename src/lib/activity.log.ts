import { ENTITY, MEMBER_ROLE } from '@/utils/constants'
import { GoogleSpreadsheet, GoogleSpreadsheetRow } from 'google-spreadsheet'

export async function getActivityLogNames(filter?: (name: string) => boolean) {
  const doc = new GoogleSpreadsheet(process.env.ACTIVITY_LOG_SPREADSHEET_KEY)

  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
  })
  await doc.loadInfo()
  const worksheet = doc.sheetsById[process.env.ACTIVITY_LOG_VAR_SHEET_KEY]

  await worksheet.loadCells('A28:A')
  const names: string[] = []
  let index = 27
  let cell = worksheet.getCell(index, 0)

  while (cell.value) {
    names.push(cell.value as string)
    index += 1
    cell = worksheet.getCell(index, 0)
  }

  return names
}
