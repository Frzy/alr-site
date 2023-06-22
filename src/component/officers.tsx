import * as React from 'react'
import useSWR, { Fetcher } from 'swr'
import {
  Avatar,
  Box,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from '@mui/material'
import { getPhoneLink, stringToColor } from '@/utils/helpers'

import type { Member } from '@/types/common'

const fetcher: Fetcher<Member[], string> = async (url: string) => {
  const officers = await fetch(url)

  return await officers.json()
}

export default function Officers() {
  const { data: officers, error, isLoading } = useSWR('/api/officers', fetcher)

  if (isLoading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    )

  return (
    <Box>
      <Typography sx={{ p: 1 }} variant='h4'>
        Officers
      </Typography>
      <Divider />
      <List
        sx={{
          px: 1,
          width: '100%',
        }}
      >
        {officers?.map((o, index) => (
          <React.Fragment key={o.id}>
            <ListItem alignItems='center' disablePadding>
              <ListItemAvatar>
                {o.image ? (
                  <Avatar alt={o.name} src={o.image} />
                ) : (
                  <Avatar
                    alt={o.name}
                    sx={{
                      bgcolor: stringToColor(o.name),
                    }}
                  >{`${o.firstName[0]}${o.lastName[0]}`}</Avatar>
                )}
              </ListItemAvatar>
              <ListItemText
                primary={o.office}
                secondaryTypographyProps={{ component: 'div' }}
                secondary={
                  <React.Fragment>
                    <Box>
                      <Typography
                        sx={{ display: 'inline' }}
                        component='span'
                        variant='body2'
                        color='text.primary'
                      >
                        {o.name}
                      </Typography>

                      {o.nickName && (
                        <Typography
                          sx={{ display: 'inline' }}
                          component='span'
                          variant='caption'
                          color='text.primary'
                        >
                          {` (${o.nickName})`}
                        </Typography>
                      )}
                    </Box>
                    {o.phoneNumber && (
                      <Typography
                        component='a'
                        variant='body2'
                        href={`tel:${getPhoneLink(o.phoneNumber)}`}
                      >
                        {o.phoneNumber}
                      </Typography>
                    )}
                  </React.Fragment>
                }
              />
            </ListItem>
            {index < officers.length - 1 && <Divider variant='inset' component='li' />}
          </React.Fragment>
        ))}
      </List>
    </Box>
  )
}
