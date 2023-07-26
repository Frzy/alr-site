import {
  ACTIVITY_TYPE,
  ENTITY,
  OFFICER_POSITION,
  RECURRENCE_MODE,
  ROLE,
  ROLES,
} from '@/utils/constants'
import { calendar_v3 } from 'googleapis'
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

export type Recurrence = {
  FREQ?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
  COUNT?: string
  INTERVAL?: string
  UNTIL?: string
  BYDAY?: string
}

export type RecurrenceOptions = {
  mode: RECURRENCE_MODE
  stopDate?: Moment
}

export type BaseLog = {
  miles: number
  hours: number
  events: number
}

export type GroupLogs = {
  [key: string]: LogStats
}

export type LogsByMember = {
  name: string
} & LogStats

export type LogStats = {
  breakdown: {
    [key in ACTIVITY_TYPE]: BaseLog
  }
} & BaseLog

export type ActivityLog = {
  id: number
  date: string
  name: string
  activityName: string
  activityType: ACTIVITY_TYPE
  hours?: number
  monies?: number
  miles?: number
  created: string
}

export type IServerCalendarEvent = {
  endDate: string
  eventType: EVENT_TYPE
  isAllDayEvent: boolean
  dayTotal: number
  isPastEvent: boolean
  startDate: string
  originalStartDate?: string
  dayNumber?: number
  color: CALENDAR_COLOR
  textColor: '#000' | '#FFF'
} & calendar_v3.Schema$Event

export type IRequestBodyCalendarEvent = {
  colorId?: calendar_v3.Schema$Event.colorId
  description?: calendar_v3.Schema$Event.description
  end?: calendar_v3.Schema$Event.end
  location?: calendar_v3.Schema$Event.location
  recurrence?: calendar_v3.Schema$Event.recurrence
  start?: calendar_v3.Schema$Event.start
  summary?: calendar_v3.Schema$Event.summary
  extendedProperties?: calendar_v3.Schema$Event.extendedProperties
}

export type ICalendarEvent = {
  endDate: Moment
  startDate: Moment
  originalStartDate?: Moment
  ksu?: Moment
  muster?: Moment
} & Omit<IServerCalendarEvent, 'endDate' | 'startDate' | 'originalStartDate'>

export type NotifierState = {
  open: boolean
  message: string
  severity: AlertColor
}

export type ActivityLogStats = {
  events: number
  hours: number
  miles: number
  breakdown: {
    [key in ACTIVITY_TYPE]: BaseLog
  }
  latestEntries: ActivityLog[]
  entriesByMember: LogsByMember[]
}

export type MembershipStats = ObjectFromList<typeof ROLES, number>

export type ObjectFromList<T extends ReadonlyArray<string>, V = string> = {
  [K in T extends ReadonlyArray<infer U> ? U : never]: V
}
