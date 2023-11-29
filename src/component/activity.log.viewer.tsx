import * as React from 'react'
import {
  Box,
  FormControl,
  Select,
  InputLabel,
  MenuItem,
  SelectChangeEvent,
  Paper,
  TextField,
  InputAdornment,
  Typography,
  Stack,
} from '@mui/material'
import { ACTIVITY_TYPES } from '@/utils/constants'
import {
  DataGrid,
  GridColDef,
  GridSlotsComponentsProps,
  GridEventListener,
  useGridApiContext,
  useGridApiEventHandler,
} from '@mui/x-data-grid'
import Logs, { TotalStats } from '@/utils/Logs'
import moment, { Moment } from 'moment'
import SearchIcon from '@mui/icons-material/Search'

import type { ActivityLog } from '@/types/common'
import { formatMoney } from '@/utils/helpers'
import NoRowsOverlay from './data.grid.no.rows'

enum TimeFrame {
  ALL = 'All',
  CALENDAR_YEAR = 'Current Calendar Year',
  LEGION_YEAR = 'Current Legion Year',
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
    valueGetter: ({ value }) => new Date(value),
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
    valueFormatter: ({ value }) => (value ? value : ''),
    resizable: false,
    width: 90,
    headerAlign: 'center',
    align: 'center',
  },
  {
    field: 'miles',
    headerName: 'Miles',
    type: 'number',
    valueFormatter: ({ value }) => (value ? value : ''),
    width: 90,
    headerAlign: 'center',
    align: 'center',
  },
  {
    field: 'monies',
    headerName: 'Monies',
    type: 'number',
    valueFormatter: ({ value }) => (value ? formatMoney(value) : ''),
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
    valueFormatter: ({ value }) => (value ? value : 0),
    width: 115,
  },
  {
    field: 'hours',
    headerName: 'Total Hours',
    type: 'number',
    valueFormatter: ({ value }) => (value ? value : 0),
    width: 125,
  },
  {
    field: 'miles',
    headerName: 'Total Miles',
    type: 'number',
    valueFormatter: ({ value }) => (value ? value : 0),
    width: 125,
  },
  {
    field: 'money',
    headerName: 'Total Monies',
    type: 'number',
    valueFormatter: ({ value }) => formatMoney(value ? value : 0),
    width: 135,
  },
]

declare module '@mui/x-data-grid' {
  interface FooterPropsOverrides {
    totals: TotalStats
    isPublic: boolean
  }
}

type DateFilter = {
  minDate: Moment
  maxDate: Moment
}
interface ActivityLogViewerProps {
  logs: ActivityLog[]
  isPublic: boolean
}

function TotalFooter(props: NonNullable<GridSlotsComponentsProps['footer']>) {
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
        {props.totals?.events}
      </Typography>
      <Typography
        variant='subtitle1'
        fontWeight='fontWeightBold'
        sx={{ minWidth: 125, width: 125, px: '10px', textAlign: 'right' }}
      >
        {props.totals?.hours}
      </Typography>
      <Typography
        variant='subtitle1'
        fontWeight='fontWeightBold'
        sx={{ minWidth: 125, width: 125, px: '10px', textAlign: 'right' }}
      >
        {props.totals?.miles}
      </Typography>
      {!props.isPublic && (
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

export default function ActivityLogViewer({ logs: initialLogs, isPublic }: ActivityLogViewerProps) {
  const logs = React.useMemo(() => {
    return new Logs(initialLogs)
  }, [initialLogs])
  const [timeFrame, setTimeFrame] = React.useState<string>(TimeFrame.CALENDAR_YEAR)
  const years = React.useMemo(() => {
    const currYear = moment().year() - 1
    const minYear = logs.minDate.year()
    const maxYear = logs.maxDate.year()

    return Array.from(
      { length: Math.min(currYear, maxYear) - minYear + 1 },
      (_, offset) => Math.min(currYear, maxYear) - offset,
    )
  }, [logs])
  const dateFilter = React.useMemo(() => {
    const today = moment()

    switch (timeFrame) {
      case TimeFrame.ALL:
        return undefined
      case TimeFrame.CALENDAR_YEAR:
        return { minDate: moment().startOf('year'), maxDate: moment().endOf('year') }
      case TimeFrame.LEGION_YEAR:
        const currentMonth = today.month()
        const minDate = moment()
          .year(currentMonth < 6 ? today.year() - 1 : today.year())
          .month(6)
          .startOf('month')

        return {
          minDate,
          maxDate: moment(minDate).add(1, 'year').subtract(1, 'day').endOf('day'),
        }
      case TimeFrame.LAST_WEEK:
        return {
          minDate: moment().subtract(1, 'week').startOf('day'),
          maxDate: moment().endOf('day'),
        }
      case TimeFrame.LAST_MONTH:
        return {
          minDate: moment().subtract(1, 'month').startOf('day'),
          maxDate: moment().endOf('day'),
        }
      case TimeFrame.LAST_QUARTER:
        return {
          minDate: moment().subtract(3, 'months').startOf('day'),
          maxDate: moment().endOf('day'),
        }
      default:
        return {
          minDate: moment(timeFrame, 'YYYY').startOf('year'),
          maxDate: moment(timeFrame, 'YYYY').endOf('year'),
        }
    }
  }, [timeFrame])
  // const [dateFilter, setDateFilter] = React.useState<DateFilter>()
  const [searchTerm, setSearchTerm] = React.useState('')
  const filter = React.useCallback(
    (log: ActivityLog) => {
      if (!dateFilter) return true
      const logDate = moment(log.date)

      return logDate.isBetween(dateFilter.minDate, dateFilter.maxDate)
    },
    [dateFilter],
  )

  function handleTimeframeChange(event: SelectChangeEvent) {
    setTimeFrame(event.target.value)
  }
  function handleFuzzySearch(event: React.ChangeEvent<HTMLInputElement>) {
    setSearchTerm(event.target.value)
    logs.fuzzySearch = event.target.value
  }

  logs.filter = dateFilter ? filter : undefined

  console.log({ l: logs.entries })

  return (
    <Paper sx={{ p: 1 }}>
      <Stack spacing={1}>
        <Typography component={'h2'} variant='h4' gutterBottom>
          Activity Logs
        </Typography>
        <Box display='flex' gap={0.5} sx={{ flexDirection: { xs: 'column', md: 'row' } }}>
          <FormControl sx={{ minWidth: 225 }} size='small'>
            <InputLabel id='shortcut-filter-timespans-label'>Time Frame</InputLabel>
            <Select
              labelId='shortcut-filter-timespans-label'
              id='shortcut-filter-timespans'
              label='Time Frame'
              value={timeFrame}
              onChange={handleTimeframeChange}
            >
              {TimeFrames.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
              {years.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box flexGrow={1} />
          <TextField
            value={searchTerm}
            onChange={handleFuzzySearch}
            placeholder='Search Logs'
            sx={{ width: { xs: undefined, lg: 265 } }}
            size='small'
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <DataGrid
          autoHeight
          rows={logs.entries}
          slots={{
            noRowsOverlay: NoRowsOverlay,
          }}
          columns={isPublic ? columns.slice(0, -1) : columns}
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
          Stats
        </Typography>
        <DataGrid
          rows={logs.stats.data}
          columns={isPublic ? statColumns.slice(0, -1) : statColumns}
          slots={{ footer: TotalFooter }}
          slotProps={{ footer: { totals: logs.stats.totals, isPublic } }}
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
