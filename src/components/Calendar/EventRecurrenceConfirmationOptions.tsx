import { RECURRENCE_MODE } from '@/utils/constants'
import { FormControlLabel, Radio, RadioGroup, type RadioGroupProps } from '@mui/material'
import * as React from 'react'

interface EventRecurrenceConfirmationOptionsProps extends RadioGroupProps {
  options?: RECURRENCE_MODE[]
}
const LABELS: Record<RECURRENCE_MODE, string> = {
  [RECURRENCE_MODE.SINGLE]: 'This Event',
  [RECURRENCE_MODE.FUTURE]: 'This and Following Events',
  [RECURRENCE_MODE.ALL]: 'All Events',
}

export default function EventRecurrenceConfirmationOptions({
  options = [RECURRENCE_MODE.SINGLE, RECURRENCE_MODE.FUTURE, RECURRENCE_MODE.ALL],
  ...props
}: EventRecurrenceConfirmationOptionsProps): JSX.Element {
  return (
    <RadioGroup {...props}>
      {options.map((e) => (
        <FormControlLabel key={e} value={e} control={<Radio />} label={LABELS[e]} />
      ))}
    </RadioGroup>
  )
}
