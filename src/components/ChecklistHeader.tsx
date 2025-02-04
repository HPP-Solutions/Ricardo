import { Box, Grid, TextField, Typography, Paper } from '@mui/material'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

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

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
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