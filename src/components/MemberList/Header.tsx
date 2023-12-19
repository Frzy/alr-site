import * as React from 'react'
import SearchIcon from '@mui/icons-material/Search'
import {
  Box,
  InputBase,
  IconButton,
  InputAdornment,
  Toolbar,
  type ToolbarProps,
  Typography,
  useTheme,
  Collapse,
  Paper,
  Menu,
  ToggleButtonGroup,
  ToggleButton,
  ListItem,
  Chip,
  Switch,
  FormControlLabel,
  Button,
  Hidden,
  Autocomplete,
  TextField,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import FilterAltIcon from '@mui/icons-material/FilterAlt'
import GridViewIcon from '@mui/icons-material/GridView'
import ListIcon from '@mui/icons-material/List'
import DotsIcon from '@mui/icons-material/MoreVert'
import { type ENTITY, ROLES, type ROLE, ENTITIES } from '@/utils/constants'
import Grid from '@mui/material/Unstable_Grid2/Grid2'

type ListMode = 'list' | 'grid'
export interface ListFilter {
  query: string
  entity: ENTITY[]
  role: ROLE[]
  pastPresident: boolean
  lifetimeMember: boolean
}
type ListHeaderProps = {
  title?: string
  listMode?: ListMode
  hideSearch?: boolean
  hideFilter?: boolean
  hideOptions?: boolean
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

export default function ListHeader({
  title,
  hideSearch,
  hideFilter,
  hideOptions,
  listMode = 'grid',
  onListModeChange,
  onFilterChange,
  ...toolbarProps
}: ListHeaderProps): JSX.Element {
  const theme = useTheme()
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
          pl: { sm: 2 },
          pr: 1,
          borderTopLeftRadius: '4px',
          borderTopRightRadius: '4px',
          ...toolbarProps.sx,
          bgcolor: theme.palette.memberList.header,
          display: !hideSearch ? 'flex' : undefined,
          flexDirection: !hideSearch
            ? {
                xs: 'column',
                md: 'row',
              }
            : 'row',
          paddingBottom: !hideSearch
            ? {
                xs: theme.spacing(1),
                md: 0,
              }
            : 0,
          alignItems: !hideSearch
            ? {
                xs: 'flex-start',
                md: 'center',
              }
            : undefined,
        }}
      >
        <Hidden mdDown>
          {title ? (
            <Typography sx={{ flex: '1 1 100%', p: !hideSearch ? 1 : undefined }} variant='h5'>
              {title}
            </Typography>
          ) : (
            <Box sx={{ flex: 1 }} />
          )}
        </Hidden>
        <Hidden mdUp>
          {(!!title || !hideFilter || !hideOptions) && (
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              {title ? (
                <Typography
                  sx={{
                    flex: '1 1 100%',
                    p: 1,
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                  }}
                  variant='h5'
                >
                  {title}
                </Typography>
              ) : (
                <Box sx={{ flex: 1 }} />
              )}
              {!hideFilter && (
                <IconButton
                  onClick={() => {
                    setShowFilter(!showFilter)
                  }}
                >
                  <FilterAltIcon color={hasFilters ? 'primary' : 'inherit'} />
                </IconButton>
              )}
              {!hideOptions && (
                <IconButton
                  onClick={(event) => {
                    setOptionAnchorEl(event.currentTarget)
                  }}
                >
                  <DotsIcon />
                </IconButton>
              )}
            </Box>
          )}
        </Hidden>

        <Hidden mdUp>
          {!hideSearch && (
            <Box
              sx={{
                position: 'relative',
                marginLeft: 0,
                width: '100%',
              }}
            >
              <Box
                sx={{
                  padding: theme.spacing(0, 2),
                  height: '100%',
                  position: 'absolute',
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SearchIcon />
              </Box>
              <InputBase
                fullWidth
                sx={{
                  color: 'inherit',
                  borderRadius: theme.shape.borderRadius,
                  backgroundColor: theme.palette.memberList.search.main,
                  '&:hover': {
                    backgroundColor: theme.palette.memberList.search.hover,
                  },
                  '&:has(.MuiInputBase-input:focus-visible)': {
                    backgroundColor: theme.palette.memberList.search.focus,
                  },
                  '& .MuiInputBase-input': {
                    padding: theme.spacing(1, 1, 1, 0),
                    // vertical padding + font size from searchIcon
                    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
                  },
                }}
                endAdornment={
                  filters.query.length ? (
                    <InputAdornment position='start'>
                      <IconButton
                        onClick={() => {
                          updateFilters({ query: '' })
                        }}
                        size='small'
                      >
                        <CloseIcon />
                      </IconButton>
                    </InputAdornment>
                  ) : undefined
                }
                placeholder='Search…'
                inputProps={{ 'aria-label': 'search' }}
                value={filters.query}
                onChange={(event) => {
                  const { value } = event.target
                  updateFilters({ query: value })
                }}
              />
            </Box>
          )}
        </Hidden>
        <Hidden mdDown>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {!hideSearch && (
              <Box
                sx={{
                  position: 'relative',

                  marginLeft: {
                    xs: 0,
                    md: theme.spacing(1),
                  },
                  width: {
                    xs: '100%',
                    md: 'auto',
                  },
                }}
              >
                <Box
                  sx={{
                    padding: theme.spacing(0, 2),
                    height: '100%',
                    position: 'absolute',
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <SearchIcon />
                </Box>
                <InputBase
                  sx={{
                    color: 'inherit',
                    borderRadius: theme.shape.borderRadius,
                    backgroundColor: theme.palette.memberList.search.main,
                    '&:hover': {
                      backgroundColor: theme.palette.memberList.search.hover,
                    },
                    '&:has(.MuiInputBase-input:focus-visible)': {
                      backgroundColor: theme.palette.memberList.search.focus,
                    },
                    '& .MuiInputBase-input': {
                      padding: theme.spacing(1, 1, 1, 0),
                      // vertical padding + font size from searchIcon
                      paddingLeft: `calc(1em + ${theme.spacing(4)})`,
                      transition: theme.transitions.create('width'),
                      width: '100%',
                      [theme.breakpoints.up('sm')]: {
                        width: '12ch',
                        '&:focus': {
                          width: '25ch',
                        },
                      },
                    },
                  }}
                  endAdornment={
                    filters.query.length ? (
                      <InputAdornment position='start'>
                        <IconButton
                          onClick={() => {
                            updateFilters({ query: '' })
                          }}
                          size='small'
                        >
                          <CloseIcon />
                        </IconButton>
                      </InputAdornment>
                    ) : undefined
                  }
                  placeholder='Search…'
                  inputProps={{ 'aria-label': 'search' }}
                  value={filters.query}
                  onChange={(event) => {
                    const { value } = event.target

                    updateFilters({ query: value })
                  }}
                />
              </Box>
            )}
            {!hideFilter && (
              <IconButton
                onClick={() => {
                  setShowFilter(!showFilter)
                }}
              >
                <FilterAltIcon color={hasFilters ? 'primary' : 'inherit'} />
              </IconButton>
            )}
            {!hideOptions && (
              <IconButton
                onClick={(event) => {
                  setOptionAnchorEl(event.currentTarget)
                }}
              >
                <DotsIcon />
              </IconButton>
            )}
          </Box>
        </Hidden>
      </Toolbar>
      {!hideFilter && (
        <Box
          sx={{
            transition: (theme) =>
              theme.transitions.create('all', { duration: theme.transitions.duration.short }),
            bgcolor: theme.palette.memberList.header,
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
                <Grid xs={12} lg={4}>
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
                <Grid xs={12} sm={6} lg={4}>
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
                <Grid xs={12} sm={6} lg={4}>
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

                <Grid xs={12}>
                  <Autocomplete
                    multiple
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
      {!hideOptions && (
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
            <Typography>View Mode</Typography>
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
