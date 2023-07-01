import { ActivityLog, BaseLog, GroupLogs } from '@/types/common'
import { ACTIVITY_TYPE, ACTIVITY_TYPES } from '@/utils/constants'
import { GoogleSpreadsheet, GoogleSpreadsheetRow } from 'google-spreadsheet'

const BASE_STATS: BaseLog = {
  miles: 0,
  hours: 0,
  events: 0,
}
function getBaseGroupLog() {
  return {
    breakdown: ACTIVITY_TYPES.reduce((acc, curr) => {
      acc[curr] = { ...BASE_STATS }

      return acc
    }, {} as { [key in ACTIVITY_TYPE]: BaseLog }),
    ...BASE_STATS,
  }
}

function rowToActivityLog(r: GoogleSpreadsheetRow, index: number): ActivityLog {
  const log = {
    id: index,
    date: r.date,
    name: r.name,
    activityName: r.activity,
    activityType: r.activityType,
    hours: r.hours ? parseFloat(r.hours) : undefined,
    monies: r.monies ? parseFloat(r.monies.replace('$', '')) : undefined,
    miles: r.miles ? parseFloat(r.miles) : undefined,
  }

  Object.keys(log).forEach(
    (key) => log[key as keyof ActivityLog] === undefined && delete log[key as keyof ActivityLog],
  )

  return log
}

export function convertToPublicActivityLog(log: ActivityLog) {
  const { monies, ...publicLog } = log

  return publicLog
}

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

export async function getActivityLogEntries(filter?: (log: ActivityLog) => boolean) {
  const doc = new GoogleSpreadsheet(process.env.ACTIVITY_LOG_SPREADSHEET_KEY)

  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
  })
  await doc.loadInfo()
  const worksheet = doc.sheetsById[process.env.ACTIVITY_LOG_DATA_SHEET_KEY]

  const rows = await worksheet.getRows()

  const logs = rows.map(rowToActivityLog)

  if (filter) return logs.filter(filter)

  return logs
}

export async function getActivityLogEntriesGroupedByPerson(filter?: (log: ActivityLog) => boolean) {
  const logs = await getActivityLogEntries(filter)

  return logs.reduce((groups, log) => {
    if (!groups[log.name]) {
      groups[log.name] = getBaseGroupLog()
    }

    groups[log.name].events += 1
    groups[log.name].hours += log.hours || 0
    groups[log.name].miles += log.miles || 0
    groups[log.name].breakdown[log.activityType].events += 1
    groups[log.name].breakdown[log.activityType].hours += log.hours || 0
    groups[log.name].breakdown[log.activityType].miles += log.miles || 0

    return groups
  }, {} as GroupLogs)
}

export async function udpateActivityLogName(oldName: string, newName: string) {
  const doc = new GoogleSpreadsheet(process.env.ACTIVITY_LOG_SPREADSHEET_KEY)

  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
  })
  await doc.loadInfo()
  const worksheet = doc.sheetsById[process.env.ACTIVITY_LOG_DATA_SHEET_KEY]

  await worksheet.loadCells('B:B')
  const stats = worksheet.cellStats

  for (let i = 0; i < stats.loaded; i++) {
    const cell = worksheet.getCell(i, 1)
    if (cell.value === oldName) cell.value = newName
  }

  await worksheet.saveUpdatedCells()
}
