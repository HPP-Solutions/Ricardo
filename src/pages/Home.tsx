import { Box, Typography, Card, CardContent, CardMedia, CardActionArea, Button, Grid, Paper, Icon } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ListAltIcon from '@mui/icons-material/ListAlt';
import supabase from '../helper/supabaseClient'

function Home() {
  const navigate = useNavigate()

  const handleStartInspection = async () => {
    try {
      // Cria um novo registro de caminhão com nome temporário
      const { data: truck, error } = await supabase
        .from('trucks')
        .insert([{ nome: 'Novo Veículo' }])
        .select()
        .single()

      if (error) throw error

      // Redireciona para o formulário com o ID do novo caminhão
      navigate(`/checklist-form/${truck.id}`)
    } catch (error) {
      console.error('Erro ao criar novo registro:', error)
      alert('Erro ao iniciar nova vistoria. Por favor, tente novamente.')
    }
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