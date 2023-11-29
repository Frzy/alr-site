import {
  ActivityLog,
  ActivityLogStats,
  BaseLog,
  GroupLogs,
  LogStats,
  LogsByMember,
} from '@/types/common'
import { ACTIVITY_TYPE, ACTIVITY_TYPES } from '@/utils/constants'
import { roundNumber } from '@/utils/helpers'
import { JWT } from 'google-auth-library'
import { GoogleSpreadsheet, GoogleSpreadsheetRow } from 'google-spreadsheet'
import moment from 'moment'

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
]

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

    groups[log.name].events = roundNumber(groups[log.name].events + 1)
    groups[log.name].hours = roundNumber(groups[log.name].hours + (log.hours || 0))
    groups[log.name].miles = roundNumber(groups[log.name].miles + (log.miles || 0))
    groups[log.name].breakdown[log.activityType].events = roundNumber(
      groups[log.name].breakdown[log.activityType].events + 1,
    )
    groups[log.name].breakdown[log.activityType].hours = roundNumber(
      groups[log.name].breakdown[log.activityType].hours + (log.hours || 0),
    )
    groups[log.name].breakdown[log.activityType].miles = roundNumber(
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

function rowToActivityLog(r: GoogleSpreadsheetRow, index: number): ActivityLog {
  const log = {
    id: index,
    date: moment(r.get('finalDate'), 'M/D/YYYY H:mm:ss').format(),
    name: r.get('Name'),
    activityName: r.get('Activity'),
    activityType: r.get('Activity Type'),
    hours: r.get('Hours') ? roundNumber(parseFloat(r.get('Hours'))) : 0,
    monies: r.get('Monies') ? roundNumber(parseFloat(r.get('Monies').replace('$', ''))) : undefined,
    miles: r.get('Miles') ? roundNumber(parseFloat(r.get('Miles'))) : undefined,
    created: moment(r.get('Timestamp'), 'M/D/YYYY H:mm:ss').format(),
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

export async function getActivityLogEntries(filter?: (log: ActivityLog) => boolean) {
  const jwt = new JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: SCOPES,
  })
  const doc = new GoogleSpreadsheet(process.env.ACTIVITY_LOG_SPREADSHEET_KEY, jwt)

  await doc.loadInfo()
  const worksheet = doc.sheetsById[process.env.ACTIVITY_LOG_DATA_SHEET_KEY]

  const rows = await worksheet.getRows()

  const logs = rows
    .filter((r) => {
      return !!r.get('Activity') && !!r.get('Activity Type') && !!r.get('Hours')
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
  const jwt = new JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: SCOPES,
  })
  const doc = new GoogleSpreadsheet(process.env.ACTIVITY_LOG_SPREADSHEET_KEY, jwt)

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
  const latestEntries = [...logs]
    .sort((a, b) => {
      const firstDate = moment(a.created)
      const secondDate = moment(b.created)

      if (firstDate.isBefore(secondDate)) return -1

      if (firstDate.isAfter(secondDate)) return 1

      return 0
    })
    .slice(-5)

  const stats = groups.reduce(
    (cur, next) => {
      cur.events = roundNumber(cur.events + next.events)
      cur.hours = roundNumber(cur.hours + next.hours)
      cur.miles = roundNumber(cur.miles + next.miles)

      for (let [key, value] of Object.entries(next.breakdown)) {
        const bKey = key as ACTIVITY_TYPE

        cur.breakdown[bKey].events = roundNumber(cur.breakdown[bKey].events + value.events)
        cur.breakdown[bKey].hours = roundNumber(cur.breakdown[bKey].hours + value.hours)
        cur.breakdown[bKey].miles = roundNumber(cur.breakdown[bKey].miles + value.miles)
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

export async function addActivityLogEntries(rows: any[]) {
  const jwt = new JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: SCOPES,
  })
  const doc = new GoogleSpreadsheet(process.env.COMBINED_ACTIVITY_LOG_SPREADSHEET_KEY, jwt)

  await doc.loadInfo()

  const worksheet = doc.sheetsById[process.env.COMBINED_ACTIVITY_LOG_SHEET_KEY]

  await worksheet.addRows(rows)
}
