import * as React from 'react'
import { stringAvatar } from '@/utils/helpers'
import EmailIcon from '@mui/icons-material/Email'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import ListHeader, { type ListFilter } from './Header'
import PhoneIcon from '@mui/icons-material/Phone'
import type { ListMode, Member } from '@/types/common'
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  CardActions,
  Button,
  Paper,
  CardActionArea,
  List,
  ListItemButton,
  ListItem,
  IconButton,
  ListItemAvatar,
  ListItemText,
  Alert,
} from '@mui/material'
import FuzzySearch from 'fuzzy-search'

interface MemberListProps {
  members: Member[]
  mode?: ListMode
  searchProps?: string[]
  title?: string
  renderListItem?: (props: MemberListItemProps, key: number) => JSX.Element
}

interface MemberListItemProps {
  member: Member
  mode: ListMode
}

export function OfficerListItem({ member, mode = 'grid' }: MemberListItemProps): JSX.Element {
  if (mode === 'list') {
    return (
      <ListItem
        divider
        disablePadding
        sx={{ pr: '115px', pl: 0 }}
        secondaryAction={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton>
              <PhoneIcon />
            </IconButton>
            <IconButton>
              <EmailIcon />
            </IconButton>
          </Box>
        }
      >
        <ListItemButton href={`/member/${member.id}`}>
          <ListItemAvatar>
            <Avatar src={member.image} {...stringAvatar(member)} />
          </ListItemAvatar>
          <ListItemText
            primary={member.office}
            secondary={
              <Box sx={{ display: 'flex', gap: 1 }} component='span'>
                <Typography sx={{ display: 'inline' }} component='span' color='text.primary'>
                  {member.name}
                </Typography>
                <Typography color='text.secondary' component='span'>
                  {member.nickName}
                </Typography>
              </Box>
            }
          />
        </ListItemButton>
      </ListItem>
    )
  }

  return (
    <Grid xs={12} sm={6} lg={3}>
      <Card variant='outlined'>
        <CardActionArea href={`/member/${member.id}`}>
          <CardContent sx={{ py: 0, px: 1 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Typography sx={{ fontSize: '2rem' }}>{member.office}</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Avatar src={member.image} {...stringAvatar(member)} />
              <Stack>
                <Typography variant='h6'>{member.name}</Typography>

                <Typography sx={{ fontSize: '1rem' }} color='text.secondary'>
                  {member.nickName}
                </Typography>
              </Stack>
            </Box>
          </CardContent>
        </CardActionArea>
        {(!!member.email || !!member.phoneNumber) && (
          <CardActions sx={{ justifyContent: 'space-between' }}>
            {member.email ? (
              <Button href={`mailto:${member.email}`} size='small' startIcon={<EmailIcon />}>
                Email
              </Button>
            ) : (
              <div />
            )}
            {member.phoneNumber ? (
              <Button
                href={`tel:${member.phoneNumber?.replace(/\D/g, '')}`}
                size='small'
                startIcon={<PhoneIcon />}
              >
                Call
              </Button>
            ) : (
              <div />
            )}
          </CardActions>
        )}
      </Card>
    </Grid>
  )
}

export function MemberListItem({ member, mode = 'grid' }: MemberListItemProps): JSX.Element {
  return <div></div>
}

export default function MemberList({
  members: initMembers,
  searchProps = ['name', 'nickName'],
  mode: initMode = 'grid',
  title,
  renderListItem,
}: MemberListProps): JSX.Element {
  const [mode, setMode] = React.useState<ListMode>(initMode)
  const [filters, setFilters] = React.useState<ListFilter | null>(null)
  const members = React.useMemo(() => {
    if (filters) {
      const filteredMembers = initMembers.filter((m) => {
        let hasEntity = !filters.entity.length
        let hasRole = !filters.role.length
        let hasLifetime = !filters.lifetimeMember
        let isPastPresident = !filters.pastPresident

        if (filters.entity.length && m.entity) {
          hasEntity = m.entity.some((e) => filters.entity.includes(e))
        }

        if (filters.role.length && m.role) {
          hasRole = filters.role.includes(m.role)
        }

        if (filters.lifetimeMember) {
          hasLifetime = m.isLifeTimeMember
        }
        if (filters.pastPresident) {
          isPastPresident = m.isPastPresident
        }

        return hasEntity && hasRole && hasLifetime && isPastPresident
      })

      if (filters.query) {
        const searcher = new FuzzySearch(filteredMembers, searchProps)

        return searcher.search(filters.query)
      }

      return filteredMembers
    }

    return initMembers
  }, [initMembers, filters, searchProps])

  function handleFilterChange(filter: ListFilter): void {
    const hasFilters =
      !!filter.entity.length ||
      !!filter.role.length ||
      !!filter.query ||
      !!filter.lifetimeMember ||
      !!filter.pastPresident

    setFilters(hasFilters ? filter : null)
  }

  return (
    <Paper sx={{ width: '100%' }}>
      <ListHeader
        variant='dense'
        listMode={mode}
        title={title}
        onListModeChange={(newMode) => {
          setMode(newMode)
        }}
        onFilterChange={handleFilterChange}
      />
      {!initMembers.length && (
        <Box sx={{ p: 2, pb: 1 }}>
          <Alert severity='error'>No Members</Alert>
        </Box>
      )}
      {initMembers.length && !members.length && (
        <Box sx={{ p: 2, pb: 1 }}>
          <Alert severity='info'>No matching members found</Alert>
        </Box>
      )}
      {mode === 'grid' ? (
        <Grid container spacing={1} sx={{ borderRadius: 0, p: 1 }}>
          {members.map((m, index) => {
            const props = { member: m, mode }

            if (renderListItem) return renderListItem(props, index)

            return <MemberListItem key={index} member={m} mode={mode} />
          })}
        </Grid>
      ) : (
        <List disablePadding>
          {members.map((m, index) => {
            const props = { member: m, mode }

            if (renderListItem) return renderListItem(props, index)

            return <MemberListItem key={index} member={m} mode={mode} />
          })}
        </List>
      )}
    </Paper>
  )
}
