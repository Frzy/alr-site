import {
  ActivityLog,
  ActivityLogStats,
  BaseLog,
  GroupLogs,
  LogStats,
  LogsByMember,
} from '@/types/common'
import { ACTIVITY_TYPE, ACTIVITY_TYPES } from '@/utils/constants'
import { GoogleSpreadsheet, GoogleSpreadsheetRow } from 'google-spreadsheet'
import moment from 'moment'

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
function groupLogsByMember(logs: ActivityLog[]) {
  return logs.reduce((groups, log) => {
    if (!groups[log.name]) {
      groups[log.name] = getBaseGroupLog()
    }

    groups[log.name].events = roundToTenth(groups[log.name].events + 1)
    groups[log.name].hours = roundToTenth(groups[log.name].hours + (log.hours || 0))
    groups[log.name].miles = roundToTenth(groups[log.name].miles + (log.miles || 0))
    groups[log.name].breakdown[log.activityType].events = roundToTenth(
      groups[log.name].breakdown[log.activityType].events + 1,
    )
    groups[log.name].breakdown[log.activityType].hours = roundToTenth(
      groups[log.name].breakdown[log.activityType].hours + (log.hours || 0),
    )
    groups[log.name].breakdown[log.activityType].miles = roundToTenth(
      groups[log.name].breakdown[log.activityType].miles + (log.miles || 0),
    )

    return groups
  }, {} as GroupLogs)
}

function groupLogsByMemberInArray(logs: ActivityLog[]): LogsByMember[] {
  const groups = groupLogsByMember(logs)
  const groupArray = []

  for (let [key, value] of Object.entries(groups)) {
    groupArray.push({ ...value, name: key })
  }

  return groupArray
}
function roundToTenth(num: number, decimail = 1) {
  const dec = decimail * 10
  return Math.floor(num) + Math.round((num % 1) * dec) / dec
}
function rowToActivityLog(r: GoogleSpreadsheetRow, index: number): ActivityLog {
  const log = {
    id: index,
    date: moment(r.date).format(),
    name: r.name,
    activityName: r.activity,
    activityType: r.activityType,
    hours: r.hours ? roundToTenth(parseFloat(r.hours)) : undefined,
    monies: r.monies ? roundToTenth(parseFloat(r.monies.replace('$', ''))) : undefined,
    miles: r.miles ? roundToTenth(parseFloat(r.miles)) : undefined,
    created: moment(r.timestamp).format(),
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

  const logs = rows
    .filter((r) => {
      return !!r.activity && !!r.activityType && !!r.hours
    })
    .map(rowToActivityLog)

  if (filter) return logs.filter(filter)

  return logs
}

export async function getActivityLogEntriesGroupedByPerson(filter?: (log: ActivityLog) => boolean) {
  const logs = await getActivityLogEntries(filter)

  return groupLogsByMember(logs)
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

export async function getActivityLogStats(
  filter?: (log: ActivityLog) => boolean,
): Promise<ActivityLogStats> {
  const logs = await getActivityLogEntries(filter)
  const groups = groupLogsByMemberInArray(logs)
  const latestEntries = logs.slice(-5).reverse()

  const stats = groups.reduce(
    (cur, next) => {
      cur.events = roundToTenth(cur.events + next.events)
      cur.hours = roundToTenth(cur.hours + next.hours)
      cur.miles = roundToTenth(cur.miles + next.miles)

      for (let [key, value] of Object.entries(next.breakdown)) {
        const bKey = key as ACTIVITY_TYPE

        cur.breakdown[bKey].events = roundToTenth(cur.breakdown[bKey].events + value.events)
        cur.breakdown[bKey].hours = roundToTenth(cur.breakdown[bKey].hours + value.hours)
        cur.breakdown[bKey].miles = roundToTenth(cur.breakdown[bKey].miles + value.miles)
      }

      return cur
    },
    {
      events: 0,
      miles: 0,
      hours: 0,
      breakdown: ACTIVITY_TYPES.reduce((cur, event) => {
        cur[event] = { miles: 0, hours: 0, events: 0 }
        return cur
      }, {} as { [key in ACTIVITY_TYPE]: BaseLog }),
    } as LogStats,
  )

  groups.sort((a, b) => a.name.localeCompare(b.name))

  return {
    latestEntries,
    entriesByMember: groups,
    ...stats,
  }
}
