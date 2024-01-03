'use client'

import React from 'react'
import { Box, Typography } from '@mui/material'
import { DAYS } from '@/utils/constants'
import { getDaysEvents, resetEvent, updateEventStartDate } from '@/utils/calendar'
import { restrictToWindowEdges } from '@dnd-kit/modifiers'
import { type MutatorOptions } from 'swr'
import { udpateCalendarEvent } from '@/utils/api'
import { useCalendar } from '@/hooks/useCalendar'
import dayjs, { type Dayjs } from 'dayjs'
import DesktopMonthDay from './DesktopDay'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import type { ICalendarEvent } from '@/types/common'
import {
  DndContext,
  PointerSensor,
  pointerWithin,
  type DragCancelEvent,
  type DragEndEvent,
  type DragOverEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core'

export default function DesktopMonthView({
  days,
  events: data = [],
  firstDate,
  onCalendarEventCreate,
  onMutate,
}: {
  days: number[]
  events?: ICalendarEvent[]
  firstDate: Dayjs
  onCalendarEventCreate?: (date: Dayjs) => void
  onMutate?: (data: any, options?: MutatorOptions<ICalendarEvent[]>) => void
}): JSX.Element {
  const { date, setEventId } = useCalendar()
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )
  function handleEventClick(event: ICalendarEvent): void {
    setEventId(event.id)
  }
  function handleDragCancel({ active }: DragCancelEvent): void {
    if (active.id) {
      const eventIndex = data.findIndex((e) => e.id === active.id)

      if (eventIndex > -1) {
        let newData = [...data]
        const [event] = newData.splice(eventIndex, 1)

        const updatedEvent = resetEvent(event)
        newData.push(updatedEvent)

        newData = newData.map((e) => {
          e._renderIndex = -1
          return e
        })

        if (onMutate) onMutate(newData, { revalidate: false })
      }
    }
  }
  function handleDragOver({ active, over }: DragOverEvent): void {
    if (over && active.id) {
      const eventIndex = data.findIndex((e) => e.id === active.id)

      if (eventIndex > -1) {
        let newData = [...data]
        const [event] = newData.splice(eventIndex, 1)

        const updatedEvent = updateEventStartDate(event, dayjs(over.id))
        newData.push(updatedEvent)

        newData = newData.map((e) => {
          e._renderIndex = -1
          return e
        })

        if (onMutate) onMutate(newData, { revalidate: false })
      }
    }
  }
  async function handleDragDrop(dndEvent: DragEndEvent): Promise<void> {
    const eventId = dndEvent.active.id
    const eventIndex = data.findIndex((e) => e.id === eventId)

    await udpateCalendarEvent(data[eventIndex])

    if (onMutate) onMutate([...data])
  }

  return (
    <DndContext
      onDragCancel={handleDragCancel}
      onDragOver={handleDragOver}
      onDragEnd={handleDragDrop}
      sensors={sensors}
      collisionDetection={pointerWithin}
      modifiers={[restrictToWindowEdges]}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        <Grid container columns={7} sx={{ flexShrink: 1 }}>
          {DAYS.map((day, index) => (
            <Grid
              key={day}
              xs={1}
              sx={{
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: (theme) => theme.palette.divider,
                borderRight: index > 0 && (index + 1) % 7 === 0 ? undefined : 'none',
                borderBottom: 'none',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Typography component={'span'} variant='button' color='text.secondary'>
                {DAYS[index]}
              </Typography>
            </Grid>
          ))}
        </Grid>
        <Grid container columns={7} sx={{ flexGrow: 1 }}>
          {days.map((d) => (
            <Grid
              key={d}
              xs={1}
              sx={{
                borderColor: (theme) => theme.palette.divider,
                display: 'flex',
                justifyContent: 'center',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderTop: d < 7 ? 'none' : undefined,
                borderRight: d > 0 && (d + 1) % 7 === 0 ? undefined : 'none',
                borderBottom: 'none',
              }}
            >
              <DesktopMonthDay
                date={firstDate.add(d, 'days')}
                events={getDaysEvents(data, firstDate.add(d, 'days'))}
                activeMonth={date.month()}
                selected={date.isSame(firstDate.add(d, 'days'), 'day')}
                onEventClick={handleEventClick}
                onEventCreate={onCalendarEventCreate}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </DndContext>
  )
}
