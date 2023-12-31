import type {
  EVENT_TYPE,
  ACTIVITY_TYPE,
  ENTITY,
  GOOGLE_MIME_TYPE,
  OFFICER_POSITION,
  RECURRENCE_MODE,
  ROLE,
  ROLES,
} from '@/utils/constants'
import type { AlertColor } from '@mui/material'
import type { Dayjs } from 'dayjs'
import type { calendar_v3 } from 'googleapis'

export interface Member {
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
  yearsActive: number | null
  lastPaidDues?: number
  username: string
  emergencyContacts: {
    name: string
    phone: string
  }[]
}

export interface MemberGoogleRow {
  memberId?: string
  office: OFFICER_POSITION | string
  role: ROLE | string
  id?: string
  phone?: string
  email?: string
  entity?: string
  joinDate?: string
  lastPaidDues?: string
  lifttimeMember: string
  pastPresident: string
  rides: string
  username: string
  firstName: string
  lastName: string
  suffix?: string
  nickname?: string
  image?: string
  eNameOne?: string
  eNameTwo?: string
  eNameThree?: string
  ePhoneOne?: string
  ePhoneTwo?: string
  ePhoneThree?: string
}

export interface Recurrence {
  FREQ?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
  COUNT?: string
  INTERVAL?: string
  UNTIL?: string
  BYDAY?: string
}

export interface RecurrenceOptions {
  mode: RECURRENCE_MODE
}

export interface BaseLog {
  miles: number
  hours: number
  events: number
}

export type GroupLogs = Record<string, LogStats>

export type LogsByMember = {
  name: string
  member: Member
} & LogStats

export type LogStats = {
  breakdown: {
    [key in ACTIVITY_TYPE]: BaseLog
  }
} & BaseLog

export interface ActivityLog {
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

export interface IServerCalendarEvent {
  _event?: calendar_v3.Schema$Event
  _recurrenceEvent?: calendar_v3.Schema$Event
  color: CALENDAR_COLOR
  dayNumber?: number
  dayTotal: number
  description?: string
  endDate: string
  eventType: EVENT_TYPE
  id: string
  isAllDayEvent: boolean
  isMultipleDayEvent: boolean
  isPastEvent: boolean
  ksu?: string
  location?: string
  miles?: number
  muster?: string
  musterLocation?: string
  originalStartDate?: string
  recurrence?: string[] | null
  startDate: string
  summary?: string
  textColor: '#000' | '#FFF'
}
export interface ICalendarEvent extends IServerCalendarEvent {
  endDate: Dayjs
  startDate: Dayjs
  originalStartDate?: Dayjs
  ksu?: Dayjs
  muster?: Dayjs
  isNew?: boolean
  _renderIndex: number
}

export interface IRequestBodyCalendarEvent {
  colorId?: calendar_v3.Schema$Event.colorId
  description?: calendar_v3.Schema$Event.description
  end: calendar_v3.Schema$Event.end
  extendedProperties?: calendar_v3.Schema$Event.extendedProperties
  location?: calendar_v3.Schema$Event.location
  recurrence?: calendar_v3.Schema$Event.recurrence
  start: calendar_v3.Schema$Event.start
  summary?: calendar_v3.Schema$Event.summary
}

export interface NotifierState {
  open: boolean
  message: string
  severity: AlertColor
}

export interface ActivityLogStats {
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

export type ObjectFromList<T extends readonly string[], V = string> = {
  [K in T extends readonly (infer U)[] ? U : never]: V
}

export interface GoogleDriveFolderList {
  files: GoogleDriveItem[]
  incompleteSearch: boolean
  kind: string
}

export interface GoogleDriveItem {
  id: string
  kind: string
  mimeType: GOOGLE_MIME_TYPE
  name: string
  iconLink: string
  shortcutDetails?: {
    targetId: string
    targetMimeType: string
  }
}

export interface AtRiskMember {
  eligible: boolean
  events: number
  member: Member
  rides: number
}

export interface Notification {
  severity: AlertColor
  message: string
}

export type Mode = 'light' | 'dark' | 'system'
export type ListMode = 'list' | 'grid'
