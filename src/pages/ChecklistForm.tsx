import { Box } from '@mui/material'
import { useParams } from 'react-router-dom'
import ChecklistHeader from '../components/ChecklistHeader'

function ChecklistForm() {
  const { truckId } = useParams()

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, px: 2 }}>
      <ChecklistHeader />
    </Box>
  )
}

export default ChecklistForm 