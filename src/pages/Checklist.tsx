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
  estruturaVeiculo: [
    { id: 1, title: 'Para Brisa sem trincas', status: null, observation: '', photo: null, category: 'estruturaVeiculo' },
    { id: 2, title: 'Lona Carroceria em bom estado', status: null, observation: '', photo: null, category: 'estruturaVeiculo' },
    { id: 3, title: 'Tela Carroceria em bom estado', status: null, observation: '', photo: null, category: 'estruturaVeiculo' },
    { id: 4, title: 'Arco da Cavaqueira em bom estado', status: null, observation: '', photo: null, category: 'estruturaVeiculo' },
    { id: 5, title: 'Tampa dos tanques em bom estado', status: null, observation: '', photo: null, category: 'estruturaVeiculo' },
    { id: 6, title: 'Tampa da Bateria em Bom Estado', status: null, observation: '', photo: null, category: 'estruturaVeiculo' },
    { id: 7, title: 'Retrovisores em bom estado', status: null, observation: '', photo: null, category: 'estruturaVeiculo' },
    { id: 8, title: 'Veiculo em perfeito estado de conservação', status: null, observation: '', photo: null, category: 'estruturaVeiculo' },
    { id: 9, title: 'Possui travessa na cavaqueira', status: null, observation: '', photo: null, category: 'estruturaVeiculo' },
  ],
  pneusRodas: [
    { id: 10, title: 'Pneus Cavalo em bom estado de conservação', status: null, observation: '', photo: null, category: 'pneusRodas' },
    { id: 11, title: 'Pneus Carreta em bom estado de conservação', status: null, observation: '', photo: null, category: 'pneusRodas' },
    { id: 12, title: 'Steps Pneus em bom estado de conservação', status: null, observation: '', photo: null, category: 'pneusRodas' },
    { id: 13, title: 'Foi batido os p\'neus com Martelo de Borracha', status: null, observation: '', photo: null, category: 'pneusRodas' },
    { id: 14, title: 'Freios em bom estado', status: null, observation: '', photo: null, category: 'pneusRodas' }, // Freios aqui, mas pode mover se preferir 'Sistema Mecânico'
  ],
  sistemaEletrico: [
    { id: 15, title: 'Parte elétrica do cavalo funcionando', status: null, observation: '', photo: null, category: 'sistemaEletrico' },
    { id: 16, title: 'Parte elétrica da carreta funcionando', status: null, observation: '', photo: null, category: 'sistemaEletrico' },
    { id: 17, title: 'Possui luz de ré', status: null, observation: '', photo: null, category: 'sistemaEletrico' },
    { id: 18, title: 'Buzina está funcionando', status: null, observation: '', photo: null, category: 'sistemaEletrico' },
    { id: 19, title: 'Lampada de iluminação estão funcionando', status: null, observation: '', photo: null, category: 'sistemaEletrico' },
  ],
  segurancaDocumentacao: [
    { id: 20, title: 'Documentação em dia (Licenciamento e', status: null, observation: '', photo: null, category: 'segurancaDocumentacao' },
    { id: 21, title: 'Possui triângulo extintor, cone', status: null, observation: '', photo: null, category: 'segurancaDocumentacao' },
    { id: 22, title: 'Veiculo possui tacógrafo funcionando', status: null, observation: '', photo: null, category: 'segurancaDocumentacao' },
    { id: 23, title: 'Motorista possui EPI', status: null, observation: '', photo: null, category: 'segurancaDocumentacao' },
    { id: 24, title: 'Placa do cavalo e carreta estão legíveis', status: null, observation: '', photo: null, category: 'segurancaDocumentacao' },
  ],
  motorFluidos: [
    { id: 25, title: 'Vazamento de óleo aparente', status: null, observation: '', photo: null, category: 'motorFluidos' },
    { id: 26, title: 'Verificado Nível Óleo Motor', status: null, observation: '', photo: null, category: 'motorFluidos' },
    { id: 27, title: 'Verificado Nível Água do motor', status: null, observation: '', photo: null, category: 'motorFluidos' },
    { id: 28, title: 'Verificado Nível Combustível', status: null, observation: '', photo: null, category: 'motorFluidos' },
    { id: 29, title: 'Verificado Nível Óleo Hidráulico Cavaqueira', status: null, observation: '', photo: null, category: 'motorFluidos' },
  ],
  condicoesMotorista: [
    { id: 30, title: 'Motorista trajando calça, camisa e sapatos', status: null, observation: '', photo: null, category: 'condicoesMotorista' },
  ]
}

const categoryNames: Record<string, string> = {
  estruturaVeiculo: 'Estrutura do Veículo',
  pneusRodas: 'Pneus e Rodas',
  sistemaEletrico: 'Sistema Elétrico',
  segurancaDocumentacao: 'Segurança e Documentação',
  motorFluidos: 'Motor e Fluidos',
  condicoesMotorista: 'Condições do Motorista'
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