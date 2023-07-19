import { RECURRENCE_MODE } from '@/utils/constants'
import { FormControlLabel, Radio, RadioGroup, RadioGroupProps } from '@mui/material'
import * as React from 'react'

type CalendarEventRecurrenceFormProps = { noSingle?: boolean } & RadioGroupProps
export default function CalendarEventRecurrenceForm({
  noSingle,
  ...props
}: CalendarEventRecurrenceFormProps) {
  return (
    <RadioGroup {...props}>
      {!noSingle && (
        <FormControlLabel value={RECURRENCE_MODE.SINGLE} control={<Radio />} label='This Event' />
      )}
      <FormControlLabel
        value={RECURRENCE_MODE.FUTURE}
        control={<Radio />}
        label='This and Following Events'
      />
      <FormControlLabel value={RECURRENCE_MODE.ALL} control={<Radio />} label='All Events' />
    </RadioGroup>
  )
}
