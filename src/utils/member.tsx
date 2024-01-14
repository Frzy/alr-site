import type { Member, SessionUser } from '@/types/common'
import { OFFICER_ORDER, ROLE } from './constants'
import { stringToColor, stripAllButNumbers } from './helpers'

import RiderIcon from '@mui/icons-material/TwoWheeler'
import ProsectIcon from '@mui/icons-material/Moped'
import SupporterCandiateIcon from '@mui/icons-material/FavoriteBorder'
import SupporterIcon from '@mui/icons-material/Favorite'
import RetiredIcon from '@mui/icons-material/Elderly'
import FounderIcon from '@mui/icons-material/SelfImprovement'
import CharterIcon from '@mui/icons-material/Star'
import DefaultIcon from '@mui/icons-material/Person'
import { type SvgIconProps } from '@mui/material'

export function memberToSessionUser(member: Member): SessionUser {
  const { id, image, milesToPost, firstName, lastName, suffix, email } = member

  return {
    id,
    email,
    image,
    milesToPost,
    name: `${firstName} ${lastName}${suffix ? ` ${suffix}` : ''}`,
    isAdmin: isMemberAdmin(member),
  }
}

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

export function getMemberIcon(member: Member, iconProps?: SvgIconProps): JSX.Element {
  switch (member.role) {
    case ROLE.CHARTER:
      return <CharterIcon {...iconProps} />
    case ROLE.MEMBER:
      return <RiderIcon {...iconProps} />
    case ROLE.PROSPECT:
      return <ProsectIcon {...iconProps} />
    case ROLE.SUPPORTER:
      return <SupporterIcon {...iconProps} />
    case ROLE.CANIDATE_SUPPORTER:
      return <SupporterCandiateIcon {...iconProps} />
    case ROLE.RETIRED:
      return <RetiredIcon {...iconProps} />
    case ROLE.FOUNDER:
      return <FounderIcon {...iconProps} />
    default:
      return <DefaultIcon {...iconProps} />
  }
}

export const MEMBER_JOINED_FORMAT = 'MM-DD-YYYY'
