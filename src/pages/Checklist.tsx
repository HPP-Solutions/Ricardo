import { useState, useEffect } from 'react'
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
  Chip,
  Dialog,
  DialogContent
} from '@mui/material'
import { PhotoCamera as CameraIcon, ArrowBack as BackIcon, BugReport as BugReportIcon, Close as CloseIcon } from '@mui/icons-material'

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
  const [items, setItems] = useState<ChecklistItem[]>(() => {
    // Tenta carregar os dados salvos do localStorage
    const savedItems = localStorage.getItem(`checklist_${truckId}_${categoryId}`)
    return savedItems ? JSON.parse(savedItems) : checklistItems[categoryId] || []
  })
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

  const handleStatusChange = (id: number, value: 'valid' | 'invalid') => {
    const newItems = items.map(item =>
      item.id === id ? { ...item, status: value } : item
    )
    setItems(newItems)
    // Salva no localStorage
    localStorage.setItem(`checklist_${truckId}_${categoryId}`, JSON.stringify(newItems))
  }

  const handleObservationChange = (id: number, value: string) => {
    const newItems = items.map(item =>
      item.id === id ? { ...item, observation: value } : item
    )
    setItems(newItems)
    // Salva no localStorage
    localStorage.setItem(`checklist_${truckId}_${categoryId}`, JSON.stringify(newItems))
  }

  const handlePhotoUpdate = (id: number, photoUrl: string) => {
    const newItems = items.map(item =>
      item.id === id ? { ...item, photo: photoUrl } : item
    )
    setItems(newItems)
    // Salva no localStorage
    localStorage.setItem(`checklist_${truckId}_${categoryId}`, JSON.stringify(newItems))
  }

  const handleSave = () => {
    // Salva no localStorage antes de navegar
    localStorage.setItem(`checklist_${truckId}_${categoryId}`, JSON.stringify(items))
    navigate(`/categories/${truckId}`)
  }

  const handleBack = () => {
    // Salva no localStorage antes de voltar
    localStorage.setItem(`checklist_${truckId}_${categoryId}`, JSON.stringify(items))
    navigate(`/categories/${truckId}`)
  }

  const handleTakePhoto = async (itemId: number) => {
    // Salva o ID do item que está sendo fotografado no localStorage
    localStorage.setItem('current_photo_item', JSON.stringify({
      truckId,
      categoryId,
      itemId
    }))
    navigate('/camera')
  }

  const handleAutoFill = () => {
    const newItems = items.map(item => ({
      ...item,
      status: Math.random() > 0.2 ? 'valid' as const : 'invalid' as const,
      observation: `Observação de teste para ${item.title} gerada automaticamente em ${new Date().toLocaleString()}`,
      photo: null
    }))

    setItems(newItems)
    localStorage.setItem(`checklist_${truckId}_${categoryId}`, JSON.stringify(newItems))
  }

  // Verifica se há uma foto recém-tirada ao montar o componente
  useEffect(() => {
    const lastPhoto = localStorage.getItem('last_photo')
    const photoItem = localStorage.getItem('current_photo_item')
    
    if (lastPhoto && photoItem) {
      const { truckId: photoTruckId, categoryId: photoCategoryId, itemId } = JSON.parse(photoItem)
      
      if (photoTruckId === truckId && photoCategoryId === categoryId) {
        handlePhotoUpdate(itemId, lastPhoto)
        // Limpa os dados da foto após atualizar
        localStorage.removeItem('last_photo')
        localStorage.removeItem('current_photo_item')
      }
    }
  }, [])

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, px: 2 }}>
      <Paper sx={{ p: 3, position: 'relative' }}>
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
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Button
                    variant="outlined"
                    startIcon={<CameraIcon />}
                    onClick={() => handleTakePhoto(item.id)}
                  >
                    {item.photo ? 'Alterar Foto' : 'Adicionar Foto'}
                  </Button>
                  {item.photo && (
                    <Box
                      component="img"
                      src={item.photo}
                      alt="Foto do item"
                      sx={{
                        width: 60,
                        height: 60,
                        objectFit: 'cover',
                        borderRadius: 1,
                        cursor: 'pointer'
                      }}
                      onClick={() => setSelectedPhoto(item.photo)}
                    />
                  )}
                </Box>
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

      {/* Dialog para visualização da foto em tamanho maior */}
      <Dialog
        open={!!selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <IconButton
            onClick={() => setSelectedPhoto(null)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.7)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
          {selectedPhoto && (
            <Box
              component="img"
              src={selectedPhoto}
              alt="Foto ampliada"
              sx={{
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default Checklist 