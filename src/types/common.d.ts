import { ACTIVITY_TYPE, ENTITY, OFFICER_POSITION } from '@/utils/constants'
import { Moment } from 'moment'

export type Member = {
  id: string
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

export type ActivityLog = {
  id: number
  date: string
  name: string
  activityName: string
  activityType: ACTIVITY_TYPE
  hours?: number
  monies?: number
  miles?: number
}
