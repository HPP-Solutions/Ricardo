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
  DialogContent,
  InputAdornment
} from '@mui/material'
import { PhotoCamera as CameraIcon, ArrowBack as BackIcon, BugReport as BugReportIcon, Close as CloseIcon } from '@mui/icons-material'

interface ChecklistItem {
  id: number
  title: string
  status: 'valid' | 'invalid' | null
  observation: string
  photos: string[]
  category: string
  isKmInput?: boolean
  kmValue?: string
}

const checklistItems: Record<string, ChecklistItem[]> = {
  estruturaVeiculo: [
    { id: 1, title: 'Para Brisa sem trincas', status: null, observation: '', photos: [], category: 'estruturaVeiculo' },
    { id: 2, title: 'Lona Carroceria em bom estado', status: null, observation: '', photos: [], category: 'estruturaVeiculo' },
    { id: 3, title: 'Tela Carroceria em bom estado', status: null, observation: '', photos: [], category: 'estruturaVeiculo' },
    { id: 4, title: 'Arco da Cavaqueira em bom estado', status: null, observation: '', photos: [], category: 'estruturaVeiculo' },
    { id: 5, title: 'Tampa dos tanques em bom estado', status: null, observation: '', photos: [], category: 'estruturaVeiculo' },
    { id: 6, title: 'Tampa da Bateria em Bom Estado', status: null, observation: '', photos: [], category: 'estruturaVeiculo' },
    { id: 7, title: 'Retrovisores em bom estado', status: null, observation: '', photos: [], category: 'estruturaVeiculo' },
    { id: 8, title: 'Veiculo em perfeito estado de conservação', status: null, observation: '', photos: [], category: 'estruturaVeiculo' },
    { id: 9, title: 'Possui travessa na cavaqueira', status: null, observation: '', photos: [], category: 'estruturaVeiculo' },
  ],
  pneusRodas: [
    { id: 10, title: 'Pneus Cavalo em bom estado de conservação', status: null, observation: '', photos: [], category: 'pneusRodas' },
    { id: 11, title: 'Pneus Carreta em bom estado de conservação', status: null, observation: '', photos: [], category: 'pneusRodas' },
    { id: 12, title: 'Steps Pneus em bom estado de conservação', status: null, observation: '', photos: [], category: 'pneusRodas' },
    { id: 13, title: 'Foi batido os pneus com Martelo de Borracha', status: null, observation: '', photos: [], category: 'pneusRodas' },
    { id: 14, title: 'Freios em bom estado', status: null, observation: '', photos: [], category: 'pneusRodas' },
  ],
  sistemaEletrico: [
    { id: 15, title: 'Parte elétrica do cavalo funcionando', status: null, observation: '', photos: [], category: 'sistemaEletrico' },
    { id: 16, title: 'Parte elétrica da carreta funcionando', status: null, observation: '', photos: [], category: 'sistemaEletrico' },
    { id: 17, title: 'Possui luz de ré', status: null, observation: '', photos: [], category: 'sistemaEletrico' },
    { id: 18, title: 'Buzina está funcionando', status: null, observation: '', photos: [], category: 'sistemaEletrico' },
    { id: 19, title: 'Lampada de iluminação estão funcionando', status: null, observation: '', photos: [], category: 'sistemaEletrico' },
  ],
  segurancaDocumentacao: [
    { id: 20, title: 'Documentação em dia (Licenciamento e', status: null, observation: '', photos: [], category: 'segurancaDocumentacao' },
    { id: 21, title: 'Possui triângulo extintor, cone', status: null, observation: '', photos: [], category: 'segurancaDocumentacao' },
    { id: 22, title: 'Veiculo possui tacógrafo funcionando', status: null, observation: '', photos: [], category: 'segurancaDocumentacao' },
    { id: 23, title: 'Motorista possui EPI', status: null, observation: '', photos: [], category: 'segurancaDocumentacao' },
    { id: 24, title: 'Placa do cavalo e carreta estão legíveis', status: null, observation: '', photos: [], category: 'segurancaDocumentacao' },
  ],
  motorFluidos: [
    { id: 25, title: 'Vazamento de óleo aparente', status: null, observation: '', photos: [], category: 'motorFluidos' },
    { id: 26, title: 'Verificado Nível Óleo Motor', status: null, observation: '', photos: [], category: 'motorFluidos' },
    { id: 27, title: 'Verificado Nível Água do motor', status: null, observation: '', photos: [], category: 'motorFluidos' },
    { id: 28, title: 'Verificado Nível Combustível', status: null, observation: '', photos: [], category: 'motorFluidos' },
    { id: 29, title: 'Verificado Nível Óleo Hidráulico Cavaqueira', status: null, observation: '', photos: [], category: 'motorFluidos' },
  ],
  condicoesMotorista: [
    { id: 30, title: 'Motorista trajando calça, camisa e sapatos', status: null, observation: '', photos: [], category: 'condicoesMotorista' },
  ],
  odometro: [
    { 
      id: 31, 
      title: 'Quilometragem atual do veículo', 
      status: null, 
      observation: '', 
      photos: [], 
      category: 'odometro',
      isKmInput: true,
      kmValue: ''
    }
  ]
}

const categoryNames: Record<string, string> = {
  estruturaVeiculo: 'Estrutura do Veículo',
  pneusRodas: 'Pneus e Rodas',
  sistemaEletrico: 'Sistema Elétrico',
  segurancaDocumentacao: 'Segurança e Documentação',
  motorFluidos: 'Motor e Fluidos',
  condicoesMotorista: 'Condições do Motorista',
  odometro: 'Odômetro'
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
      item.id === id ? { ...item, photos: [...(item.photos || []), photoUrl] } : item
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
    const newItems = items.map(item => {
      if (item.isKmInput) {
        const randomKm = Math.floor(Math.random() * 500000).toString() // Gera um número entre 0 e 500000
        return {
          ...item,
          kmValue: randomKm,
          status: 'valid' as const,
          observation: `Quilometragem registrada automaticamente em ${new Date().toLocaleString()}`
        }
      }

      return {
        ...item,
        status: Math.random() > 0.2 ? 'valid' as const : 'invalid' as const,
        observation: `Observação de teste para ${item.title} gerada automaticamente em ${new Date().toLocaleString()}`,
        photos: []
      }
    })

    setItems(newItems)
    localStorage.setItem(`checklist_${truckId}_${categoryId}`, JSON.stringify(newItems))
  }

  const handleKmValueChange = (id: number, value: string) => {
    // Permite apenas números
    if (!/^\d*$/.test(value)) return

    const newItems = items.map(item =>
      item.id === id ? { 
        ...item, 
        kmValue: value, 
        status: value ? 'valid' as const : null 
      } : item
    )
    setItems(newItems)
    localStorage.setItem(`checklist_${truckId}_${categoryId}`, JSON.stringify(newItems))
  }

  // Verifica se há fotos recém-tiradas ao montar o componente
  useEffect(() => {
    const lastPhotos = localStorage.getItem('last_photos')
    const photoItem = localStorage.getItem('current_photo_item')
    
    if (lastPhotos && photoItem) {
      const { truckId: photoTruckId, categoryId: photoCategoryId, itemId } = JSON.parse(photoItem)
      const photos = JSON.parse(lastPhotos)
      
      if (photoTruckId === truckId && photoCategoryId === categoryId) {
        const newItems = items.map(item => {
          if (item.id === itemId) {
            return {
              ...item,
              photos: [...(item.photos || []), ...photos]
            }
          }
          return item
        })
        setItems(newItems)
        // Limpa os dados das fotos após atualizar
        localStorage.removeItem('last_photos')
        localStorage.removeItem('current_photo_item')
      }
    }
  }, [])

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: { xs: 0, sm: 4 }, px: 2 }}>
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

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, mt: 1 }}>
          <IconButton onClick={handleBack} sx={{ mr: 2 }}>
            <BackIcon />
          </IconButton>
          <Typography variant="h5" component="h1">
            {categoryNames[categoryId]} - Checklist
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="textSecondary">
            Avalie cada item como "Conforme" ou "Não Conforme". Itens não avaliados serão considerados pendentes.
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
                    label={item.status === 'valid' ? 'Conforme' : item.status === 'invalid' ? 'Não Conforme' : 'Pendente'}
                    color={item.status === 'valid' ? 'success' : item.status === 'invalid' ? 'error' : 'default'}
                    size="small"
                  />
                </Box>

                {item.isKmInput ? (
                  <TextField
                    fullWidth
                    label="Quilometragem"
                    variant="outlined"
                    value={item.kmValue || ''}
                    onChange={(e) => handleKmValueChange(item.id, e.target.value)}
                    type="text"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">km</InputAdornment>,
                    }}
                    placeholder="Digite a quilometragem atual"
                    required
                    error={!item.kmValue}
                    helperText={!item.kmValue ? "Por favor, insira a quilometragem atual do veículo" : ""}
                    sx={{ mb: 2 }}
                  />
                ) : (
                  <>
                    <RadioGroup
                      row
                      value={item.status || ''}
                      onChange={(e) => handleStatusChange(item.id, e.target.value as 'valid' | 'invalid')}
                      sx={{ mb: 2 }}
                    >
                      <FormControlLabel value="valid" control={<Radio />} label="Conforme" />
                      <FormControlLabel value="invalid" control={<Radio />} label="Não Conforme" />
                    </RadioGroup>
                    {!item.isKmInput && (
                      <TextField
                        fullWidth
                        label={item.status === 'invalid' ? "Observações (obrigatório para itens não conformes)" : "Observações"}
                        variant="outlined"
                        value={item.observation}
                        onChange={(e) => handleObservationChange(item.id, e.target.value)}
                        size="small"
                        multiline
                        rows={2}
                        required={item.status === 'invalid'}
                        error={item.status === 'invalid' && !item.observation}
                        helperText={item.status === 'invalid' && !item.observation ? "Por favor, descreva o problema encontrado" : ""}
                        sx={{ mb: 2 }}
                      />
                    )}
                  </>
                )}
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    startIcon={<CameraIcon />}
                    onClick={() => handleTakePhoto(item.id)}
                  >
                    Adicionar Foto
                  </Button>
                  {item.photos && item.photos.map((photo, photoIndex) => (
                    <Box
                      key={photoIndex}
                      sx={{ position: 'relative' }}
                    >
                      <Box
                        component="img"
                        src={photo}
                        alt={`Foto ${photoIndex + 1} do item`}
                        sx={{
                          width: 60,
                          height: 60,
                          objectFit: 'cover',
                          borderRadius: 1,
                          cursor: 'pointer'
                        }}
                        onClick={() => setSelectedPhoto(photo)}
                      />
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          bgcolor: 'background.paper',
                          '&:hover': { bgcolor: 'error.light', color: 'white' }
                        }}
                        onClick={() => {
                          const newItems = items.map(i => 
                            i.id === item.id 
                              ? { ...i, photos: i.photos.filter((_, idx) => idx !== photoIndex) }
                              : i
                          )
                          setItems(newItems)
                          localStorage.setItem(`checklist_${truckId}_${categoryId}`, JSON.stringify(newItems))
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
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