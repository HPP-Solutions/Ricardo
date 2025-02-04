import { Box, Grid, TextField, Typography, Paper, IconButton } from '@mui/material'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import BugReportIcon from '@mui/icons-material/BugReport'

interface InspectionFormData {
  motorista: string
  placaCavalo: string
  placaCarreta: string
  tipoVeiculo: string
  dataEmissao: string
  observacoes: string
  rota: string
  data: string
}

interface ChecklistHeaderProps {
  onDataChange?: (data: InspectionFormData) => void
  initialData: InspectionFormData
}

function ChecklistHeader({ onDataChange, initialData }: ChecklistHeaderProps) {
  const { truckId } = useParams()
  const [formData, setFormData] = useState<InspectionFormData>(initialData)

  useEffect(() => {
    setFormData(initialData)
  }, [initialData])

  const handleChange = (field: keyof InspectionFormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const newData = {
      ...formData,
      [field]: event.target.value
    }
    setFormData(newData)
    onDataChange?.(newData)
  }

  const handleAutoFill = () => {
    const placas = ['ABC1234', 'XYZ5678', 'DEF9012', 'GHI3456']
    const tipos = ['Carreta', 'Truck', 'Bitrem', 'Rodotrem']
    const nomes = ['João Silva', 'Pedro Santos', 'Maria Oliveira', 'José Pereira']
    const rotas = ['SP-RJ', 'MG-ES', 'PR-SC', 'BA-SE']

    const newData = {
      ...formData,
      motorista: nomes[Math.floor(Math.random() * nomes.length)],
      placaCavalo: placas[Math.floor(Math.random() * placas.length)],
      placaCarreta: placas[Math.floor(Math.random() * placas.length)],
      tipoVeiculo: tipos[Math.floor(Math.random() * tipos.length)],
      dataEmissao: new Date().toISOString().split('T')[0],
      observacoes: 'Observações de teste geradas automaticamente',
      rota: rotas[Math.floor(Math.random() * rotas.length)],
      data: new Date().toISOString().split('T')[0]
    }

    setFormData(newData)
    onDataChange?.(newData)
  }

  return (
    <Paper sx={{ p: 3, mb: 3, position: 'relative' }}>
      <IconButton 
        onClick={handleAutoFill}
        sx={{ 
          position: 'absolute',
          top: 8,
          right: 8,
          opacity: 0.3,
          '&:hover': { opacity: 1 }
        }}
        title="Preencher automaticamente (teste)"
      >
        <BugReportIcon />
      </IconButton>

      <Typography variant="h5" gutterBottom align="center" sx={{ mb: 3 }}>
        IDENTIFICAÇÃO
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Data"
            type="date"
            value={formData.data}
            onChange={handleChange('data')}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Nome do Motorista"
            value={formData.motorista}
            onChange={handleChange('motorista')}
          />
        </Grid>

        <Grid item xs={12} sm={3}>
          <TextField
            required
            fullWidth
            label="Placa do Cavalo"
            value={formData.placaCavalo}
            onChange={handleChange('placaCavalo')}
          />
        </Grid>

        <Grid item xs={12} sm={3}>
          <TextField
            required
            fullWidth
            label="Placa da Carreta"
            value={formData.placaCarreta}
            onChange={handleChange('placaCarreta')}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Data de Emissão"
            type="date"
            value={formData.dataEmissao}
            onChange={handleChange('dataEmissao')}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Tipo de Veículo"
            value={formData.tipoVeiculo}
            onChange={handleChange('tipoVeiculo')}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Observações"
            multiline
            rows={3}
            value={formData.observacoes}
            onChange={handleChange('observacoes')}
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
            value={formData.rota}
            onChange={handleChange('rota')}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Data"
            type="date"
            value={formData.data}
            onChange={handleChange('data')}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>
    </Paper>
  )
}

export default ChecklistHeader 