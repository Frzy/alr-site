import * as React from 'react'

import { Box } from '@mui/material'
import dayjs, { type Dayjs } from 'dayjs'

export enum DAY {
  SUNDAY = 'SU',
  MONDAY = 'MO',
  TUESDAY = 'TU',
  WEDNESDAY = 'WE',
  THURSDAY = 'TH',
  FRIDAY = 'FR',
  SATURDAY = 'SA',
}

const Days = [
  DAY.SUNDAY,
  DAY.MONDAY,
  DAY.TUESDAY,
  DAY.WEDNESDAY,
  DAY.THURSDAY,
  DAY.FRIDAY,
  DAY.SATURDAY,
]

interface DayPickerProps {
  date?: Dayjs
  days?: DAY[]
  onChange?: (days: DAY[]) => void
}

export default function DayPicker({
  date = dayjs(),
  days = [],
  onChange,
}: DayPickerProps): JSX.Element {
  function handleDayClick(day: DAY) {
    return () => {
      const newDays = [...days]
      const indexOfDay = days.indexOf(day)
      if (indexOfDay === -1) {
        newDays.push(day)
      } else {
        newDays.splice(indexOfDay, 1)

        if (!newDays.length) {
          newDays.push(date.format('dd').toUpperCase() as DAY)
        }
      }

      if (onChange) onChange(newDays.sort())
    }
  }

  React.useEffect(() => {
    if (!days.length && onChange) onChange([date.format('dd').toUpperCase() as DAY])
  }, [days, date, onChange])

  return (
    <Box display='flex' gap={0.5}>
      {Days.map((d) => (
        <Box
          key={d}
          onClick={handleDayClick(d)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: 4,
            cursor: 'pointer',
            bgcolor: (theme) =>
              days.includes(d) ? theme.palette.primary.main : theme.palette.grey.A700,
            '&:hover': {
              bgcolor: (theme) =>
                days.includes(d) ? theme.palette.primary.dark : theme.palette.grey.A400,
            },
          }}
        >
          {d.slice(0, 1)}
        </Box>
      ))}
    </Box>
  )
}
