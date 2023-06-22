import * as React from 'react'

import { Box, DialogContent, DialogTitle, IconButton, Typography, Stack } from '@mui/material'

import CloseIcon from '@mui/icons-material/Close'
import PlaceIcon from '@mui/icons-material/Place'
import NotesIcon from '@mui/icons-material/Notes'
import EventIcon from '@mui/icons-material/Event'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

import { useSession } from 'next-auth/react'
import { getCalendarEventColor, getHumanReadableRecurrenceString } from '@/utils/helpers'
import moment from 'moment'
import type { ICalendarEvent } from '../calendar.timeline'
import { MODE } from '../calendar.event.dialog'

interface DefaultCalendarEventPros {
  editable?: boolean
  event: ICalendarEvent
  recurrence?: string[]
  onClose: () => void
  onModeChange?: (mode: MODE) => void
}

export default function DefaultCalendarEventDialog({
  event,
  editable,
  recurrence = [],
  onClose,
  onModeChange,
}: DefaultCalendarEventPros) {
  const session = useSession()
  const isAdmin = !!session.data?.user.office
  const color = getCalendarEventColor(event.eventType)
  const recurrenceString = React.useMemo(() => {
    if (recurrence.length && event.originalStartDate) {
      return getHumanReadableRecurrenceString(event.originalStartDate, recurrence[0])
    }

    return ''
  }, [event, recurrence])

  return (
    <React.Fragment>
      <DialogTitle sx={{ display: 'flex' }}>
        <Box flexGrow={1} />
        <Box>
          {editable && isAdmin && (
            <React.Fragment>
              <IconButton
                onClick={() => {
                  if (onModeChange) onModeChange(MODE.EDIT)
                }}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                onClick={() => {
                  if (onModeChange) onModeChange(MODE.DELETE)
                }}
              >
                <DeleteIcon />
              </IconButton>
            </React.Fragment>
          )}
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Box display='flex'>
            <Box mt='6px' width={24} height={24} bgcolor={color.main} borderRadius={2} />
            <Box ml={3}>
              <Typography variant='h5'>{event?.summary}</Typography>
              {event.start?.date ? (
                <Typography>{event?.startDate.format('dddd, MMMM D')}</Typography>
              ) : (
                <React.Fragment>
                  {event.startDate.isSame(event.endDate, 'day') ? (
                    <Typography variant='body2' fontSize={'0.95rem'}>
                      {`${event?.startDate.format('dddd, MMMM D h:mm')} - ${event.endDate.format(
                        'h:mma',
                      )}`}
                    </Typography>
                  ) : (
                    <Typography variant='body2' fontSize={'0.95rem'}>
                      {`${event?.startDate.format('dddd, MMMM D h:mma')} - ${event?.endDate.format(
                        'dddd, MMMM D h:mma',
                      )}`}
                    </Typography>
                  )}
                </React.Fragment>
              )}
              {recurrenceString && (
                <Typography variant='body2' fontSize={'0.95rem'}>
                  {recurrenceString}
                </Typography>
              )}
            </Box>
          </Box>
          {event?.location && (
            <Box display='flex'>
              <PlaceIcon sx={{ mt: '3px' }} />
              <Box ml={3} display='flex' alignItems='center'>
                <Typography variant='body2' fontSize={'0.95rem'}>
                  {event?.location}
                </Typography>
              </Box>
            </Box>
          )}
          {event?.description && (
            <Box display='flex'>
              <NotesIcon />
              <Box ml={3} display='flex' alignItems='center'>
                <Typography
                  variant='body2'
                  fontSize={'0.95rem'}
                  dangerouslySetInnerHTML={{ __html: event.description }}
                />
              </Box>
            </Box>
          )}
          {event?.organizer?.displayName && (
            <Box display='flex'>
              <EventIcon />
              <Box ml={3}>
                <Typography variant='body2' fontSize={'0.95rem'}>
                  {event?.organizer?.displayName}
                </Typography>
                <Typography variant='body2' fontSize={'0.95rem'}>
                  Updated {moment(event.updated).from(moment())}
                </Typography>
              </Box>
            </Box>
          )}
        </Stack>
      </DialogContent>
    </React.Fragment>
  )
}
