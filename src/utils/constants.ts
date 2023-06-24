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

export enum MEMBER_ROLE {
  ABANDONED = 'Abandoned',
  CHARTER = 'Charter Member',
  DISCHARGED = 'Discharged',
  MEMBER = 'Member',
  PAST_MEMBER = 'Past Member',
  PAST_SUPPORTER = 'Past Supporter',
  PROSPECT = 'Canidate',
  RETIRED = 'Retiree',
  SUPPORTER = 'Supporter',
}
export const MEMBER_ROLES = Object.values(MEMBER_ROLE)

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
        value: ENTITY.SAL,
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
  RIDE = 'ride',
  EVENT = 'event',
  MEETING = 'meeting',
}
export const EVENT_TYPES = Object.values(EVENT_TYPE)
export const EVENT_TYPE_OBJECTS = EVENT_TYPES.map((e) => {
  switch (e) {
    case EVENT_TYPE.RIDE:
      return {
        value: EVENT_TYPE.RIDE,
        color: {
          main: orange[500],
          light: orange[200],
          dark: orange[700],
          color: orange,
        },
      }
    case EVENT_TYPE.MEETING:
      return {
        value: EVENT_TYPE.MEETING,
        color: {
          main: teal[500],
          light: teal[200],
          dark: teal[700],
          color: teal,
        },
      }
    case EVENT_TYPE.EVENT:
      return {
        value: EVENT_TYPE.EVENT,
        color: {
          main: cyan[500],
          light: cyan[200],
          dark: cyan[700],
          color: cyan,
        },
      }
  }
})

export enum ENDPOINT {
  EVENTS = '/api/calendar/events',
  RECURRING_EVENT = '/api/calendar/recurring-event',
  ROSTER = '/api/roster',
  MEMBER = '/api/member/',
  LOG_NAMES = '/api/activity-log/names',
}
