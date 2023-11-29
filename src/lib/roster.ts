import { GoogleSpreadsheet, GoogleSpreadsheetRow } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'
import { MEMBER_ROLES } from '@/utils/constants'
import moment from 'moment'
import type { Member, MemberGoogleRow } from '@/types/common'

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
]

async function getRosterDoc() {
  const jwt = new JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/\\n/g, '\n'),
    scopes: SCOPES,
  })

  const doc = new GoogleSpreadsheet(process.env.ROSTER_SPREADSHEET_KEY, jwt)
  await doc.loadInfo()

  return doc
}

async function getRosterRows() {
  const doc = await getRosterDoc()

  const worksheet = doc.sheetsById[process.env.ROSTER_SHEET_KEY]
  const rows = await worksheet.getRows<MemberGoogleRow>()

  return rows
}

function getEmergencyContacts(r: GoogleSpreadsheetRow<MemberGoogleRow>) {
  const eNameOne: string = r.get('eNameOne')
  const eNameTwo: string = r.get('eNameTwo')
  const eNameThree: string = r.get('eNameThree')
  const ePhoneOne: string = r.get('ePhoneOne')
  const ePhoneTwo: string = r.get('ePhoneTwo')
  const ePhoneThree: string = r.get('ePhoneThree')
  const contacts = []

  if (eNameOne && ePhoneOne) contacts.push({ name: eNameOne, phone: ePhoneOne })
  if (eNameTwo && ePhoneTwo) contacts.push({ name: eNameTwo, phone: ePhoneTwo })
  if (eNameThree && ePhoneThree) contacts.push({ name: eNameThree, phone: ePhoneThree })

  for (let i = contacts.length - 1; i < 2; i++) {
    contacts.push({ name: '', phone: '' })
  }

  return contacts
}
function getLastPaidDues(lastPaidDues: string, isLifeTimeMember: boolean, isActive: boolean) {
  const dueYear = parseInt(lastPaidDues)

  if (isNaN(dueYear)) return null

  if (isLifeTimeMember && isActive) {
    const now = moment()

    return now.year() + (now.month() >= 10 ? 1 : 0)
  }

  return dueYear
}

function rowToMember(r: GoogleSpreadsheetRow<MemberGoogleRow>): Member {
  const isLifeTimeMember = r.get('lifttimeMember') === 'TRUE'
  const isActive = MEMBER_ROLES.indexOf(r.get('role')) !== -1
  const lastPaidDues = getLastPaidDues(r.get('lastPaidDues'), isLifeTimeMember, isActive)
  const joined = !!r.get('joinDate') ? moment(r.get('joinDate'), 'M/D/YYYY').year() : null
  const yearsActive = lastPaidDues && joined ? lastPaidDues - joined : null

  return {
    id: r.get('id'),
    email: r.get('email'),
    entity: r.get('entity') ? r.get('entity').split(',') : r.get('entity'),
    firstName: r.get('firstName'),
    image: r.get('image') || '',
    isActive,
    isLifeTimeMember,
    isPastPresident: r.get('pastPresident') === 'TRUE',
    joined: r.get('joinDate'),
    lastPaidDues: lastPaidDues ? lastPaidDues : r.get('lastPaidDues'),
    lastName: r.get('lastName'),
    membershipId: r.get('memberId'),
    name: `${r.get('firstName')} ${r.get('lastName')}${
      r.get('suffix') ? ` ${r.get('suffix')}` : ''
    }`,
    nickName: r.get('nickname') || '',
    office: r.get('office') || '',
    phoneNumber: r.get('phone') || '',
    rides: r.get('rides') ? parseInt(r.get('rides')) : r.get('rides'),
    role: r.get('role'),
    suffix: r.get('suffix') || '',
    username: r.get('username'),
    yearsActive,
    emergencyContacts: getEmergencyContacts(r),
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
  const rows = await getRosterRows()
  const members = rows.map(rowToMember)

  if (filter) return members.filter(filter)

  return members
}
export async function findMember(filter: (row: Member) => boolean) {
  const rows = await getRosterRows()
  const members: Member[] = rows.map(rowToMember)

  return members.find(filter)
}
export async function updateMember(m: Member) {
  const rows = await getRosterRows()

  const r = rows.find((r) => r.get('id') === m.id)

  const data = {
    firstName: m.firstName,
    lastName: m.lastName,
    suffix: m.suffix,
    nickname: m.nickName,
    office: m.office,
    role: m.role,
    phone: m.phoneNumber ? m.phoneNumber.replace(/\D/g, '') : m.phoneNumber,
    email: m.email,
    memberId: m.membershipId,
    entity: m.entity ? m.entity?.join(',') : '',
    joinDate: m.joined,
    lastPaidDues: m.lastPaidDues ? `${m.lastPaidDues}` : '',
    lifttimeMember: m.isLifeTimeMember ? 'TRUE' : '',
    pastPresident: m.isPastPresident ? 'TRUE' : '',
    rides: m.rides ? `${m.rides}` : '',
    image: m.image,
    username: m.username,
    eNameOne: '',
    ePhoneOne: '',
    eNameTwo: '',
    ePhoneTwo: '',
    eNameThree: '',
    ePhoneThree: '',
  }

  m.emergencyContacts.forEach((contact, i) => {
    switch (i) {
      case 0:
        data.eNameOne = contact.name
        data.ePhoneOne = contact.phone
        break
      case 1:
        data.eNameTwo = contact.name
        data.ePhoneTwo = contact.phone
        break
      case 2:
        data.eNameThree = contact.name
        data.ePhoneThree = contact.phone
        break
    }
  })

  if (r) {
    r.assign(data)

    await r.save()

    return rowToMember(r)
  }
}

export async function getNextAlrIDNumber() {
  const doc = await getRosterDoc()
  const sheet = doc.sheetsById[process.env.ROSTER_DATA_SHEET_KEY]

  await sheet.loadCells('F1:F2')

  const nextIdCell = sheet.getCellByA1('F2')

  return nextIdCell.value as string
}
