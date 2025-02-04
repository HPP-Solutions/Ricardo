import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material'
import { Home as HomeIcon, CheckCircle as CheckIcon, PhotoCamera as CameraIcon, Dashboard as DashboardIcon } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

function Navbar() {
  const navigate = useNavigate()

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          SM Vistoria
        </Typography>
        <Box>
          <IconButton color="inherit" onClick={() => navigate('/')}>
            <HomeIcon />
          </IconButton>
          <IconButton color="inherit" onClick={() => navigate('/checklist')}>
            <CheckIcon />
          </IconButton>
          <IconButton color="inherit" onClick={() => navigate('/camera')}>
            <CameraIcon />
          </IconButton>
          <IconButton color="inherit" onClick={() => navigate('/dashboard')}>
            <DashboardIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar 