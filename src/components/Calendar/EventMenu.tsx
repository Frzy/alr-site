import type { ICalendarEvent } from "@/types/common";
import { Box, Menu, type MenuProps } from "@mui/material";

interface EventMenuProps extends MenuProps {
  events?: ICalendarEvent[]
}

export default function EventMenu({ events = [], ...props }: EventMenuProps): JSX.Element {
  return <Menu {...props}>
    <Box>Menu</Box>
  </Menu>
}