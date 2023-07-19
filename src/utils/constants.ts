import { IRequestBodyCalendarEvent } from '@/types/common'
import { orange, teal, cyan } from '@mui/material/colors'

export enum OFFICER_POSITION {
  DIRECTOR = 'Director',
  VICE_DIRECTOR = 'Vice Director',
  JR_VICE = 'Jr Vice',
  SECRETARY = 'Secretary',
  TREASURER = 'Treasurer',
  SGT_AT_ARMS = 'Sgt at Arms',
  ROAD_CAPTAIN = 'Road Captain',
  HISTORIAN = 'Historian',
  CHAPLAIN = 'Chaplain',
  PAST_DIRECTOR = 'Past Director',
}
export const OFFICES = Object.values(OFFICER_POSITION)

export enum ROLE {
  ABANDONED = 'Abandoned',
  CHARTER = 'Charter Member',
  DISCHARGED = 'Discharged',
  FOUNDER = 'Founder',
  MEMBER = 'Member',
  PAST_MEMBER = 'Past Member',
  PAST_SUPPORTER = 'Past Supporter',
  PROSPECT = 'Canidate',
  RETIRED = 'Retiree',
  SUPPORTER = 'Supporter',
}
export const ROLES = Object.values(ROLE)
export const MEMBER_ROLES = [ROLE.CHARTER, ROLE.MEMBER, ROLE.SUPPORTER]
export const ACTIVE_ROLES = [ROLE.CHARTER, ROLE.MEMBER, ROLE.PROSPECT, ROLE.SUPPORTER]
export enum ENTITY {
  LEGION = 'AL',
  SAL = 'SAL',
  AUXILIARY = 'AUX',
}
export const ENTITIES = Object.values(ENTITY)
export const ENTITY_OBJECTS = ENTITIES.map((e) => {
  switch (e) {
    case ENTITY.LEGION:
      return {
        value: ENTITY.LEGION,
        label: 'American Legion',
        short: 'Legion',
        color: {
          background: 'rgb(0, 0, 0)',
          text: '#FFF',
        },
      }
    case ENTITY.SAL:
      return {
        value: ENTITY.SAL,
        label: 'Sons of the American Legion',
        short: 'Sons',
        color: {
          background: 'rgb(8, 107, 173)',
          text: '#FFF',
        },
      }
    case ENTITY.AUXILIARY:
      return {
        value: ENTITY.AUXILIARY,
        label: 'American Legion Auxiliary',
        short: 'Auxiliary',
        color: {
          background: 'rgb(173, 0, 0)',
          text: '#FFF',
        },
      }
  }
})
export const ENTITY_COLORS = ENTITY_OBJECTS.reduce((a, b) => {
  a[b.value] = b.color

  return a
}, {} as { [key in ENTITY]: { background: string; text: string } })
export enum ACTIVITY_TYPE {
  EVENT = 'Event',
  MEETING = 'Meeting',
  OTHER = 'Other',
  RIDE = 'Ride',
}
export const ACTIVITY_TYPES = Object.values(ACTIVITY_TYPE)
export enum EVENT_TYPE {
  EVENT = 'event',
  MEETING = 'meeting',
  RIDE = 'ride',
  UNOFFICAL_RIDE = 'unoffical ride',
}
export const EVENT_TYPES = Object.values(EVENT_TYPE)
export const OFFICER_ORDER: { [key in OFFICER_POSITION]: number } = {
  Director: 1,
  'Vice Director': 2,
  'Jr Vice': 3,
  Secretary: 4,
  Treasurer: 5,
  'Sgt at Arms': 6,
  'Road Captain': 7,
  Historian: 8,
  Chaplain: 9,
  'Past Director': 10,
}
export enum ENDPOINT {
  EVENTS = '/api/calendar/events',
  EVENT = '/api/calendar/event',
  ROSTER = '/api/roster',
  MEMBER = '/api/member/',
  LOG_NAMES = '/api/activity-log/names',
}
export enum CALENDAR_COLOR {
  SKYBLUE = '#039be5',
  LAVENDER = '#7986CB',
  SAGE = '#33B679',
  GRAPE = '#8E24AA',
  FLAMINGO = '#E67C73',
  BANANA = '#F6C026',
  TANGERINE = '#F5511D',
  PEACOCK = '#039BE5',
  GRAPHITE = '#616161',
  BLUEBERRY = '#3F51B5',
  BASIL = '#0B8043',
  TOMATO = '#D60000',
}
export enum CALENDAR_COLOR_ID {
  SKYBLUE = '0',
  LAVENDER = '1',
  SAGE = '2',
  GRAPE = '3',
  FLAMINGO = '4',
  BANANA = '5',
  TANGERINE = '6',
  PEACOCK = '7',
  GRAPHITE = '8',
  BLUEBERRY = '9',
  BASIL = '10',
  TOMATO = '11',
}
export const COLOR_OPTIONS = [
  { value: '1', color: '#7986CB' },
  { value: '2', color: '#33B679' },
  { value: '3', color: '#8E24AA' },
  { value: '4', color: '#E67C73' },
  { value: '5', color: '#F6C026' },
  { value: '6', color: '#F5511D' },
  { value: '7', color: '#039BE5' },
  { value: '8', color: '#616161' },
  { value: '9', color: '#3F51B5' },
  { value: '10', color: '#0B8043' },
  { value: '11', color: '#D60000' },
]
export const CALENDAR_COLORS = Object.values(CALENDAR_COLOR)
export const DEFAULT_CALENDAR_COLOR = CALENDAR_COLOR.PEACOCK
export const DEFAULT_CALENDAR_COLOR_ID = CALENDAR_COLOR_ID.PEACOCK
export enum EVENT_TYPE_COLOR_ID {
  RIDE = CALENDAR_COLOR_ID.GRAPE,
  UNOFFICAL_RIDE = CALENDAR_COLOR_ID.BANANA,
  EVENT = CALENDAR_COLOR_ID.PEACOCK,
  MEETING = CALENDAR_COLOR_ID.SAGE,
}
export enum EVENT_TYPE_COLOR {
  RIDE = CALENDAR_COLOR.GRAPE,
  UNOFFICAL_RIDE = CALENDAR_COLOR.BANANA,
  EVENT = CALENDAR_COLOR.PEACOCK,
  MEETING = CALENDAR_COLOR.SAGE,
}
export enum RECURRENCE_MODE {
  ALL = 'all',
  SINGLE = 'single',
  FUTURE = 'future',
}
export const UPDATEABLE_PROPS: Array<keyof IRequestBodyCalendarEvent> = [
  'colorId',
  'description',
  'end',
  'location',
  'recurrence',
  'start',
  'summary',
  'extendedProperties',
]
