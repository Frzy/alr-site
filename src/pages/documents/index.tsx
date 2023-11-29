import * as React from 'react'

import { ENDPOINT, GOOGLE_MIME_TYPE } from '@/utils/constants'
import { GoogleDriveFolderList, GoogleDriveItem } from '@/types/common'
import Head from 'next/head'
import Image from 'next/image'
import Link from '@/component/link'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import {
  Breadcrumbs,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material'

type DocumentLink = { name: string; id?: string }

function sortByName(a: GoogleDriveItem, b: GoogleDriveItem) {
  if (a.name < b.name) return -1
  if (a.name > b.name) return 1

  return 0
}

export default function DocumentsPage() {
  const [links, setLinks] = React.useState([
    {
      name: 'Home',
    },
  ])
  const [children, setChildren] = React.useState<GoogleDriveItem[]>([])
  const [fetching, setFetching] = React.useState(true)

  async function handleBreadcrumbClick(link: DocumentLink, index: number) {
    setFetching(true)

    const newChildren = await fetchFolder(link.id)

    setChildren(newChildren.sort(sortByName))
    setLinks((prev) => prev.slice(0, index + 1))
    setFetching(false)
  }
  function handleGoogleItemClick(
    item: GoogleDriveItem,
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) {
    if (event.detail === 2) {
      switch (item.mimeType) {
        case GOOGLE_MIME_TYPE.FOLDER:
          drillIntoFolder(item)
          break
        default:
          viewItem(item)
      }
    }
  }
  async function viewItem(item: GoogleDriveItem) {
    await fetch(`${ENDPOINT.VIEW_FILE}?${new URLSearchParams({ fileId: item.id })}`)
  }
  async function drillIntoFolder(item: GoogleDriveItem) {
    setFetching(true)

    const newChildren = await fetchFolder(item.id)

    setChildren(newChildren.sort(sortByName))
    setLinks((prev) => [...prev, { name: item.name, id: item.id }])
    setFetching(false)
  }

  async function fetchFolder(itemId?: string) {
    const url = itemId
      ? `${ENDPOINT.DRIVE}?${new URLSearchParams({ fileId: itemId })}`
      : ENDPOINT.DRIVE
    const response = await fetch(url)
    const data = (await response.json()) as GoogleDriveFolderList

    return data.files
  }

  React.useEffect(() => {
    async function fetchRoot() {
      const response = await fetch(ENDPOINT.DRIVE)
      const data = (await response.json()) as GoogleDriveFolderList

      setFetching(false)
      setChildren(data.files.sort(sortByName))
    }

    fetchRoot()
  }, [])

  return (
    <React.Fragment>
      <Head>
        <title>ALR 91 - Documents</title>
        <meta name='description' content='American Legion Riders 91 Documents' />
      </Head>

      <Stack spacing={1}>
        <Paper sx={{ p: 1 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize='small' />}>
            {links.map((link, index) => {
              if (links.length - 1 === index) {
                return <Typography key={index}>{link.name}</Typography>
              }

              return (
                <Link href='' onClick={() => handleBreadcrumbClick(link, index)} key={index}>
                  {link.name}
                </Link>
              )
            })}
          </Breadcrumbs>
        </Paper>
        <Paper>
          {fetching ? (
            <LinearProgress sx={{ m: 2 }} />
          ) : (
            <List>
              {children.map((item, index) => {
                if (item.mimeType === GOOGLE_MIME_TYPE.FOLDER) {
                  return (
                    <ListItemButton
                      key={index}
                      onClick={(event) => handleGoogleItemClick(item, event)}
                    >
                      <ListItemIcon>
                        <Image src={item.iconLink} width={16} height={16} alt={item.mimeType} />
                      </ListItemIcon>

                      <ListItemText primary={item.name} />
                    </ListItemButton>
                  )
                }

                return (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Image src={item.iconLink} width={16} height={16} alt={item.mimeType} />
                    </ListItemIcon>
                    <Link href={`/api/drive/view?fileId=${item.id}`} target='_blank'>
                      {item.name}
                    </Link>
                  </ListItem>
                )
              })}
            </List>
          )}
        </Paper>
      </Stack>
    </React.Fragment>
  )
}
