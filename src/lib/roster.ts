import { ACTIVE_MEMERB_ROLES } from '@/utils/constants'
import { GoogleSpreadsheet, GoogleSpreadsheetRow } from 'google-spreadsheet'
import moment from 'moment'
import type { Member } from '@/types/common'

async function getRows() {
  const doc = new GoogleSpreadsheet(process.env.ROSTER_SPREADSHEET_KEY)

  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
  })
  await doc.loadInfo()

  const worksheet = doc.sheetsById[process.env.ROSTER_SHEET_KEY]
  const rows = await worksheet.getRows()

  return rows
}

function rowToMember(r: GoogleSpreadsheetRow): Member {
  const now = moment()
  const cutOffYear = now.month() === 0 ? now.year() - 1 : now.year()
  const lastPaid = r.lastPaidDues ? parseInt(r.lastPaidDues) : undefined

  return {
    id: r.id,
    email: r.email || undefined,
    entity: r.entity ? r.entity.split(',') : undefined,
    firstName: r.firstName,
    image: r.image || undefined,
    isActive: ACTIVE_MEMERB_ROLES.indexOf(r.role) !== -1,
    isLifeTimeMember: r.lifttimeMember === 'TRUE',
    isPastPresident: r.pastPresident === 'TRUE',
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
  const rows = await getRows()
  const members = rows.map(rowToMember)

  if (filter) return members.filter(filter)

  return members
}
export async function findMember(filter: (row: Member) => boolean) {
  const rows = await getRows()
  const members: Member[] = rows.map(rowToMember)

  return members.find(filter)
}
export async function updateMember(m: Member) {
  const rows = await getRows()

  const r = rows.find((r) => r.id === m.id)

  if (r) {
    r.firstName = m.firstName
    r.lastName = m.lastName
    r.suffix = m.suffix
    r.nickname = m.nickName
    r.office = m.office
    r.role = m.role
    r.phone = m.phoneNumber
    r.email = m.email
    r.memberId = m.membershipId
    r.entity = m.entity ? m.entity?.join(',') : ''
    r.joinDate = m.joined
    r.lifttimeMember = m.isLifeTimeMember ? 'TRUE' : 'FALSE'
    r.pastPresident = m.isPastPresident ? 'TRUE' : 'FALSE'
    r.rides = m.rides
    r.image = m.image

    await r.save()

    console.log({ first: r.firstName, last: r.lastName })

    return rowToMember(r)
  }
}
