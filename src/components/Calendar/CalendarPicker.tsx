import * as React from 'react'
import { useCalendar } from '@/hooks/useCalendar'
import { CALENDAR_VIEWS } from '@/utils/constants'
import { startCase } from '@/utils/helpers'
import { Button, Menu, MenuItem } from '@mui/material'
import DownArrow from '@mui/icons-material/ArrowDropDown'

export default function CalendarPicker(): JSX.Element {
  const { view, setView } = useCalendar()
  const [calendarTypeAnchorEl, setCalendarTypeAnchorEl] = React.useState<HTMLElement | null>(null)
  const openCalendarTypeMenu = Boolean(calendarTypeAnchorEl)

  function handleCalendarTypeClick(event: React.MouseEvent<HTMLButtonElement>): void {
    setCalendarTypeAnchorEl(event.currentTarget)
  }
  function handleCalendarTypeClose(): void {
    setCalendarTypeAnchorEl(null)
  }

  return (
    <React.Fragment>
      <Button
        variant='outlined'
        color='inherit'
        endIcon={<DownArrow />}
        onClick={handleCalendarTypeClick}
      >
        {startCase(view)}
      </Button>
      <Menu
        id='basic-menu'
        anchorEl={calendarTypeAnchorEl}
        open={openCalendarTypeMenu}
        onClose={handleCalendarTypeClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        {CALENDAR_VIEWS.map((v) => (
          <MenuItem
            key={v}
            onClick={() => {
              handleCalendarTypeClose()
              setView(v)
            }}
            selected={view === v}
          >
            {startCase(v)}
          </MenuItem>
        ))}
      </Menu>
    </React.Fragment>
  )
}
