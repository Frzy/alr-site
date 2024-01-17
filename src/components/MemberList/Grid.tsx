import type { Member } from '@/types/common'
import { getMemberIcon, memberAvatar } from '@/utils/member'
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import PhoneIcon from '@mui/icons-material/Phone'
import EmailIcon from '@mui/icons-material/Email'

interface MemberGridProps {
  members: Member[]
}

export default function MemberGridList({ members }: MemberGridProps): JSX.Element {
  return (
    <Grid container spacing={0.5} sx={{ px: 0.5 }}>
      {members.map((m) => (
        <MemberGridItem key={m.id} member={m} />
      ))}
    </Grid>
  )
}

interface MemberGridItemProps {
  member: Member
}

function MemberGridItem({ member }: MemberGridItemProps): JSX.Element {
  return (
    <Grid xs={12} sm={6} lg={3}>
      <Card variant='outlined'>
        <CardActionArea sx={{ pb: 1 }} href={`/member/${member.id}`}>
          <CardContent sx={{ p: 1, minHeight: 60 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Box>
                {member.image ? (
                  <Avatar src={member.image} alt={member.name} />
                ) : (
                  <Avatar {...memberAvatar(member)} />
                )}
              </Box>
              <Stack sx={{ flex: '1 1 100%', overflow: 'hidden' }}>
                <Typography
                  component='span'
                  sx={{ textWrap: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}
                >
                  {member.name}
                </Typography>
                <Typography
                  component='span'
                  variant='body2'
                  color='text.secondary'
                  sx={{ textWrap: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}
                >
                  {member.nickName}
                </Typography>
              </Stack>
              <Tooltip title={member.role}>{getMemberIcon(member)}</Tooltip>
            </Box>
          </CardContent>
        </CardActionArea>
        <CardActions
          disableSpacing
          sx={{ justifyContent: 'space-between', p: 0, px: 1, pb: 1, minHeight: 44.5 }}
        >
          {member.phoneNumber ? (
            <Button color='secondary' startIcon={<PhoneIcon />} href={`tel:${member.phoneNumber}`}>
              Call
            </Button>
          ) : (
            <Box />
          )}
          {member.office ? (
            <Typography
              component='span'
              variant='body2'
              sx={{ textTransform: 'uppercase', color: '#ffb300' }}
            >
              {member.office}
            </Typography>
          ) : (
            <Box />
          )}
          {member.email ? (
            <Button color='secondary' startIcon={<EmailIcon />} href={`mailto:${member.email}`}>
              Email
            </Button>
          ) : (
            <Box />
          )}
        </CardActions>
      </Card>
    </Grid>
  )
}
