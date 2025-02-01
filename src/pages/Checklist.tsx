import { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  TextField,
  FormControlLabel,
  Radio,
  RadioGroup,
  Divider
} from '@mui/material'
import { PhotoCamera as CameraIcon } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

interface ChecklistItem {
  id: number
  title: string
  status: 'valid' | 'invalid' | null
  observation: string
  photo: string | null
}

const initialItems: ChecklistItem[] = [
  { id: 1, title: 'Faróis dianteiros', status: null, observation: '', photo: null },
  { id: 2, title: 'Lanternas traseiras', status: null, observation: '', photo: null },
  { id: 3, title: 'Pneus', status: null, observation: '', photo: null },
  { id: 4, title: 'Para-brisa', status: null, observation: '', photo: null },
  { id: 5, title: 'Retrovisores', status: null, observation: '', photo: null },
]

function Checklist() {
  const navigate = useNavigate()
  const [items, setItems] = useState<ChecklistItem[]>(initialItems)

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
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Checklist de Vistoria
        </Typography>
        <List>
          {items.map((item, index) => (
            <Box key={item.id}>
              {index > 0 && <Divider />}
              <ListItem>
                <Box sx={{ width: '100%' }}>
                  <ListItemText
                    primary={item.title}
                    sx={{ mb: 2 }}
                  />
                  <RadioGroup
                    row
                    value={item.status || ''}
                    onChange={(e) => handleStatusChange(item.id, e.target.value as 'valid' | 'invalid')}
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
                    sx={{ mt: 2 }}
                  />
                  <ListItemSecondaryAction>
                    <Button
                      startIcon={<CameraIcon />}
                      onClick={() => navigate('/camera')}
                      sx={{ mt: 2 }}
                    >
                      Foto
                    </Button>
                  </ListItemSecondaryAction>
                </Box>
              </ListItem>
            </Box>
          ))}
        </List>
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
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