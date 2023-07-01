import { ACTIVITY_TYPE, ENTITY, OFFICER_POSITION, ROLE } from '@/utils/constants'
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
  joined?: string
  lastName: string
  membershipId?: string
  name: string
  nickName?: string
  office?: OFFICER_POSITION
  phoneNumber?: string
  rides?: number
  role: ROLE
  suffix?: string
  yearsActive?: number
  username: string
}

export type BaseLog = {
  miles: number
  hours: number
  events: number
}

export type GroupLogs = {
  [key: string]: BaseLog & {
    breakdown: {
      [key in ACTIVITY_TYPE]: BaseLog
    }
  }
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
