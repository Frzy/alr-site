import { ENTITY, OFFICER_POSITION } from '@/utils/constants'

export type Member = {
  id: string
  activityLogLink: string
  email?: string
  entity?: ENTITY[]
  firstName: string
  image?: string
  isActive: boolean
  isLifeTimeMember: boolean
  isPastPresident: boolean
  isRetired: boolean
  joined?: string
  lastName: string
  membershipId?: string
  name: string
  nickName?: string
  office?: OFFICER_POSITION
  phoneNumber?: string
  rides?: number
  role: MEMBER_ROLE
  suffix?: string
  yearsActive?: number
  username: string
}
