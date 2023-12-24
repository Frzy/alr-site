'use client'

import React from 'react'
import { Box, Dialog, Typography } from '@mui/material'
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
import { getDaysEvents, resetEvent, updateEventStartDate } from '@/utils/calendar'
import { useCalendar } from '@/hooks/useCalendar'
import CalendarEventDialogContent from '../EventDialog'
import dayjs, { type Dayjs } from 'dayjs'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import type { ICalendarEvent } from '@/types/common'
import { restrictToWindowEdges } from '@dnd-kit/modifiers'
import DesktopMonthDay from './DesktopDay'
import { DAYS } from '@/utils/constants'
import { type MutatorOptions } from 'swr'

export default function DesktopMonthView({
  days,
  events: data = [],
  firstDate,
  onMutate,
}: {
  days: number[]
  events?: ICalendarEvent[]
  firstDate: Dayjs
  onMutate?: (data: any, options?: MutatorOptions<ICalendarEvent[]>) => void
}): JSX.Element {
  const { date, setDate, activeEvent, setActiveEvent } = useCalendar()
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  function handleEventClick(event: ICalendarEvent): void {
    setActiveEvent(event)
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
  function handleDragDrop(event: DragEndEvent): void {
    // const { active, over } = event
    // if (over && active.id) {
    //   const eventIndex = data.findIndex((e) => e.id === active.id)
    //   if (eventIndex > -1) {
    //     let newData = [...data]
    //     const [event] = newData.splice(eventIndex, 1)
    //     const updatedEvent = updateEventStartDate(event, dayjs(over.id))
    //     newData.push(updatedEvent)
    //     newData = newData.map((e) => {
    //       e._renderIndex = -1
    //       return e
    //     })
    //     void mutate(newData, { revalidate: false })
    //   }
    // }
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
                onDateClick={setDate}
                onEventClick={handleEventClick}
              />
            </Grid>
          ))}
        </Grid>
        <Dialog
          open={!!activeEvent}
          onClose={() => {
            setActiveEvent(null)
          }}
        >
          {activeEvent && <CalendarEventDialogContent event={activeEvent} />}
        </Dialog>
      </Box>
    </DndContext>
  )
}
