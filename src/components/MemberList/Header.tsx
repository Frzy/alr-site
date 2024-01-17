import * as React from 'react'
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Collapse,
  FormControlLabel,
  IconButton,
  ListItem,
  Menu,
  Paper,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  type ToolbarProps,
  type TypographyProps,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import { type ENTITY, ROLES, type ROLE, ENTITIES } from '@/utils/constants'
import DotsIcon from '@mui/icons-material/MoreVert'
import FilterAltIcon from '@mui/icons-material/FilterAlt'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import GridViewIcon from '@mui/icons-material/GridView'
import ListIcon from '@mui/icons-material/List'
import SearchField from '../SearchField'
import type { GROUP_FILTER, ListMode } from '@/types/common'

export interface ListFilter {
  query: string
  entity: ENTITY[]
  role: ROLE[]
  pastPresident: boolean
  lifetimeMember: boolean
  group: GROUP_FILTER
  sortBy: string
}
export enum FILTER {
  ENTITY = 'entity',
  LIFETIME = 'lifetime',
  PAST_DIRECTOR = 'pastDirector',
  ROLE = 'role',
  GROUP = 'group',
  SORTBY = 'sortBy',
}

export type ListHeaderProps = {
  availableRoles?: ROLE[]
  disableFilters?: boolean
  disableOptions?: boolean
  disableSearch?: boolean
  filteredTotal?: number
  filters?: FILTER[]
  listMode?: ListMode
  onFilterChange?: (filters: ListFilter) => void
  onListModeChange?: (mode: ListMode) => void
  title?: string
  titleProps?: TypographyProps
  total?: number
} & ToolbarProps

export const BASE_FILTERS: ListFilter = {
  entity: [],
  role: [],
  pastPresident: false,
  lifetimeMember: false,
  query: '',
  group: 'all',
  sortBy: 'name',
}

export default function MemberListHeader({
  availableRoles = [],
  disableFilters,
  disableOptions,
  disableSearch,
  filteredTotal,
  filters: filtersToShow = Object.values(FILTER),
  listMode = 'grid',
  onFilterChange,
  onListModeChange,
  title,
  titleProps,
  total,
  ...toolbarProps
}: ListHeaderProps): JSX.Element {
  const [showFilter, setShowFilter] = React.useState(false)
  const [filters, setFilters] = React.useState<ListFilter>({ ...BASE_FILTERS })
  const [optionAnchorEl, setOptionAnchorEl] = React.useState<HTMLElement | null>(null)
  const optionMenuOpen = Boolean(optionAnchorEl)
  const hasFilters = React.useMemo(() => {
    return (
      filters.entity.length ||
      filters.role.length ||
      !!filters.query ||
      filters.lifetimeMember ||
      filters.pastPresident ||
      filters.group !== 'all'
    )
  }, [filters])

  function handldMenuOptionClose(): void {
    setOptionAnchorEl(null)
  }
  function handleListModeClick(
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    value: ListMode,
  ): void {
    if (onListModeChange) onListModeChange(value)
    handldMenuOptionClose()
  }
  function updateFilters(mixin: Partial<ListFilter>): void {
    const newFilters = { ...filters, ...mixin }
    setFilters(newFilters)
    if (onFilterChange) onFilterChange(newFilters)
  }

  return (
    <Box>
      <Toolbar
        {...toolbarProps}
        sx={{
          p: 1,
          gap: 0.5,
          borderTopLeftRadius: 0.5,
          borderTopRightRadius: 0.5,
          ...toolbarProps.sx,
        }}
      >
        {title ? (
          <>
            <Typography
              sx={{
                flex: '1 1 100%',
                p: 1,
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
              variant='h5'
              {...titleProps}
            >
              {title}
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            {!disableSearch && (
              <SearchField
                value={filters.query}
                placeholder='Search Roster'
                size='small'
                animate
                sx={{
                  '& .MuiInputBase-root': {
                    borderRadius: 5,
                  },
                }}
                onChange={(event) => {
                  const { value } = event.target
                  updateFilters({ query: value })
                }}
              />
            )}
          </>
        ) : !disableSearch ? (
          <>
            <SearchField
              value={filters.query}
              placeholder='Search Roster'
              size='small'
              animate
              sx={{
                '& .MuiInputBase-root': {
                  borderRadius: 5,
                },
              }}
              onChange={(event) => {
                const { value } = event.target
                updateFilters({ query: value })
              }}
            />
            <Box sx={{ flexGrow: 1 }} />
          </>
        ) : (
          <Box sx={{ flexGrow: 1 }} />
        )}

        {!disableFilters && (
          <IconButton
            onClick={() => {
              setShowFilter(!showFilter)
            }}
          >
            <FilterAltIcon color={hasFilters ? 'primary' : 'inherit'} />
          </IconButton>
        )}
        {!disableOptions && (
          <IconButton
            onClick={(event) => {
              setOptionAnchorEl(event.currentTarget)
            }}
          >
            <DotsIcon />
          </IconButton>
        )}
      </Toolbar>
      {!disableFilters && (
        <Box
          sx={{
            transition: (theme) =>
              theme.transitions.create('all', { duration: theme.transitions.duration.short }),
            px: showFilter ? 0.5 : 0,
            pb: showFilter ? 0.5 : 0,
          }}
        >
          <Collapse in={showFilter} mountOnEnter unmountOnExit>
            <Paper
              variant='outlined'
              sx={{ p: 1, pt: 2, bgcolor: (theme) => theme.palette.memberList.filterBackground }}
            >
              <Grid container spacing={2}>
                {filtersToShow.includes(FILTER.GROUP) && (
                  <Grid xs={12} md={5}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        alignItems: { xs: 'flex-start', md: 'center' },
                        gap: 1,
                      }}
                    >
                      <Typography component='span'>Group</Typography>
                      <ToggleButtonGroup
                        value={filters.group}
                        onChange={(event, value) => {
                          updateFilters({ group: value })
                        }}
                        size='small'
                        exclusive
                      >
                        <ToggleButton
                          sx={{ fontSize: '0.75rem', minWidth: { xs: 60, md: 80 } }}
                          value={'all'}
                        >
                          All
                        </ToggleButton>
                        <ToggleButton
                          sx={{ fontSize: '0.75rem', minWidth: { xs: 60, md: 80 } }}
                          value={'officers'}
                        >
                          EBoard
                        </ToggleButton>
                        <ToggleButton
                          sx={{ fontSize: '0.75rem', minWidth: { xs: 60, md: 80 } }}
                          value={'members'}
                        >
                          Members
                        </ToggleButton>
                        <ToggleButton
                          sx={{ fontSize: '0.75rem', minWidth: { xs: 60, md: 80 } }}
                          value={'candidates'}
                        >
                          Candidates
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </Box>
                  </Grid>
                )}
                {filtersToShow.includes(FILTER.ENTITY) && (
                  <Grid xs={12} md={4}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        alignItems: { xs: 'flex-start', md: 'center' },
                        gap: 1,
                      }}
                    >
                      <Typography component='span'>Entity</Typography>
                      <ToggleButtonGroup
                        value={filters.entity}
                        onChange={(event, values) => {
                          updateFilters({ entity: values })
                        }}
                        size='small'
                      >
                        {ENTITIES.map((e, i) => (
                          <ToggleButton
                            sx={{ fontSize: '0.75rem', minWidth: 50 }}
                            value={e}
                            key={i}
                          >
                            {e}
                          </ToggleButton>
                        ))}
                      </ToggleButtonGroup>
                    </Box>
                  </Grid>
                )}
                {filtersToShow.includes(FILTER.SORTBY) && (
                  <Grid xs={12} md={3}>
                    <FormControl size='small' sx={{ minWidth: { xs: '100%', md: 50 } }}>
                      <InputLabel id='sortyby-select-label'>Sort By</InputLabel>
                      <Select
                        labelId='sortyby-select-label'
                        id='sortyby-select'
                        value={filters.sortBy}
                        label='Sort By'
                        onChange={(event) => {
                          updateFilters({ sortBy: event.target.value })
                        }}
                      >
                        <MenuItem value={'name'}>Name (Asc)</MenuItem>
                        <MenuItem value={'-name'}>Name (Desc)</MenuItem>
                        <MenuItem value={'lastName'}>Last Name (Asc)</MenuItem>
                        <MenuItem value={'-lastName'}>Last Name (Desc)</MenuItem>
                        <MenuItem value={'role'}>Role (Asc)</MenuItem>
                        <MenuItem value={'-role'}>Role (Desc)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                )}
                {filtersToShow.includes(FILTER.ROLE) && (
                  <Grid xs={12}>
                    <Autocomplete
                      multiple
                      size='small'
                      options={availableRoles?.length ? availableRoles : ROLES}
                      value={filters.role}
                      onChange={(event, value) => {
                        updateFilters({ role: value })
                      }}
                      renderInput={(params) => (
                        <TextField {...params} label='Role' placeholder='Select Role' />
                      )}
                      renderTags={(tagValue, getTagProps) =>
                        tagValue.map((option, index) => (
                          <Chip label={option} {...getTagProps({ index })} key={index} />
                        ))
                      }
                    />
                  </Grid>
                )}
                {filtersToShow.includes(FILTER.LIFETIME) && (
                  <Grid xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={filters.lifetimeMember}
                          onChange={(event, checked) => {
                            updateFilters({ lifetimeMember: checked })
                          }}
                        />
                      }
                      label='Lifetime Members Only'
                    />
                  </Grid>
                )}
                {filtersToShow.includes(FILTER.PAST_DIRECTOR) && (
                  <Grid xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={filters.pastPresident}
                          onChange={(event, checked) => {
                            updateFilters({ pastPresident: checked })
                          }}
                        />
                      }
                      label='Past Directors Only'
                    />
                  </Grid>
                )}

                <Grid xs={12} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography component='span'>{`Viewing ${filteredTotal} of ${total} members`}</Typography>
                  </Box>
                  <Button
                    sx={{
                      transition: (theme) =>
                        theme.transitions.create('all', {
                          duration: theme.transitions.duration.short,
                        }),
                      opacity: hasFilters ? 1 : 0,
                      transform: hasFilters ? 'scaleX(1)' : 'scaleX(0)',
                    }}
                    onClick={() => {
                      updateFilters(BASE_FILTERS)
                    }}
                  >
                    Clear Filters
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Collapse>
        </Box>
      )}
      {!disableOptions && (
        <Menu
          anchorEl={optionAnchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          sx={{ '& .MuiList-root': { p: 0 } }}
          open={optionMenuOpen}
          onClose={handldMenuOptionClose}
        >
          <ListItem sx={{ gap: 2 }}>
            <Typography>View</Typography>
            <ToggleButtonGroup onChange={handleListModeClick} exclusive>
              <ToggleButton size='small' value='list' selected={listMode === 'list'}>
                <ListIcon />
              </ToggleButton>
              <ToggleButton size='small' value='grid' selected={listMode === 'grid'}>
                <GridViewIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </ListItem>
        </Menu>
      )}
    </Box>
  )
}
