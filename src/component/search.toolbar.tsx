import * as React from 'react'
import SearchIcon from '@mui/icons-material/Search'
import { Box, InputBase, Toolbar, ToolbarProps, Typography, useTheme } from '@mui/material'

type SearchToolbarProps = {
  title?: string
  hideSearch?: boolean
  onSearchChange?: (term: string) => void
} & ToolbarProps

export default function SearchToolbar({ title, hideSearch, onSearchChange }: SearchToolbarProps) {
  const theme = useTheme()
  const [searchTerm, setSearchTerm] = React.useState('')

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: 1,
        bgcolor: theme.vars.palette.rosterHeader,
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
      {title && (
        <Typography sx={{ flex: '1 1 100%', p: !hideSearch ? 1 : undefined }} variant='h5'>
          {title}
        </Typography>
      )}
      {!hideSearch && (
        <Box
          sx={{
            position: 'relative',
            borderRadius: theme.shape.borderRadius,
            backgroundColor: theme.vars.palette.headerSearch.main,
            '&:hover': {
              backgroundColor: theme.vars.palette.headerSearch.hover,
            },
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
              '& .MuiInputBase-input': {
                padding: theme.spacing(1, 1, 1, 0),
                // vertical padding + font size from searchIcon
                paddingLeft: `calc(1em + ${theme.spacing(4)})`,
                transition: theme.transitions.create('width'),
                width: '100%',
                [theme.breakpoints.up('sm')]: {
                  width: '12ch',
                  '&:focus': {
                    width: '50ch',
                  },
                },
              },
            }}
            placeholder='Search…'
            inputProps={{ 'aria-label': 'search' }}
            value={searchTerm}
            onChange={(event) => {
              const { value } = event.target

              setSearchTerm(value)
              if (onSearchChange) onSearchChange(value)
            }}
          />
        </Box>
      )}
    </Toolbar>
  )
}
