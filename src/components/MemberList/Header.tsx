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
} from '@mui/material'
import FilterAltIcon from '@mui/icons-material/FilterAlt'
import GridViewIcon from '@mui/icons-material/GridView'
import ListIcon from '@mui/icons-material/List'
import DotsIcon from '@mui/icons-material/MoreVert'
import { type ENTITY, ROLES, type ROLE, ENTITIES } from '@/utils/constants'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import SearchField from '../SearchField'
import type { ListMode } from '@/types/common'
export interface ListFilter {
  query: string
  entity: ENTITY[]
  role: ROLE[]
  pastPresident: boolean
  lifetimeMember: boolean
}
export enum FILTER {
  ENTITY = 'entity',
  LIFETIME = 'lifetime',
  PAST_DIRECTOR = 'pastDirector',
  ROLE = 'role',
}

export type ListHeaderProps = {
  title?: string
  titleProps?: TypographyProps
  listMode?: ListMode
  disableSearch?: boolean
  disableFilters?: boolean
  disableOptions?: boolean
  filters?: FILTER[]
  onListModeChange?: (mode: ListMode) => void
  onFilterChange?: (filters: ListFilter) => void
} & ToolbarProps

const BASE_FILTERS = {
  entity: [],
  role: [],
  pastPresident: false,
  lifetimeMember: false,
  query: '',
}

export default function MemberListHeader({
  disableFilters,
  disableOptions,
  disableSearch,
  filters: filtersToShow = Object.values(FILTER),
  listMode = 'grid',
  onFilterChange,
  onListModeChange,
  title,
  titleProps,
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
      filters.query ||
      filters.lifetimeMember ||
      filters.pastPresident
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
            bgcolor: (theme) => theme.palette.memberList.header,
            px: showFilter ? 0.5 : 0,
            pb: showFilter ? 0.5 : 0,
          }}
        >
          <Collapse in={showFilter} mountOnEnter unmountOnExit>
            <Paper
              variant='outlined'
              sx={{ p: 1, bgcolor: (theme) => theme.palette.memberList.filterBackground }}
            >
              <Grid container spacing={2}>
                {filtersToShow.includes(FILTER.ENTITY) && (
                  <Grid xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography component='span'>Entity</Typography>
                      <ToggleButtonGroup
                        value={filters.entity}
                        onChange={(event, values) => {
                          updateFilters({ entity: values })
                        }}
                        size='small'
                      >
                        {ENTITIES.map((e, i) => (
                          <ToggleButton sx={{ minWidth: '75px' }} value={e} key={i}>
                            {e}
                          </ToggleButton>
                        ))}
                      </ToggleButtonGroup>
                    </Box>
                  </Grid>
                )}
                {filtersToShow.includes(FILTER.ROLE) && (
                  <Grid xs={12}>
                    <Autocomplete
                      multiple
                      size='small'
                      options={ROLES}
                      value={filters.role}
                      onChange={(event, value) => {
                        updateFilters({ role: value })
                      }}
                      renderInput={(params) => (
                        <TextField {...params} label='Role' placeholder='Select Role' />
                      )}
                      renderTags={(tagValue, getTagProps) =>
                        tagValue.map((option, index) => (
                          // eslint-disable-next-line react/jsx-key
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
                {hasFilters && (
                  <Grid xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      onClick={() => {
                        updateFilters(BASE_FILTERS)
                      }}
                    >
                      Clear Filters
                    </Button>
                  </Grid>
                )}
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
