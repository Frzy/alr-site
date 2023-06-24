import * as React from 'react'
import { Avatar, Box, Chip, Paper, PaperProps, Tooltip, Typography, Link } from '@mui/material'
import { ENTITY, ENTITY_COLORS, MEMBER_ROLE } from '@/utils/constants'
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

const NO_RIDE_COLOR = {
  light: 'rgba(0, 0, 0, 0.3)',
  dark: 'rgba(255, 255, 255, 0.3)',
}
const RIDE_COLOR = 'green'

export default function RosterItem({ member, sx, ...paperProps }: RosterItemProps) {
  const RoleIcons = React.useMemo(() => {
    switch (member.role) {
      case MEMBER_ROLE.CHARTER:
        return <CharterMemberIcon />
      case MEMBER_ROLE.MEMBER:
        return <RiderIcon />
      case MEMBER_ROLE.SUPPORTER:
        return <SupporterIcon />
      case MEMBER_ROLE.PROSPECT:
        return <ProspectIcon />
    }
  }, [member])

  function getRideCount() {
    if (member.rides === undefined) return null

    return (
      <Box display='flex' alignItems='center' gap={1} pb={1}>
        <Typography variant='subtitle2'>Rides:</Typography>
        <Image
          src={member.rides < 1 ? '/images/american_skull_black.png' : '/images/american_skull.png'}
          width={24}
          height={24}
          alt='ride'
        />
        <Image
          src={member.rides < 2 ? '/images/american_skull_black.png' : '/images/american_skull.png'}
          width={24}
          height={24}
          alt='ride'
        />
        <Image
          src={member.rides < 3 ? '/images/american_skull_black.png' : '/images/american_skull.png'}
          width={24}
          height={24}
          alt='ride'
        />
      </Box>
    )
  }

  return (
    <Paper
      variant='outlined'
      {...paperProps}
      sx={{ display: 'flex', gap: 1, px: 1, py: 0.5, ...sx }}
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
              {member.role === MEMBER_ROLE.PROSPECT && !!member.rides && member.rides >= 3 && (
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
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <PhoneIcon />
                {member.phoneNumber}
              </Link>
            </Grid>
          )}
          {member.email && (
            <Grid xs={12} display='flex' alignItems='center' gap={1}>
              <Link
                href={`mailto:${member.email}`}
                component={NextLink}
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <EmailIcon />
                {member.email}
              </Link>
              <Typography component='a'></Typography>
            </Grid>
          )}
          {member.role === MEMBER_ROLE.PROSPECT && getRideCount()}
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
