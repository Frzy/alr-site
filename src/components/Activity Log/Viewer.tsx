import * as React from 'react'
import {
  Box,
  FormControl,
  MenuItem,
  Paper,
  Select,
  Stack,
  type SelectChangeEvent,
  Typography,
} from '@mui/material'
import { ACTIVITY_TYPES } from '@/utils/constants'
import {
  DataGrid,
  type GridColDef,
  type GridSlotsComponentsProps,
  type GridEventListener,
  useGridApiContext,
  useGridApiEventHandler,
} from '@mui/x-data-grid'
import Logs, { type TotalStats } from '@/utils/Logs'
import type { ActivityLog } from '@/types/common'
import { formatMoney, formatNumber } from '@/utils/helpers'
import NoRowsOverlay from '../NoRowsOverlay'
import dayjs, { type Dayjs } from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import SearchField from '../SearchField'

dayjs.extend(isBetween)

enum TimeFrame {
  ALL = 'All',
  CALENDAR_YEAR = 'Calendar Year',
  LEGION_YEAR = 'Legion Year',
  LAST_WEEK = 'Last 7 Days',
  LAST_MONTH = 'Last 30 Days',
  LAST_QUARTER = 'Last 90 Days',
}
const TimeFrames = Object.values(TimeFrame)

const columns: GridColDef[] = [
  {
    field: 'date',
    headerName: 'Date',
    type: 'date',
    valueGetter: ({ value }) => new Date(value as string),
    resizable: false,
    width: 100,
  },
  {
    field: 'activityType',
    headerName: 'Type',
    type: 'singleSelect',
    valueOptions: ACTIVITY_TYPES,
    resizable: false,
    width: 100,
  },
  { field: 'activityName', headerName: 'Activity Name', resizable: false, minWidth: 150, flex: 1 },
  {
    field: 'hours',
    headerName: 'Hours',
    type: 'number',
    valueFormatter: ({ value }) => (value ? formatNumber(value as number) : ''),
    resizable: false,
    width: 90,
    headerAlign: 'center',
    align: 'center',
  },
  {
    field: 'miles',
    headerName: 'Miles',
    type: 'number',
    valueFormatter: ({ value }) => (value ? formatNumber(value as number) : ''),
    width: 90,
    headerAlign: 'center',
    align: 'center',
  },
  {
    field: 'monies',
    headerName: 'Monies',
    type: 'number',
    valueFormatter: ({ value }) => (value ? formatMoney(value as number) : ''),
    width: 100,
    headerAlign: 'center',
    align: 'right',
  },
]
const statColumns: GridColDef[] = [
  {
    field: 'name',
    headerName: 'Event Type',
    headerAlign: 'left',
    flex: 3,
    minWidth: 150,
  },
  {
    field: 'events',
    headerName: 'Attended',
    type: 'number',
    valueFormatter: ({ value }) => (value ? formatNumber(value as number) : 0),
    width: 115,
  },
  {
    field: 'hours',
    headerName: 'Total Hours',
    type: 'number',
    valueFormatter: ({ value }) => (value ? formatNumber(value as number) : 0),
    width: 125,
  },
  {
    field: 'miles',
    headerName: 'Total Miles',
    type: 'number',
    valueFormatter: ({ value }) => (value ? formatNumber(value as number) : 0),
    width: 125,
  },
  {
    field: 'money',
    headerName: 'Total Monies',
    type: 'number',
    valueFormatter: ({ value }) => formatMoney(value ? (value as number) : 0),
    width: 135,
  },
]

declare module '@mui/x-data-grid' {
  interface FooterPropsOverrides {
    totals: TotalStats
    isPrivate?: boolean
  }
}

interface ActivityLogViewerProps {
  logs: ActivityLog[]
  isPrivate?: boolean
}

function TotalFooter(props: NonNullable<GridSlotsComponentsProps['footer']>): JSX.Element {
  const apiRef = useGridApiContext()
  const footerRef = React.useRef<HTMLDivElement>(null)
  const handleGridScroll: GridEventListener<'scrollPositionChange'> = (params, event, details) => {
    if (footerRef.current) {
      footerRef.current.scrollLeft = params.left
    }
  }

  useGridApiEventHandler(apiRef, 'scrollPositionChange', handleGridScroll)

  return (
    <Box
      display='flex'
      alignItems='center'
      ref={footerRef}
      sx={{ minHeight: 52, overflow: 'hidden' }}
    >
      <Typography
        variant='subtitle1'
        fontWeight='fontWeightBold'
        sx={{ flexGrow: 1, px: '10px', minWidth: 150 }}
      >
        Totals
      </Typography>
      <Typography
        variant='subtitle1'
        fontWeight='fontWeightBold'
        sx={{ minWidth: 115, width: 115, px: '10px', textAlign: 'right' }}
      >
        {formatNumber(props.totals?.events ?? 0)}
      </Typography>
      <Typography
        variant='subtitle1'
        fontWeight='fontWeightBold'
        sx={{ minWidth: 125, width: 125, px: '10px', textAlign: 'right' }}
      >
        {formatNumber(props.totals?.hours ?? 0)}
      </Typography>
      <Typography
        variant='subtitle1'
        fontWeight='fontWeightBold'
        sx={{ minWidth: 125, width: 125, px: '10px', textAlign: 'right' }}
      >
        {formatNumber(props.totals?.miles ?? 0)}
      </Typography>
      {props.isPrivate && (
        <Typography
          variant='subtitle1'
          fontWeight='fontWeightBold'
          sx={{ minWidth: 135, width: 135, px: '10px', textAlign: 'right' }}
        >
          {formatMoney(props.totals?.money ?? 0)}
        </Typography>
      )}
    </Box>
  )
}

export default function ActivityLogViewer({
  logs: initialLogs,
  isPrivate,
}: ActivityLogViewerProps): JSX.Element {
  const logs = React.useMemo(() => {
    return new Logs(initialLogs)
  }, [initialLogs])
  const [timeFrame, setTimeFrame] = React.useState<string>(TimeFrame.CALENDAR_YEAR)
  const years = React.useMemo(() => {
    const currYear = dayjs().year() - 1
    const minYear = logs.minDate.year()
    const maxYear = logs.maxDate.year()

    return Array.from(
      { length: Math.min(currYear, maxYear) - minYear + 1 },
      (_, offset) => Math.min(currYear, maxYear) - offset,
    )
  }, [logs])
  const dateFilter = React.useMemo<
    | {
        minDate: Dayjs
        maxDate: Dayjs
        inclusivity: '[]' | '[)'
      }
    | undefined
  >(() => {
    const now = dayjs()

    switch (timeFrame) {
      case TimeFrame.ALL:
        return undefined
      case TimeFrame.CALENDAR_YEAR:
        return { minDate: now.startOf('year'), maxDate: now.endOf('year'), inclusivity: '[]' }
      case TimeFrame.LEGION_YEAR: {
        const currentMonth = now.month()
        const minDate = dayjs()
          .year(currentMonth < 6 ? now.year() - 1 : now.year())
          .month(6)
          .startOf('month')

        return {
          minDate,
          maxDate: minDate.add(1, 'year'),
          inclusivity: '[)',
        }
      }
      case TimeFrame.LAST_WEEK:
        return {
          minDate: now.subtract(1, 'week').startOf('day'),
          maxDate: now.endOf('day'),
          inclusivity: '[]',
        }
      case TimeFrame.LAST_MONTH:
        return {
          minDate: now.subtract(1, 'month').startOf('day'),
          maxDate: now.endOf('day'),
          inclusivity: '[]',
        }
      case TimeFrame.LAST_QUARTER:
        return {
          minDate: now.subtract(3, 'months').startOf('day'),
          maxDate: now.endOf('day'),
          inclusivity: '[]',
        }
      default:
        return {
          minDate: dayjs(timeFrame, 'YYYY').startOf('year'),
          maxDate: dayjs(timeFrame, 'YYYY').endOf('year'),
          inclusivity: '[]',
        }
    }
  }, [timeFrame])
  const [searchTerm, setSearchTerm] = React.useState('')
  const filter = React.useCallback(
    (log: ActivityLog) => {
      if (!dateFilter) return true
      const logDate = dayjs(log.date)

      return logDate.isBetween(
        dateFilter.minDate,
        dateFilter.maxDate,
        'day',
        dateFilter.inclusivity,
      )
    },
    [dateFilter],
  )

  function handleTimeframeChange(event: SelectChangeEvent): void {
    setTimeFrame(event.target.value)
  }
  function handleFuzzySearch(event: React.ChangeEvent<HTMLInputElement>): void {
    setSearchTerm(event.target.value)
    logs.fuzzySearch = event.target.value
  }

  logs.filter = dateFilter ? filter : undefined

  return (
    <Paper sx={{ p: 1 }}>
      <Stack spacing={1}>
        <Box
          display='flex'
          gap={0.5}
          sx={{
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FormControl variant='standard'>
              <Select
                value={timeFrame}
                onChange={handleTimeframeChange}
                sx={{
                  '& .MuiSelect-select': {
                    fontSize: '1.3rem',
                    lineHeight: 1.334,
                  },
                }}
              >
                {[...TimeFrames, ...years].map((t) => (
                  <MenuItem key={t} value={t.toString()}>
                    {t}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography component={'h2'} variant='h5'>
              Activity Logs
            </Typography>
          </Box>
          <SearchField
            value={searchTerm}
            onChange={handleFuzzySearch}
            sx={{ width: { xs: '100%', md: 'inherit' } }}
            placeholder='Search Logs'
            size='small'
            animate
          />
        </Box>
        <DataGrid
          autoHeight
          rows={logs.entries}
          slots={{
            noRowsOverlay: NoRowsOverlay,
          }}
          columns={isPrivate ? columns : columns.slice(0, -1)}
          initialState={{
            pagination: { paginationModel: { pageSize: 5 } },
            sorting: { sortModel: [{ field: 'date', sort: 'desc' }] },
          }}
          pageSizeOptions={[5, 10, 25]}
          sx={{
            '& .MuiDataGrid-main': {
              height: logs.entries.length ? undefined : '230px',
            },
            '& .MuiDataGrid-cell:focus-within': {
              outline: 'none',
            },
            '& .MuiDataGrid-overlayWrapperInner': {
              height: '170px !important',
            },
          }}
          disableColumnMenu
        />
        <Typography component={'h2'} variant='h4' gutterBottom>
          Totals
        </Typography>
        <DataGrid
          rows={logs.stats.data}
          columns={isPrivate ? statColumns : statColumns.slice(0, -1)}
          slots={{ footer: TotalFooter }}
          slotProps={{ footer: { totals: logs.stats.totals, isPrivate } }}
          sx={{
            '& .MuiDataGrid-cell:focus-within': {
              outline: 'none',
            },
          }}
          disableColumnMenu
        />
      </Stack>
    </Paper>
  )
}
