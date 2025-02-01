import { Box, Typography, Button, Paper } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { CheckCircle as CheckIcon, PhotoCamera as CameraIcon } from '@mui/icons-material'

function Home() {
  const navigate = useNavigate()

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Bem-vindo ao SM Vistoria
        </Typography>
        <Typography variant="body1" paragraph>
          Este aplicativo permite realizar vistorias em veículos de forma simples e eficiente.
          Você pode preencher o checklist e tirar fotos das condições do veículo.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
          <Button
            variant="contained"
            startIcon={<CheckIcon />}
            onClick={() => navigate('/checklist')}
            fullWidth
          >
            Iniciar Checklist
          </Button>
          <Button
            variant="outlined"
            startIcon={<CameraIcon />}
            onClick={() => navigate('/camera')}
            fullWidth
          >
            Tirar Fotos
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}

export default Home 