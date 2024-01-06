import { Box, Typography } from '@mui/material'
import React from 'react'

interface HourTickerProps {
  height: number
  children?: React.ReactNode
}

export default function HourTicker({ height, children }: HourTickerProps): JSX.Element {
  return (
    <Box
      className='weekday-scrollable'
      sx={{
        flexGrow: 1,
        overflowX: 'hidden',
        overflowY: 'scroll',
        display: 'flex',
        '&:hover::-webkit-scrollbar-thumb': {
          backgroundColor: '#3f3f3f',
        },
        '&::-webkit-scrollbar-thumb': {
          borderRadius: 2,
          border: '4px solid transparent',
          backgroundClip: 'content-box',
          backgroundColor: '#1E1E1E',
        },
        '&::-webkit-scrollbar': {
          width: 16,
        },
        '&::-webkit-scrollbar-track': {
          borderRadius: 2,
        },
      }}
    >
      <Box sx={{ width: 48 }}>
        {Array.from(Array(24)).map((_, index) => (
          <Box key={index} height={height}>
            <Typography
              component='span'
              variant='caption'
              sx={{
                top: -10,
                textAlign: 'right',
                position: 'relative',
                display: 'block',
                color: 'text.secondary',
                mr: 0,
                pr: 1,
              }}
            >
              {index === 0 ? '' : index % 12 === 0 ? 12 : index % 12}{' '}
              {index === 0 ? '' : index < 12 ? 'am' : 'pm'}
            </Typography>
          </Box>
        ))}
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          position: 'relative',
        }}
      >
        <Box sx={{ display: 'flex', width: '100%' }}>
          <Box aria-hidden='true'>
            {Array.from(Array(24)).map((_, index) => (
              <Box
                key={index}
                sx={{
                  height,
                  '&::after': {
                    content: '""',
                    borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                    position: 'absolute',
                    width: '100%',
                    marginTop: '-1px',
                    pointerEvents: 'none',
                  },
                }}
              />
            ))}
          </Box>

          <Box
            sx={{
              flexGrow: 1,
              ml: 1,
              borderLeft: (theme) => `1px solid ${theme.palette.divider}`,
              position: 'relative',
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
