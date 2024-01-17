import type {
  ActivityLog,
  ActivityLogStats,
  BaseLog,
  GroupLogs,
  LogStats,
  LogsByMember,
  RawRowData,
  ServerMember,
} from '@/types/common'
import { type ACTIVITY_TYPE, ACTIVITY_TYPES } from '@/utils/constants'
import { formatNumber } from '@/utils/helpers'
import { JWT } from 'google-auth-library'
import { GoogleSpreadsheet, type GoogleSpreadsheetRow } from 'google-spreadsheet'
import { getMembersBy } from './member'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
dayjs.extend(customParseFormat)

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
]

const BASE_STATS: BaseLog = {
  miles: 0,
  hours: 0,
  events: 0,
}

function getBaseGroupLog(): LogStats {
  return {
    breakdown: ACTIVITY_TYPES.reduce(
      (acc, curr) => {
        acc[curr] = { ...BASE_STATS }

        return acc
      },
      // eslint-disable-next-line
      {} as Record<ACTIVITY_TYPE, BaseLog>,
    ),
    ...BASE_STATS,
  }
}
function groupLogsByMemberObject(logs: ActivityLog[]): GroupLogs {
  return logs.reduce((groups, log) => {
    if (!groups[log.name]) {
      groups[log.name] = getBaseGroupLog()
    }

    groups[log.name].events = formatNumber(groups[log.name].events + 1)
    groups[log.name].hours = formatNumber(groups[log.name].hours + (log.hours ?? 0))
    groups[log.name].miles = formatNumber(groups[log.name].miles + (log.miles ?? 0))
    groups[log.name].breakdown[log.activityType].events = formatNumber(
      groups[log.name].breakdown[log.activityType].events + 1,
    )
    groups[log.name].breakdown[log.activityType].hours = formatNumber(
      groups[log.name].breakdown[log.activityType].hours + (log.hours ?? 0),
    )
    groups[log.name].breakdown[log.activityType].miles = formatNumber(
      groups[log.name].breakdown[log.activityType].miles + (log.miles ?? 0),
    )

    return groups
    // eslint-disable-next-line
  }, {} as GroupLogs)
}

export async function groupLogsByMember(
  logs: ActivityLog[],
  memberFilter?: (member: ServerMember) => boolean,
): Promise<LogsByMember[]> {
  const groups = groupLogsByMemberObject(logs)
  const members = await getMembersBy(memberFilter)

  return members.map((member) => {
    const name = `${member.lastName}, ${member.firstName}`
    const stats = groups[name]

    if (stats) {
      return { ...stats, name, member }
    }

    return { ...getBaseGroupLog(), name, member }
  })
}

function rowToActivityLog(r: GoogleSpreadsheetRow, index: number): ActivityLog {
  const log = {
    id: index,
    date: dayjs(r.get('finalDate') as string, 'M/D/YYYY H:mm:ss').format(),
    name: r.get('Name'),
    activityName: r.get('Activity'),
    activityType: r.get('Activity Type'),
    hours: r.get('Hours') ? formatNumber(parseFloat(r.get('Hours') as string)) : 0,
    monies: r.get('Monies')
      ? formatNumber(parseFloat((r.get('Monies') as string).replace('$', '')))
      : undefined,
    miles: r.get('Miles') ? formatNumber(parseFloat(r.get('Miles') as string)) : undefined,
    created: dayjs(r.get('Timestamp') as string, 'M/D/YYYY H:mm:ss').format(),
  }

  Object.keys(log).forEach(
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    (key) => log[key as keyof ActivityLog] === undefined && delete log[key as keyof ActivityLog],
  )

  return log
}

export function convertToPublicActivityLog(log: ActivityLog): Omit<ActivityLog, 'monies'> {
  const { monies, ...publicLog } = log

  return publicLog
}

export async function getActivityLogEntries(
  filter?: (log: ActivityLog) => boolean,
): Promise<ActivityLog[]> {
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

export async function getActivityLogEntriesGroupedByPerson(
  filter?: (log: ActivityLog) => boolean,
): Promise<LogsByMember[]> {
  const logs = await getActivityLogEntries(filter)

  return await groupLogsByMember(logs)
}

export async function udpateActivityLogName(oldName: string, newName: string): Promise<void> {
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
  memberFilter?: (member: ServerMember) => boolean,
): Promise<ActivityLogStats> {
  const logs = await getActivityLogEntries(filter)
  const groups = await groupLogsByMember(logs, memberFilter)
  const latestEntries = [...logs]
    .sort((a, b) => {
      const firstDate = dayjs(a.created)
      const secondDate = dayjs(b.created)

      if (firstDate.isBefore(secondDate)) return -1

      if (firstDate.isAfter(secondDate)) return 1

      return 0
    })
    .slice(-5)

  const stats = groups.reduce(
    (cur, next) => {
      cur.events = formatNumber(cur.events + next.events)
      cur.hours = formatNumber(cur.hours + next.hours)
      cur.miles = formatNumber(cur.miles + next.miles)

      for (const [key, value] of Object.entries(next.breakdown)) {
        const bKey = key as ACTIVITY_TYPE

        cur.breakdown[bKey].events = formatNumber(cur.breakdown[bKey].events + value.events)
        cur.breakdown[bKey].hours = formatNumber(cur.breakdown[bKey].hours + value.hours)
        cur.breakdown[bKey].miles = formatNumber(cur.breakdown[bKey].miles + value.miles)
      }

      return cur
    },
    // eslint-disable-next-line
    {
      events: 0,
      miles: 0,
      hours: 0,
      breakdown: ACTIVITY_TYPES.reduce(
        (cur, event) => {
          cur[event] = { miles: 0, hours: 0, events: 0 }
          return cur
        },
        // eslint-disable-next-line
        {} as { [key in ACTIVITY_TYPE]: BaseLog },
      ),
    } as LogStats,
  )

  groups.sort((a, b) => a.member.name.localeCompare(b.member.name))

  return {
    latestEntries,
    entriesByMember: groups,
    ...stats,
  }
}

export async function addActivityLogEntries(rows: RawRowData[]): Promise<void> {
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
