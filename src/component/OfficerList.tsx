import type { Member } from '@/types/common'
import { stringAvatar } from '@/utils/helpers'
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
} from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import PhoneIcon from '@mui/icons-material/Phone'
import EmailIcon from '@mui/icons-material/Email'
import SearchToolbar from './search.toolbar'

export default function MemberList({ officers }: { officers: Member[] }): JSX.Element {
  return (
    <Paper>
      <SearchToolbar title='Executive Board' variant='dense' hideSearch />
      <Grid container spacing={1} sx={{ borderRadius: 0, p: 1 }}>
        {officers.map((o, index) => (
          <Grid key={index} xs={12} sm={6} lg={3}>
            <Card variant='outlined'>
              <CardActionArea href={`/member/${o.id}`}>
                <CardContent sx={{ pb: 1 }}>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Avatar src={o.image} {...stringAvatar(o)} />
                      <Typography variant='h5'>{o.office}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Typography variant='h6'>{o.name}</Typography>
                      {!!o.nickName && (
                        <Typography variant='h6' color='text.secondary'>
                          ({o.nickName})
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </CardActionArea>
              {(!!o.email || !!o.phoneNumber) && (
                <CardActions sx={{ justifyContent: 'space-between' }}>
                  {o.email ? (
                    <Button href={`mailto:${o.email}`} size='small' startIcon={<EmailIcon />}>
                      Email
                    </Button>
                  ) : (
                    <div />
                  )}
                  {o.phoneNumber ? (
                    <Button
                      href={`tel:${o.phoneNumber?.replace(/\D/g, '')}`}
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
        ))}
      </Grid>
    </Paper>
  )
}
