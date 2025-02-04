import { Box, Typography, Card, CardContent, CardMedia, CardActionArea, Button, Grid, Paper, Icon } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ListAltIcon from '@mui/icons-material/ListAlt';
import supabase from '../helper/supabaseClient'
import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailIcon from '@mui/icons-material/Email';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import InputAdornment from '@mui/material/InputAdornment';
import Avatar from '@mui/material/Avatar';

function Home() {
  const navigate = useNavigate()
  const [openLoginModal, setOpenLoginModal] = useState(false);
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

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
    setOpenLoginModal(true);
  }

  const handleCloseLoginModal = () => {
    setOpenLoginModal(false);
    setLoginData({ email: '', password: '' });
  }

  const handleLogin = () => {
    // Por enquanto apenas fecha o modal e navega
    // Implementaremos a autenticação depois
    handleCloseLoginModal();
    navigate('/inspections');
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

      {/* Modal de Login */}
      <Dialog 
        open={openLoginModal} 
        onClose={handleCloseLoginModal}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: '350px',
          }
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          p: 3
        }}>
          <Avatar sx={{ 
            m: 1, 
            bgcolor: 'primary.main',
            width: 56,
            height: 56
          }}>
            <LockOutlinedIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <DialogTitle sx={{ 
            pb: 2,
            pt: 1,
            fontSize: '1.5rem',
            fontWeight: 600
          }}>
            Área Administrativa
          </DialogTitle>
          <DialogContent sx={{ width: '100%', p: 0 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Email"
              type="email"
              fullWidth
              variant="outlined"
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              margin="dense"
              label="Senha"
              type="password"
              fullWidth
              variant="outlined"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <VpnKeyIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </DialogContent>
          <DialogActions sx={{ 
            width: '100%', 
            justifyContent: 'space-between',
            mt: 3,
            px: 0
          }}>
            <Button 
              onClick={handleCloseLoginModal} 
              sx={{ 
                color: 'text.secondary',
                px: 3
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleLogin} 
              variant="contained" 
              sx={{ 
                px: 4,
                py: 1,
                borderRadius: 2
              }}
            >
              Entrar
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}

export default Home; 