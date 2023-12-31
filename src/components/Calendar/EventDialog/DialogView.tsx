import * as React from 'react'
import { isMemberAdmin } from '@/utils/member'
import { startCase } from '@/utils/helpers'
import { useSession } from 'next-auth/react'
import CalendarIcon from '@mui/icons-material/InsertInvitation'
import CloseIcon from '@mui/icons-material/Close'
import dayjs from 'dayjs'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import KsuIcon from '@mui/icons-material/SportsMotorsports'
import MapIcon from '@mui/icons-material/Map'
import MeetingIcon from '@mui/icons-material/Groups'
import MilesIcon from '@mui/icons-material/Route'
import NotesIcon from '@mui/icons-material/Notes'
import PlaceIcon from '@mui/icons-material/Place'
import ActivityLogIcon from '@mui/icons-material/Telegram'
import type { EventDialogView } from './Dialog'
import type { ICalendarEvent } from '@/types/common'
import { Box, DialogContent, Stack, Tooltip, Typography, IconButton, Button } from '@mui/material'
import {
  getCalendarEventTypeIcon,
  getHumanReadableRecurrenceString,
  getLocationMapLink,
  parseLocationString,
} from '@/utils/calendar'

export default function DialogView({
  event,
  onClose,
  onViewChange,
}: {
  event: ICalendarEvent
  onClose: () => void
  onViewChange: (mode: EventDialogView) => void
}): JSX.Element {
  const { data: session } = useSession()
  const isAdmin = session?.user ? isMemberAdmin(session.user) : false
  const isLoggedIn = !!session?.user
  const recurrenceString = React.useMemo(() => {
    if (event) {
      const startDate = event.originalStartDate ?? event.startDate

      if (Array.isArray(event.recurrence)) {
        return getHumanReadableRecurrenceString(startDate, event.recurrence[0])
      }
    }

    return ''
  }, [event])
  const locationUrl = React.useMemo(() => {
    return event?.location ? getLocationMapLink(event?.location) : ''
  }, [event])
  const locationString = React.useMemo(() => {
    return event?.location ? parseLocationString(event.location) : ''
  }, [event])
  const musterLocationString = React.useMemo(() => {
    return event?.musterLocation ? parseLocationString(event?.musterLocation) : ''
  }, [event])
  const dateString = React.useMemo(() => {
    if (!event) return ''

    if (event.isAllDayEvent && !event.isMultipleDayEvent) {
      return event.startDate.format('dddd, MMMM D')
    }

    if (event.isAllDayEvent && event.isMultipleDayEvent) {
      return `${event.startDate.format('MMMM D')} \u2013 ${event.endDate
        .subtract(1, 'day')
        .format('D YYYY')}`
    }

    if (!event.isAllDayEvent && event.isMultipleDayEvent) {
      return `${event.startDate.format('MMMM D, YYYY, h:mm a')} \u2013 ${event.endDate
        .subtract(1, 'day')
        .format('MMMM D, YYYY, h:mm a')}`
    }

    if (!event.isAllDayEvent && !event.isMultipleDayEvent) {
      return event.startDate.format('a') === event.endDate.format('a')
        ? `${event.startDate.format('dddd, MMMM D')} \u22C5 ${event.startDate.format(
            'h:mm',
          )} - ${event.endDate.format('h:mma')}`
        : `${event.startDate.format('dddd, MMMM D')} \u22C5 ${event.startDate.format(
            'h:mma',
          )} - ${event.endDate.format('h:mma')}`
    }

    return ''
  }, [event])
  const IconEvent = React.useMemo(() => {
    if (!event) return null

    return getCalendarEventTypeIcon(event.eventType, {
      sx: { fontSize: '2rem', color: event.color },
    })
  }, [event])
  const informationString = React.useMemo(() => {
    if (event?._event) {
      const created = dayjs(event._event.created)
      const modified = dayjs(event._event.updated)

      if (created.isSame(modified, 'day')) {
        return `Created ${created.fromNow()}`
      }

      return `Updated ${modified.fromNow()}`
    }

    return ''
  }, [event])
  const canAttend = React.useMemo(() => {
    const now = dayjs()
    return event.startDate.isBefore(now) && isLoggedIn
  }, [event, isLoggedIn])

  return (
    <React.Fragment>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
        {isAdmin && (
          <Tooltip title='Edit Event'>
            <IconButton
              onClick={() => {
                onViewChange('edit')
              }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
        )}
        {isAdmin && (
          <Tooltip title='Delete Event'>
            <IconButton
              onClick={() => {
                onViewChange('delete')
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title='Close'>
          <IconButton sx={{ ml: 2 }} onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <DialogContent sx={{ px: 2, pt: 0, minWidth: { xs: undefined, md: 400 } }}>
        <Stack spacing={2}>
          <Box display='flex'>
            {IconEvent && <Tooltip title={startCase(event.eventType)}>{IconEvent}</Tooltip>}
            <Box sx={{ ml: 2 }}>
              <Typography variant='h5' fontWeight='fontWeightBold'>
                {event.summary ? event.summary : '(No Title)'}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {dateString}
              </Typography>
              {recurrenceString && (
                <Typography variant='body2' color='text.secondary'>
                  {recurrenceString}
                </Typography>
              )}
            </Box>
          </Box>
          {event.musterLocation && event.muster && (
            <Box display='flex' alignItems='center'>
              <Tooltip title='Muster'>
                <MeetingIcon sx={{ fontSize: '28px' }} />
              </Tooltip>
              <Box sx={{ display: 'flex', alignItems: 'center', ml: 2, flexGrow: 1 }}>
                {Array.isArray(musterLocationString) ? (
                  <Box>
                    <Typography>
                      Muster @ {musterLocationString[0]} {'\u2013'} {event.muster?.format('H:mm a')}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {musterLocationString[1]}
                    </Typography>
                  </Box>
                ) : (
                  <Typography sx={{ flexGrow: 1 }}>
                    Muster @ {musterLocationString} {'\u2013'} {event.muster?.format('H:mm a')}{' '}
                  </Typography>
                )}
              </Box>
              <Tooltip title='View Map'>
                <IconButton href={getLocationMapLink(event.musterLocation)} target='_blank'>
                  <MapIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )}
          {!event.musterLocation && event.muster && (
            <Box display='flex'>
              <Tooltip title='Muster'>
                <MeetingIcon sx={{ fontSize: '28px' }} />
              </Tooltip>
              <Box sx={{ ml: 2 }}>
                <Typography>Muster @ {event.muster?.format('H:mm a')}</Typography>
              </Box>
            </Box>
          )}
          {event.ksu && (
            <Box display='flex' alignItems='center'>
              <Tooltip title='KSU'>
                <KsuIcon sx={{ fontSize: '28px' }} />
              </Tooltip>
              <Box sx={{ ml: 2 }}>
                <Typography>KSU @ {event.ksu?.format('H:mm a')}</Typography>
              </Box>
            </Box>
          )}
          {event?.location && (
            <Box display='flex' alignItems='center'>
              <Tooltip title={'Location'}>
                <PlaceIcon sx={{ fontSize: '28px' }} />
              </Tooltip>
              <Box sx={{ display: 'flex', alignItems: 'center', ml: 2, flexGrow: 1 }}>
                {Array.isArray(locationString) ? (
                  <Box sx={{ width: '100%' }}>
                    <Typography>{locationString[0]}</Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {locationString[1]}
                    </Typography>
                  </Box>
                ) : (
                  <Typography>{event.location}</Typography>
                )}
              </Box>
              <Tooltip title='View Map'>
                <IconButton href={locationUrl} target='_blank'>
                  <MapIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )}
          {event.miles && (
            <Box display='flex' alignItems='center'>
              <Tooltip title='Estimated Miles'>
                <MilesIcon sx={{ fontSize: '28px' }} />
              </Tooltip>
              <Box sx={{ ml: 2 }}>
                <Typography>{event.miles} miles</Typography>
              </Box>
            </Box>
          )}
          {event.description && (
            <Box display='flex'>
              <Tooltip title={'Description'}>
                <NotesIcon sx={{ fontSize: '28px' }} />
              </Tooltip>
              <Box sx={{ ml: 2 }}>
                <Typography dangerouslySetInnerHTML={{ __html: event.description }} />
              </Box>
            </Box>
          )}
          {event?._event?.organizer?.displayName && (
            <Box display='flex'>
              <Tooltip title='Infomation'>
                <CalendarIcon sx={{ fontSize: '28px' }} />
              </Tooltip>
              <Box sx={{ ml: 2 }}>
                <Typography>{event._event.organizer.displayName}</Typography>
                <Typography variant='body2' color='text.secondary'>
                  {informationString}
                </Typography>
              </Box>
            </Box>
          )}
          {canAttend && (
            <Button
              startIcon={<ActivityLogIcon />}
              variant='outlined'
              color='primary'
              onClick={() => {
                onViewChange('activity_log')
              }}
            >
              I attended this event
            </Button>
          )}
        </Stack>
      </DialogContent>
    </React.Fragment>
  )
}
