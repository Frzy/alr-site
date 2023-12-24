import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { Box } from '@mui/material'

export default function Droppable({
  children,
  id,
}: {
  children: React.ReactNode
  id: string
}): JSX.Element {
  const { isOver, setNodeRef } = useDroppable({
    id,
  })

  return (
    <Box ref={setNodeRef} sx={{ bgcolor: isOver ? 'green' : undefined }}>
      {children}
    </Box>
  )
}
