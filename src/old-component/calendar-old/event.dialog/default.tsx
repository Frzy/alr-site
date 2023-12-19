import * as React from 'react'
import {
  Box,
  Button,
  DialogContent,
  IconButton,
  Icon,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { EVENT_TYPE } from '@/utils/constants'
import { getHumanReadableRecurrenceString } from '@/utils/helpers'
import AttachmentIcon from '@mui/icons-material/AttachFile'
import EventIcon from '@mui/icons-material/Event'
import MapIcon from '@mui/icons-material/Map'
import Image from 'next/image'
import KsuIcon from '@mui/icons-material/TwoWheeler'
import moment from 'moment'
import MusterIcon from '@mui/icons-material/Groups'
import NotesIcon from '@mui/icons-material/Notes'
import PlaceIcon from '@mui/icons-material/Place'

import type { ICalendarEvent } from '@/types/common'
interface DefaultCalendarEventPros {
  event: ICalendarEvent
}

export default function DefaultCalendarEventDialog({ event }: DefaultCalendarEventPros) {
  const recurrenceString = React.useMemo(() => {
    const startDate = event.originalStartDate || event.startDate
    if (event.recurrence && event.recurrence.length) {
      return getHumanReadableRecurrenceString(startDate, event.recurrence[0])
    }

    return ''
  }, [event])
  const locationQuery = React.useMemo(() => {
    if (event.location) {
      return new URLSearchParams({ q: event.location }).toString()
    }

    return ''
  }, [event])

  return (
    <DialogContent>
      <Stack spacing={2}>
        <Box display='flex'>
          <Box mt='6px' width={24} height={24} bgcolor={event.color} borderRadius={2} />
          <Box ml={3}>
            <Typography variant='h5'>{event.summary ? event.summary : '(No Title)'}</Typography>
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
            <Tooltip title='Location'>
              <PlaceIcon sx={{ mt: '3px' }} />
            </Tooltip>
            <Box ml={3} display='flex' alignItems='center' width='100%' gap={2}>
              <Typography variant='body2' fontSize={'0.95rem'} flexGrow={1}>
                {event?.location}
              </Typography>
              {locationQuery && (
                <IconButton href={`https://www.google.com/maps?${locationQuery}`} target='_blank'>
                  <MapIcon />
                </IconButton>
              )}
            </Box>
          </Box>
        )}
        {event.eventType === EVENT_TYPE.RIDE && (
          <React.Fragment>
            <Box display='flex'>
              <Tooltip title='Muster'>
                <MusterIcon />
              </Tooltip>
              <Box ml={3} display='flex' alignItems='center'>
                <Typography variant='body2' fontSize={'0.95rem'}>
                  {event.muster?.format('H:mm')}
                </Typography>
              </Box>
            </Box>
            <Box display='flex'>
              <Tooltip title='KSU'>
                <KsuIcon />
              </Tooltip>
              <Box ml={3} display='flex' alignItems='center'>
                <Typography variant='body2' fontSize={'0.95rem'}>
                  {event.ksu?.format('H:mm')}
                </Typography>
              </Box>
            </Box>
          </React.Fragment>
        )}
        {event?.description && (
          <Box display='flex'>
            <Tooltip title='Description'>
              <NotesIcon />
            </Tooltip>
            <Box ml={3} display='flex' alignItems='center'>
              <Typography
                variant='body2'
                fontSize={'0.95rem'}
                dangerouslySetInnerHTML={{ __html: event.description }}
              />
            </Box>
          </Box>
        )}
        {event?.attachments && (
          <Box display='flex'>
            <Tooltip title='Attachments'>
              <AttachmentIcon sx={{ mt: '3px' }} />
            </Tooltip>
            <Box
              ml={3}
              display='flex'
              sx={{
                flexDirection: {
                  xs: 'column',
                  sm: 'row',
                },
                alignItems: {
                  xs: 'flex-start',
                  sm: 'center',
                },
              }}
              flexWrap='wrap'
              gap={1}
            >
              {event.attachments.map((attachment, index) => {
                const length = event.attachments?.length ?? 0
                if (!attachment.fileUrl) return null

                return (
                  <Button
                    startIcon={
                      attachment.iconLink ? (
                        <Icon sx={{ display: 'flex' }}>
                          <Image
                            src={attachment.iconLink}
                            alt='attachment icon'
                            width={20}
                            height={20}
                          />
                        </Icon>
                      ) : undefined
                    }
                    variant='outlined'
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                      width: {
                        xs: '100%',
                        sm: 'inherit',
                      },
                      maxWidth: {
                        xs: '100%',
                        sm:
                          length >= 3
                            ? 'calc(33.3% - 8px)'
                            : length >= 2
                            ? 'calc(50% - 4px)'
                            : '100%',
                      },
                    }}
                    href={attachment.fileUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <Typography variant='button' textOverflow='ellipsis' overflow='hidden' noWrap>
                      {attachment.title}
                    </Typography>
                  </Button>
                )
              })}
            </Box>
          </Box>
        )}
        {event?.organizer?.displayName && (
          <Box display='flex'>
            <Tooltip title='Infomation'>
              <EventIcon />
            </Tooltip>
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
  )
}
