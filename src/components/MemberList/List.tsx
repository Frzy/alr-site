import type { Member } from '@/types/common'
import { getFormatedPhoneNumber } from '@/utils/member'
import { Box, Link } from '@mui/material'
import {
  DataGrid,
  type GridValueFormatterParams,
  type GridColDef,
  type GridRenderCellParams,
} from '@mui/x-data-grid'
import dayjs, { type Dayjs } from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
dayjs.extend(customParseFormat)

interface MemberListProps {
  members: Member[]
}

const columns: GridColDef[] = [
  {
    field: 'name',
    headerName: 'Name',
    editable: false,
    disableColumnMenu: true,
    flex: 1,
    minWidth: 200,
    renderCell: (params: GridRenderCellParams) => {
      const { row, value } = params
      if (!value) return value

      return <Link href={`/member/${row.id}`}>{value}</Link>
    },
  },
  {
    field: 'nickName',
    headerName: 'Nickname',
    minWidth: 125,
    editable: false,
    disableColumnMenu: true,
  },
  {
    field: 'phoneNumber',
    headerName: 'Phone',
    width: 110,
    editable: false,
    disableColumnMenu: true,
    align: 'left',
    headerAlign: 'left',
    type: 'number',
    valueFormatter: (params: GridValueFormatterParams<string>) => {
      return getFormatedPhoneNumber(params.value)
    },
    renderCell: (params: GridRenderCellParams) => {
      const { formattedValue, value } = params
      if (!value) return value

      return <Link href={`tel:${value}`}>{formattedValue}</Link>
    },
  },
  {
    field: 'email',
    headerName: 'Email',
    flex: 1,
    editable: false,
    disableColumnMenu: true,
    minWidth: 250,
    renderCell: (params: GridRenderCellParams) => {
      const { value } = params
      if (!value) return value

      return (
        <Link sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }} href={`mailTo:${value}`}>
          {value}
        </Link>
      )
    },
  },
  {
    field: 'office',
    headerName: 'Office',
    minWidth: 115,
    editable: false,
    disableColumnMenu: true,
  },
  { field: 'role', headerName: 'Role', editable: false, disableColumnMenu: true, minWidth: 150 },
  {
    field: 'joined',
    headerName: 'Joined',
    width: 100,
    editable: false,
    disableColumnMenu: true,
    type: 'date',
    valueGetter: (params: GridValueFormatterParams<Dayjs>) => {
      const { value } = params

      if (!value) return ''

      return value.toDate()
    },
    valueFormatter: (params: GridValueFormatterParams<Dayjs>) => {
      const { value } = params

      if (!value) return '--'

      return dayjs(value).format('MMM-YYYY')
    },
  },
]

export default function MemberList({ members }: MemberListProps): JSX.Element {
  return (
    <Box>
      <DataGrid rows={members} columns={columns} disableRowSelectionOnClick />
    </Box>
  )
}
