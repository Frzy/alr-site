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

export enum MEMBER_ROLE {
  CHARTER = 'Charter Member',
  MEMBER = 'Member',
  PROSPECT = 'Canidate',
  SUPPORTER = 'Supporter',
  DISCHARGED = 'Discharged',
  ABANDONED = 'Abandoned',
}

export const ENTITY_COLOR = {
  AL: { background: 'rgb(0, 0, 0)', text: '#FFF' },
  SAL: { background: 'rgb(8, 107, 173)', text: '#FFF' },
  AUX: { background: 'rgb(173, 0, 0)', text: '#FFF' },
}

export const ENTITY_LABEL = {
  AL: 'American Legion',
  AUX: 'American Legion Auxiliary',
  SAL: 'Sons of the American Legion',
}

export enum ENTITY {
  LEGION = 'AL',
  SAL = 'SAL',
  AUXILIARY = 'AUX',
}

export enum EVENT_TYPE {
  RIDE = 'ride',
  EVENT = 'event',
  MEETING = 'meeting',
}
export const EVENT_COLOR = {
  ride: {
    main: orange[500],
    light: orange[200],
    dark: orange[700],
    color: orange,
  },
  meeting: {
    main: teal[500],
    light: teal[200],
    dark: teal[700],
    color: teal,
  },
  event: {
    main: cyan[500],
    light: cyan[200],
    dark: cyan[700],
    color: cyan,
  },
}
export enum ENDPOINT {
  EVENTS = '/api/calendar/events',
  RECURRING_EVENT = '/api/calendar/recurring-event',
  ROSTER = '/api/roster',
  MEMBER = '/api/member/',
  LOG_NAMES = '/api/activity-log/names',
}
