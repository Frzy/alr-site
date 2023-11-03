import * as React from 'react'
import {
  Avatar,
  Box,
  Chip,
  Paper,
  PaperProps,
  Tooltip,
  Typography,
  Link,
  Skeleton,
} from '@mui/material'
import { ENTITY, ENTITY_COLORS, ROLE } from '@/utils/constants'
import { stringToColor } from '@/utils/helpers'
import CharterMemberIcon from '@mui/icons-material/SportsMotorsports'
import EmailIcon from '@mui/icons-material/Email'
import Grid from '@mui/material/Unstable_Grid2'
import Image from 'next/image'
import NextLink from 'next/link'
import PhoneIcon from '@mui/icons-material/Phone'
import ProspectIcon from '@mui/icons-material/Moped'
import RiderIcon from '@mui/icons-material/TwoWheeler'
import SupporterIcon from '@mui/icons-material/VolunteerActivism'

import type { Member } from '@/types/common'

interface RosterItemProps extends PaperProps {
  member: Member
}

function stringAvatar(member: Member) {
  return {
    sx: {
      bgcolor: stringToColor(member.name),
    },
    children: `${member.firstName.slice(0, 1)}${member.lastName.slice(0, 1)}`,
    alt: member.name,
  }
}
function entityChip(entity: ENTITY) {
  return {
    label: entity,
    sx: {
      bgcolor: ENTITY_COLORS[entity].background,
      color: ENTITY_COLORS[entity].text,
    },
  }
}

export default function RosterItem({ member, sx, ...paperProps }: RosterItemProps) {
  const RoleIcons = React.useMemo(() => {
    switch (member.role) {
      case ROLE.CHARTER:
        return <CharterMemberIcon />
      case ROLE.MEMBER:
        return <RiderIcon />
      case ROLE.CANIDATE_SUPPORTER:
      case ROLE.SUPPORTER:
        return <SupporterIcon />
      case ROLE.PROSPECT:
        return <ProspectIcon />
    }
  }, [member])
  const [hover, setHover] = React.useState(false)

  function getRideCount() {
    if (member.rides === undefined) return null

    return (
      <Box
        display='flex'
        alignItems='center'
        gap={1}
        pb={1}
        sx={{
          '& .no-ride': (theme) => ({
            opacity: 0.15,
            [theme.getColorSchemeSelector('dark')]: {
              opacity: 1,
            },
          }),
        }}
      >
        <Typography variant='subtitle2'>Rides:</Typography>
        <Image
          src={member.rides < 1 ? '/images/american_skull_black.png' : '/images/american_skull.png'}
          className={member.rides < 1 ? 'no-ride' : undefined}
          width={24}
          height={24}
          alt='ride'
        />
        <Image
          src={member.rides < 2 ? '/images/american_skull_black.png' : '/images/american_skull.png'}
          className={member.rides < 2 ? 'no-ride' : undefined}
          width={24}
          height={24}
          alt='ride'
        />
        <Image
          src={member.rides < 3 ? '/images/american_skull_black.png' : '/images/american_skull.png'}
          className={member.rides < 3 ? 'no-ride' : undefined}
          width={24}
          height={24}
          alt='ride'
        />
      </Box>
    )
  }

  return (
    <Paper
      variant={hover ? 'elevation' : 'outlined'}
      elevation={hover ? 10 : undefined}
      {...paperProps}
      sx={{
        display: 'flex',
        gap: 1,
        px: 1,
        py: 0.5,
        cursor: 'pointer',
        border: (theme) => ({ border: `1px solid ${theme.palette.divider}` }),
        ...sx,
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => (window.location.href = `/member/${member.id}`)}
    >
      <Box display='flex' alignSelf='flex-start' pt={1}>
        {member.image ? (
          <Avatar alt={member.name} src={member.image} />
        ) : (
          <Avatar {...stringAvatar(member)} />
        )}
      </Box>
      <Box flexGrow={1} maxWidth='calc(100% - 95px)'>
        <Grid container spacing={1}>
          <Grid xs={12}>
            <Box display='flex' alignItems='center'>
              <Typography variant='subtitle2' fontSize='1.15rem' flexGrow={1}>
                {member.name}
              </Typography>
              {member.office && <Chip variant='outlined' label={member.office} size='small' />}
              {member.role === ROLE.PROSPECT && !!member.rides && member.rides >= 3 && (
                <Chip variant='outlined' label='Ready' size='small' />
              )}
            </Box>
            {member.nickName && <Typography variant='subtitle2'>{member.nickName}</Typography>}
          </Grid>
          {member.phoneNumber && (
            <Grid xs={12} display='flex' alignItems='center' gap={1}>
              <Link
                href={`tel:${member.phoneNumber?.replace(/\D/g, '')}`}
                component={NextLink}
                sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}
              >
                <PhoneIcon />
                <Typography component='span' noWrap>
                  {member.phoneNumber}
                </Typography>
              </Link>
            </Grid>
          )}
          {member.email && (
            <Grid xs={12} display='flex' alignItems='center' gap={1}>
              <Link
                href={`mailto:${member.email}`}
                component={NextLink}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  width: '100%',
                }}
              >
                <EmailIcon />
                <Typography component='span' noWrap>
                  {member.email}
                </Typography>
              </Link>
            </Grid>
          )}
          {member.role === ROLE.PROSPECT && getRideCount()}
        </Grid>
      </Box>
      <Box
        alignSelf='flex-start'
        display='flex'
        flexDirection='column'
        alignItems='center'
        gap={0.5}
      >
        {RoleIcons && <Tooltip title={member.role}>{RoleIcons}</Tooltip>}
        {member.entity &&
          member.entity.map((e) => <Chip key={e} size='small' {...entityChip(e)} />)}
      </Box>
    </Paper>
  )
}

export function SkeletonRosterItem() {
  return (
    <Paper variant='outlined' sx={{ p: 1 }}>
      <Box display='flex' gap={1} width='100%'>
        <Skeleton
          variant='circular'
          animation='wave'
          width={40}
          height={40}
          sx={{ alignSelf: 'center' }}
        />
        <Box flexGrow={1}>
          <Skeleton width={150} />
          <Skeleton width={100} />
        </Box>
        <Skeleton
          variant='circular'
          animation='wave'
          width={75}
          height={20}
          sx={{ borderRadius: '20px' }}
        />
        <Skeleton variant='circular' animation='wave' width={20} height={20} />
      </Box>
    </Paper>
  )
}
