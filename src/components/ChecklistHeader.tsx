import { Box, Grid, TextField, Typography, Paper } from '@mui/material'

interface ChecklistHeaderProps {
  onDataChange?: (data: any) => void
}

function ChecklistHeader({ onDataChange }: ChecklistHeaderProps) {
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom align="center" sx={{ mb: 3 }}>
        CHECK-LIST
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Data"
            type="date"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Nome do Motorista"
          />
        </Grid>

        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="Placa do Cavalo"
          />
        </Grid>

        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="Placa da Carreta"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Data de Emissão"
            type="date"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Tipo de Veículo"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Observações"
            multiline
            rows={3}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            DADOS DA CARGA
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Rota"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Data"
            type="date"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            ASSINATURAS
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Box>
            <TextField
              fullWidth
              label="Nome do Motorista"
            />
            <Box 
              sx={{ 
                mt: 2, 
                height: 100, 
                border: '1px dashed grey',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography color="text.secondary">
                Assinatura do Motorista
              </Typography>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Box>
            <TextField
              fullWidth
              label="Nome do Vistoriador"
            />
            <Box 
              sx={{ 
                mt: 2, 
                height: 100, 
                border: '1px dashed grey',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography color="text.secondary">
                Assinatura do Vistoriador
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  )
}

export default ChecklistHeader 