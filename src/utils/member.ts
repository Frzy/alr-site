import type { Member } from '@/types/common'
import { OFFICER_ORDER } from './constants'
import { stringToColor, stripAllButNumbers } from './helpers'

export function officerSort(a: Member, b: Member): number {
  if (!a.office || !b.office) return 0

  if (OFFICER_ORDER[a.office] <= OFFICER_ORDER[b.office]) return -1
  if (OFFICER_ORDER[a.office] > OFFICER_ORDER[b.office]) return 1

  return 0
}

export function memberAvatar(member: Member): {
  sx: { bgcolor: string }
  children: string
  alt: string
} {
  return {
    sx: { bgcolor: stringToColor(member.name) },
    children: `${member.firstName.slice(0, 1)}${member.lastName.slice(0, 1)}`,
    alt: member.name,
  }
}

export function getFormatedPhoneNumber(phoneNumber: string): string {
  const pNumber = stripAllButNumbers(phoneNumber).split('')
  pNumber.splice(3, 0, '-')
  pNumber.splice(7, 0, '-')

  return pNumber.join('')
}

export function isMemberAdmin(member?: Member): boolean {
  return member ? !!member.office : false
}
