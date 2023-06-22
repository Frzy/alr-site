import { ENTITY, MEMBER_ROLE } from '@/utils/constants'
import { GoogleSpreadsheet, GoogleSpreadsheetRow } from 'google-spreadsheet'
import moment from 'moment'
import type { Member } from '@/types/common'

function rowToMember(r: GoogleSpreadsheetRow, index: number): Member {
  const now = moment()
  const cutOffYear = now.month() === 0 ? now.year() - 1 : now.year()
  const lastPaid = r.lastPaidDues ? parseInt(r.lastPaidDues) : undefined

  return {
    id: r.id,
    activityLogNames: r.activityLogNames ? r.activityLogNames.split(',') : [],
    email: r.email || undefined,
    entity: r.entity ? r.entity.split(',') : undefined,
    firstName: r.firstName,
    image: r.image || undefined,
    isActive: !!lastPaid && cutOffYear <= lastPaid,
    isLifeTimeMember: r.lifttimeMember === 'TRUE',
    isPastPresident: r.pastPresident === 'TRUE',
    isRetired: r.retiredMember === 'TRUE',
    joined: r.joinDate || undefined,
    lastName: r.lastName,
    membershipId: r.memberId,
    name: `${r.firstName} ${r.lastName}${r.suffix ? ` ${r.suffix}` : ''}`,
    nickName: r.nickname || undefined,
    office: r.office || undefined,
    phoneNumber: r.phone || undefined,
    rides: r.rides ? parseInt(r.rides) : undefined,
    role: r.role,
    suffix: r.suffix,
    username: `${r.firstName[0]}${r.lastName}`.toLowerCase().replace(/[^a-z]/gi, ''),
    yearsActive: r.yearsActive ? parseInt(r.yearsActive) : undefined,
  }
}
export function memberToUnAuthMember(member: Member): Member {
  const { phoneNumber, email, ...unAuthMember } = member

  return unAuthMember
}
export async function getAllMembers() {
  return await getMembersBy()
}
export async function getMembersBy(filter?: (member: Member) => boolean) {
  const doc = new GoogleSpreadsheet(process.env.ROSTER_SPREADSHEET_KEY)

  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
  })
  await doc.loadInfo()

  const worksheet = doc.sheetsById[process.env.ROSTER_SHEET_KEY]
  const rows = await worksheet.getRows()

  const members = rows.map(rowToMember)

  if (filter) return members.filter(filter)

  return members
}
export async function findMember(filter: (row: Member) => boolean) {
  const doc = new GoogleSpreadsheet(process.env.ROSTER_SPREADSHEET_KEY)

  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
  })
  await doc.loadInfo()
  const worksheet = doc.sheetsById[process.env.ROSTER_SHEET_KEY]
  const rows = await worksheet.getRows()

  const members: Member[] = rows.map(rowToMember)

  return members.find(filter)
}
