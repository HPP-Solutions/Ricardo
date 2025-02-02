import { Box, Typography, Card, CardContent, CardMedia, CardActionArea, Button, Grid, Paper, Icon } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ListAltIcon from '@mui/icons-material/ListAlt';

function Home() {
  const navigate = useNavigate()

  const handleStartInspection = () => {
    // Aqui você pode redirecionar para a página de seleção de tipo de vistoria ou iniciar diretamente
    navigate('/categories/1'); // Assumindo que '1' é o ID para 'Iniciar Vistoria'
  }

  const handleViewInspections = () => {
    // Redirecionar para a página de listagem de vistorias
    navigate('/inspections'); // Crie esta rota se ainda não existir
  }

  return (
    <Box sx={{ mx: 'auto', mt: 4, px: 2, maxWidth: 'md' }}>
      <Typography variant="h4" component="h1" align="center" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        Painel de Vistorias SM
      </Typography>

      <Grid container spacing={3} mt={2}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Icon component={DirectionsCarIcon} sx={{ fontSize: 60, color: 'secondary.main', mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              Iniciar Nova Vistoria
            </Typography>
            <Typography color="textSecondary">
              Comece uma nova inspeção de veículo.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              onClick={handleStartInspection}
            >
              Iniciar Vistoria
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Icon component={ListAltIcon} sx={{ fontSize: 60, color: 'primary', mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              Ver Vistorias Existentes
            </Typography>
            <Typography color="textSecondary">
              Visualize e gerencie as vistorias já realizadas.
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              sx={{ mt: 2 }}
              onClick={handleViewInspections}
            >
              Ver Vistorias
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Home; 