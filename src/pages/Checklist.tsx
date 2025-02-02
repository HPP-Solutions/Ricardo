import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
  TextField,
  FormControlLabel,
  Radio,
  RadioGroup,
  Divider,
  IconButton,
  Chip
} from '@mui/material'
import { PhotoCamera as CameraIcon, ArrowBack as BackIcon } from '@mui/icons-material'

interface ChecklistItem {
  id: number
  title: string
  status: 'valid' | 'invalid' | null
  observation: string
  photo: string | null
  category: string
}

const checklistItems: Record<string, ChecklistItem[]> = {
  exterior: [
    { id: 1, title: 'Faróis dianteiros', status: null, observation: '', photo: null, category: 'exterior' },
    { id: 2, title: 'Lanternas traseiras', status: null, observation: '', photo: null, category: 'exterior' },
    { id: 3, title: 'Para-choques', status: null, observation: '', photo: null, category: 'exterior' },
    { id: 4, title: 'Pintura', status: null, observation: '', photo: null, category: 'exterior' },
    { id: 5, title: 'Retrovisores', status: null, observation: '', photo: null, category: 'exterior' }
  ],
  mechanical: [
    { id: 6, title: 'Motor', status: null, observation: '', photo: null, category: 'mechanical' },
    { id: 7, title: 'Freios', status: null, observation: '', photo: null, category: 'mechanical' },
    { id: 8, title: 'Suspensão', status: null, observation: '', photo: null, category: 'mechanical' },
    { id: 9, title: 'Pneus', status: null, observation: '', photo: null, category: 'mechanical' }
  ],
  electrical: [
    { id: 10, title: 'Bateria', status: null, observation: '', photo: null, category: 'electrical' },
    { id: 11, title: 'Sistema elétrico', status: null, observation: '', photo: null, category: 'electrical' },
    { id: 12, title: 'Alternador', status: null, observation: '', photo: null, category: 'electrical' }
  ],
  interior: [
    { id: 13, title: 'Bancos', status: null, observation: '', photo: null, category: 'interior' },
    { id: 14, title: 'Painel', status: null, observation: '', photo: null, category: 'interior' },
    { id: 15, title: 'Ar condicionado', status: null, observation: '', photo: null, category: 'interior' }
  ],
  security: [
    { id: 16, title: 'Cintos de segurança', status: null, observation: '', photo: null, category: 'security' },
    { id: 17, title: 'Extintor', status: null, observation: '', photo: null, category: 'security' },
    { id: 18, title: 'Triângulo', status: null, observation: '', photo: null, category: 'security' }
  ]
}

const categoryNames: Record<string, string> = {
  exterior: 'Exterior',
  mechanical: 'Mecânico',
  electrical: 'Elétrico',
  interior: 'Interior',
  security: 'Segurança'
}

function Checklist() {
  const navigate = useNavigate()
  const { truckId, categoryId = 'exterior' } = useParams()
  const [items, setItems] = useState<ChecklistItem[]>(checklistItems[categoryId] || [])

  const handleStatusChange = (id: number, value: 'valid' | 'invalid') => {
    setItems(items.map(item =>
      item.id === id ? { ...item, status: value } : item
    ))
  }

  const handleObservationChange = (id: number, value: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, observation: value } : item
    ))
  }

  const handleSave = () => {
    // Aqui você implementaria a lógica para salvar o checklist
    console.log('Checklist salvo:', items)
    navigate(`/categories/${truckId}`)
  }

  const handleBack = () => {
    navigate(`/categories/${truckId}`)
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, px: 2 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={handleBack} sx={{ mr: 2 }}>
            <BackIcon />
          </IconButton>
          <Typography variant="h5" component="h1">
            {categoryNames[categoryId]} - Checklist
          </Typography>
        </Box>
        <List>
          {items.map((item, index) => (
            <Box key={item.id}>
              {index > 0 && <Divider />}
              <ListItem sx={{ flexDirection: 'column', alignItems: 'stretch' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 2 }}>
                  <ListItemText
                    primary={item.title}
                  />
                  <Chip
                    label={item.status === 'valid' ? 'Válido' : item.status === 'invalid' ? 'Inválido' : 'Não avaliado'}
                    color={item.status === 'valid' ? 'success' : item.status === 'invalid' ? 'error' : 'default'}
                    size="small"
                  />
                </Box>
                <RadioGroup
                  row
                  value={item.status || ''}
                  onChange={(e) => handleStatusChange(item.id, e.target.value as 'valid' | 'invalid')}
                  sx={{ mb: 2 }}
                >
                  <FormControlLabel value="valid" control={<Radio />} label="Válido" />
                  <FormControlLabel value="invalid" control={<Radio />} label="Inválido" />
                </RadioGroup>
                <TextField
                  fullWidth
                  label="Observações"
                  variant="outlined"
                  value={item.observation}
                  onChange={(e) => handleObservationChange(item.id, e.target.value)}
                  size="small"
                  multiline
                  rows={2}
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="outlined"
                  startIcon={<CameraIcon />}
                  onClick={() => navigate('/camera')}
                  fullWidth
                >
                  {item.photo ? 'Alterar Foto' : 'Adicionar Foto'}
                </Button>
              </ListItem>
            </Box>
          ))}
        </List>
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={handleBack}
          >
            Voltar
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
          >
            Salvar Checklist
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}

export default Checklist 