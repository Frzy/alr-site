'use client'

import type { Member } from '@/types/common'
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  type Theme,
  Typography,
  useMediaQuery,
} from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import TextDisplay from '../TextDisplay'
import { type ENTITY, ENTITY_OBJECT, ROLE } from '@/utils/constants'
import React from 'react'
import { getFormatedPhoneNumber } from '@/utils/member'
import AvatarDisplay from '../AvatarDisplay'
import { formatNumber } from '@/utils/helpers'

interface MemberInformationProps {
  member: Member
  permission: 'admin' | 'member' | 'unknown'
  isLoggedIn?: boolean
  onEdit?: () => void
}
export default function MemberInformation({
  member,
  permission = 'unknown',
  isLoggedIn,
  onEdit,
}: MemberInformationProps): JSX.Element {
  const isSmall = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))

  const isAdmin = permission === 'admin'
  const isMember = permission !== 'unknown'
  const hasEmergencyContacts = React.useMemo(() => {
    return member.emergencyContacts.some((e) => e.name)
  }, [member])

  return (
    <Paper sx={{ p: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography component='h3' variant='h5'>
          Information
        </Typography>
        {(!!isLoggedIn || isAdmin) && (
          <Button
            onClick={() => {
              if (onEdit) onEdit()
            }}
          >
            Edit
          </Button>
        )}
      </Box>

      <Grid container spacing={1}>
        <Grid xs={6} md={4} lg={3}>
          <TextDisplay label='Name' value={member.name} fullWidth />
        </Grid>
        {(isAdmin || isLoggedIn) && (
          <Grid xs={6} md={4} lg={3}>
            <TextDisplay label='Membership Id' value={member.membershipId} fullWidth />
          </Grid>
        )}
        <Grid xs={6} md={4} lg={3}>
          <TextDisplay label='Nickname' value={member.nickName} fullWidth />
        </Grid>
        {member.role === ROLE.PROSPECT ? (
          <Grid xs={6} md={4} lg={3}>
            <TextDisplay label='Rides' value={`${member.rides ? member.rides : 0} / 3`} fullWidth />
          </Grid>
        ) : (
          <Grid xs={6} md={4} lg={3}>
            <TextDisplay label='Joined On' value={member.joined} fullWidth />
          </Grid>
        )}
        <Grid xs={6} md={4} lg={3}>
          <TextDisplay label='Status' value={member.role} fullWidth />
        </Grid>
        {!!member.yearsActive && (
          <Grid xs={6} md={4} lg={3}>
            <TextDisplay label='Years Active' value={member.yearsActive} fullWidth />
          </Grid>
        )}
        {!!member.office && (
          <Grid xs={6} md={4} lg={3}>
            <TextDisplay label='Office' value={member.office} fullWidth />
          </Grid>
        )}
        {isMember && (
          <Grid xs={12} sm={6} lg={3}>
            <TextDisplay label='Email' value={member.email} fullWidth />
          </Grid>
        )}
        {isMember && (
          <Grid xs={12} sm={6} lg={3}>
            <TextDisplay
              label='Phone Number'
              value={member.phoneNumber}
              formatValue={getFormatedPhoneNumber}
              fullWidth
            />
          </Grid>
        )}
        {isMember && (
          <Grid xs={12} sm={6} lg={3}>
            <TextDisplay
              label='Home to Post Mileage'
              value={member.milesToPost}
              formatValue={(val: number) => `${formatNumber(val)} mi`}
              fullWidth
            />
          </Grid>
        )}
        <Grid xs={12}>
          <TextDisplay
            label={(member?.entity?.length ?? 0) <= 1 ? 'Entity' : 'Entities'}
            value={member?.entity ?? []}
            renderValue={(value: ENTITY) => (
              <Chip
                key={value}
                sx={{
                  bgcolor: ENTITY_OBJECT[value].color.background,
                  color: ENTITY_OBJECT[value].color.text,
                }}
                label={isSmall ? ENTITY_OBJECT[value].short : ENTITY_OBJECT[value].label}
                size='small'
              />
            )}
            multiple
            fullWidth
          />
        </Grid>
        <Grid xs={12}>
          <AvatarDisplay label='Avatar Image' value={member.image} member={member} />
        </Grid>
        {isMember && (
          <Grid xs={12}>
            <Typography component={'h3'} variant='h5'>
              Emergency Contacts
            </Typography>
          </Grid>
        )}
        {!hasEmergencyContacts && isLoggedIn && (
          <Grid xs={12}>
            <Alert severity='warning'>
              We do not have an emergency contact for you.{' '}
              <Typography component='span'>
                Click{' '}
                <Button
                  variant='text'
                  sx={{ p: 0, minWidth: 0 }}
                  onClick={() => {
                    if (onEdit) onEdit()
                  }}
                >
                  Here
                </Button>{' '}
                to add one.
              </Typography>
            </Alert>
          </Grid>
        )}
        {!hasEmergencyContacts && !isLoggedIn && isMember && (
          <Grid xs={12}>
            <Alert severity='warning'>There is no emergency contacts for this member.</Alert>
          </Grid>
        )}
        {hasEmergencyContacts &&
          isMember &&
          member.emergencyContacts.map((contact, index) => {
            if (contact.name && contact.phone) {
              return (
                <React.Fragment key={index}>
                  <Grid xs={6}>
                    <TextDisplay label='Name' value={contact.name} fullWidth />
                  </Grid>
                  <Grid xs={6}>
                    <TextDisplay
                      label='Phone Number'
                      value={contact.phone}
                      formatValue={getFormatedPhoneNumber}
                      fullWidth
                    />
                  </Grid>
                </React.Fragment>
              )
            }
            return null
          })}
      </Grid>
    </Paper>
  )
}
