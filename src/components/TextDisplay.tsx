import { Box, type BoxProps, InputLabel, Chip } from '@mui/material'
import dayjs, { type Dayjs } from 'dayjs'
import React from 'react'

interface TextDisplayProps extends BoxProps {
  emptyText?: string
  formatValue?: (value: any) => string | number | undefined
  renderValue?: (formatedValue: any) => React.ReactNode | undefined
  fullWidth?: boolean
  label?: string
  value?: string | number | Dayjs | (string | number | Dayjs)[]
  multiple?: boolean
  variant?: 'filled' | 'standard'
}
export default function TextDisplay({
  label,
  value,
  variant = 'standard',
  formatValue,
  renderValue,
  fullWidth,
  multiple,
  emptyText = 'Not Available',
  ...other
}: TextDisplayProps): JSX.Element {
  const displayValue = React.useMemo(() => {
    function getFormattedValue(
      val: string | number | Dayjs | undefined,
    ): React.ReactNode | undefined {
      if (val !== undefined) {
        return formatValue ? formatValue(val) : dayjs.isDayjs(val) ? val.format() : val
      }

      return val
    }

    if (Array.isArray(value) && !value.length) {
      return undefined
    }

    if (multiple) {
      const chipValues = Array.isArray(value) ? value : [value]

      return chipValues
        .map((v, i) => {
          const val = getFormattedValue(v)

          if (val !== 'undefined')
            return renderValue ? (
              renderValue(val)
            ) : (
              <Chip
                key={i}
                size='small'
                label={val}
                sx={{ mr: i !== chipValues.length - 1 ? 1 : undefined, cursor: 'default' }}
              />
            )

          return val
        })
        .filter(Boolean)
    }

    if (Array.isArray(value)) {
      return renderValue
        ? value.map(getFormattedValue).filter(Boolean).map(renderValue)
        : value.map(getFormattedValue).filter(Boolean).join(', ')
    }

    return renderValue ? renderValue(getFormattedValue(value)) : getFormattedValue(value)
  }, [value, multiple, renderValue, formatValue])

  return (
    <Box
      {...other}
      sx={{
        ...other?.sx,
        position: 'relative',
        display: 'inline-flex',
        flexDirection: 'column',
        minWidth: 128,
        width: fullWidth ? '100%' : undefined,
      }}
    >
      <InputLabel
        sx={{
          position: 'absolute',
          left: 8,
          top: 8,
        }}
        shrink
      >
        {label}
      </InputLabel>
      <Box
        sx={{
          height: 56,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          textWrap: 'nowrap',
          backgroundColor: variant === 'filled' ? 'rgba(255, 255, 255, 0.09)' : undefined,
          borderTopLeftRadius: 3,
          borderTopRightRadius: 3,
          px: '8px',
          lineHeight: displayValue ? '4.7rem' : '5.1rem',
          fontSize: displayValue ? '1.1rem' : '0.75rem',
          color: displayValue ? 'text.primary' : 'text.secondary',
          '&:before': {
            borderBottom: '1px solid rgba(255, 255, 255, 0.7)',
            left: 0,
            bottom: 0,
            content: '""',
            position: 'absolute',
            right: 0,
            pointerEvents: 'none',
            transition: (theme) =>
              theme.transitions.create('borderBottomColor', {
                duration: theme.transitions.duration.short,
                easing: theme.transitions.easing.easeInOut,
              }),
          },
        }}
      >
        {displayValue ?? emptyText}
      </Box>
    </Box>
  )
}
