import { Box, Typography, Grid, Card, CardContent, CardActionArea, Button, Paper, CircularProgress, IconButton, Alert } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import {
  DirectionsCar as CarIcon,
  Build as MechanicalIcon,
  BatteryChargingFull as ElectricalIcon,
  AirlineSeatReclineNormal as InteriorIcon,
  Security as SecurityIcon,
  ArrowForward as ArrowForwardIcon,
  ReportProblem as ReportProblemIcon,
  CheckCircle as CheckCircleIcon,
  WbIncandescent as WbIncandescentIcon,
  Campaign as CampaignIcon,
  Face as FaceIcon,
  Construction as ConstructionIcon,
  LocalGasStation as LocalGasStationIcon,
  SettingsSuggest as SettingsSuggestIcon,
  TireRepair as TireRepairIcon,
  BugReport as BugReportIcon,
  Speed as SpeedIcon
} from '@mui/icons-material'
import { inspectionService } from '../services/inspectionService'

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

const categories = [
  {
    id: 'estruturaVeiculo',
    name: 'Estrutura do Veículo',
    icon: ConstructionIcon,
    color: '#757575'
  },
  {
    id: 'pneusRodas',
    name: 'Pneus e Rodas',
    icon: TireRepairIcon,
    color: '#388e3c'
  },
  {
    id: 'sistemaEletrico',
    name: 'Sistema Elétrico',
    icon: SettingsSuggestIcon,
    color: '#ffb300'
  },
  {
    id: 'segurancaDocumentacao',
    name: 'Segurança e Documentação',
    icon: SecurityIcon,
    color: '#d32f2f'
  },
  {
    id: 'motorFluidos',
    name: 'Motor e Fluidos',
    icon: LocalGasStationIcon,
    color: '#0288d1'
  },
  {
    id: 'condicoesMotorista',
    name: 'Condições do Motorista',
    icon: FaceIcon,
    color: '#5d4037'
  },
  {
    id: 'odometro',
    name: 'Odômetro',
    icon: SpeedIcon,
    color: '#00796b'
  },
]

function Categories() {
  const navigate = useNavigate()
  const { truckId } = useParams()
  const [showSignature, setShowSignature] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const sigCanvas = useRef<SignatureCanvas>(null)
  const [checklistData, setChecklistData] = useState<Record<string, any>>({})
  const [formData, setFormData] = useState<InspectionFormData>({
    motorista: '',
    placaCavalo: '',
    placaCarreta: '',
    tipoVeiculo: '',
    dataEmissao: '',
    observacoes: '',
    rota: '',
    data: ''
  })

  useEffect(() => {
    // Carrega os dados do formulário e checklist do localStorage
    const savedFormData = localStorage.getItem(`checklistForm_${truckId}`)
    if (savedFormData) {
      setFormData(JSON.parse(savedFormData))
    }

    categories.forEach(category => {
      const savedItems = localStorage.getItem(`checklist_${truckId}_${category.id}`)
      if (savedItems) {
        setChecklistData(prev => ({
          ...prev,
          [category.id]: JSON.parse(savedItems)
        }))
      }
    })
  }, [truckId])

  const handleCategorySelect = (categoryId: string) => {
    navigate(`/checklist/${truckId}/${categoryId}`)
  }

  const handleNext = () => {
    setShowSignature(true)
  }

  const handleClearSignature = () => {
    sigCanvas.current?.clear()
  }

  const handleSaveSignature = async () => {
    if (sigCanvas.current) {
      setIsSaving(true)
      try {
        const signature = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png')
        
        const inspectionData = {
          formData,
          checklistItems: checklistData,
          signature
        }

        const result = await inspectionService.saveInspection(Number(truckId), inspectionData)

        if (result.success) {
          // Limpa os dados do localStorage após salvar com sucesso
          localStorage.removeItem(`checklistForm_${truckId}`)
          localStorage.removeItem('inspection_timer')
          categories.forEach(category => {
            localStorage.removeItem(`checklist_${truckId}_${category.id}`)
          })

          navigate('/')
        } else {
          throw result.error
        }
      } catch (error) {
        console.error('Erro ao salvar vistoria:', error)
        alert('Erro ao salvar a vistoria. Por favor, tente novamente.')
      } finally {
        setIsSaving(false)
      }
    }
  }

  const getCategoryStatus = (categoryId: string) => {
    const items = checklistData[categoryId] || []
    if (!items.length) return 'pendente'

    const totalItems = items.length
    const invalidItems = items.filter((item: any) => item.status === 'invalid').length
    const validItems = items.filter((item: any) => item.status === 'valid').length
    const nonEvaluatedItems = totalItems - (invalidItems + validItems)

    if (nonEvaluatedItems > 0) return 'em_andamento'
    if (invalidItems === 0) return 'conforme'
    if (invalidItems <= Math.floor(totalItems * 0.2)) return 'parcialmente_conforme'
    return 'nao_conforme'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'conforme':
        return <CheckCircleIcon sx={{ color: 'success.main', mt: 1 }} />
      case 'parcialmente_conforme':
        return <ReportProblemIcon sx={{ color: 'warning.main', mt: 1 }} />
      case 'nao_conforme':
        return <ReportProblemIcon sx={{ color: 'error.main', mt: 1 }} />
      case 'em_andamento':
        return <CircularProgress size={20} sx={{ mt: 1 }} />
      default:
        return null
    }
  }

  const canFinishInspection = () => {
    return categories.every(category => {
      const status = getCategoryStatus(category.id)
      return status !== 'pendente' && status !== 'em_andamento'
    })
  }

  const handleAutoFill = () => {
    // Preencher dados do formulário
    const mockFormData = {
      motorista: 'Motorista Teste',
      placaCavalo: 'ABC1234',
      placaCarreta: 'XYZ5678',
      tipoVeiculo: 'Carreta',
      dataEmissao: new Date().toISOString().split('T')[0],
      observacoes: 'Observações de teste geradas automaticamente',
      rota: 'Rota de Teste',
      data: new Date().toISOString().split('T')[0]
    }
    setFormData(mockFormData)
    localStorage.setItem(`checklistForm_${truckId}`, JSON.stringify(mockFormData))

    // Preencher dados do checklist para cada categoria
    const mockChecklistData: Record<string, any> = {}
    categories.forEach(category => {
      const items = Array(10).fill(null).map((_, index) => ({
        id: index + 1,
        title: `Item ${index + 1} da categoria ${category.name}`,
        status: Math.random() > 0.2 ? 'valid' : 'invalid',
        observation: `Observação de teste para item ${index + 1} gerada em ${new Date().toLocaleString()}`,
        photos: []
      }))
      mockChecklistData[category.id] = items
      localStorage.setItem(`checklist_${truckId}_${category.id}`, JSON.stringify(items))
    })
    setChecklistData(mockChecklistData)
  }

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

        <Typography variant="h5" gutterBottom sx={{ mt: 1 }}>
          Categorias de Inspeção
        </Typography>
        <Grid container spacing={3} justifyContent="center">
          {categories.map((category) => {
            const Icon = category.icon
            const status = getCategoryStatus(category.id)
            
            return (
              <Grid item xs={12} sm={6} md={4} key={category.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      boxShadow: 6
                    }
                  }}
                >
                  <CardActionArea 
                    onClick={() => handleCategorySelect(category.id)}
                    sx={{ height: '100%', p: 3 }}
                  >
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Icon sx={{ fontSize: 60, color: category.color, mb: 2 }} />
                      <Typography variant="h6" component="div">
                        {category.name}
                      </Typography>
                      {getStatusIcon(status)}
                      <Typography variant="caption" color="textSecondary" display="block">
                        {status === 'pendente' ? 'Pendente' :
                         status === 'em_andamento' ? 'Em Andamento' :
                         status === 'conforme' ? 'Conforme' :
                         status === 'parcialmente_conforme' ? 'Parcialmente Conforme' :
                         'Não Conforme'}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            )
          })}
        </Grid>
        {!showSignature ? (
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
            >
              Voltar
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!canFinishInspection()}
            >
              Finalizar Vistoria
            </Button>
          </Box>
        ) : (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Área de Assinatura Digital
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <SignatureCanvas
                ref={sigCanvas}
                canvasProps={{
                  width: 500,
                  height: 200,
                  className: 'signature-canvas'
                }}
                penColor="black"
                backgroundColor="white"
              />
            </Paper>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                onClick={() => setShowSignature(false)}
                disabled={isSaving}
              >
                Voltar
              </Button>
              <Box>
                <Button
                  variant="outlined"
                  onClick={handleClearSignature}
                  sx={{ mr: 2 }}
                  disabled={isSaving}
                >
                  Limpar Assinatura
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSaveSignature}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <CircularProgress size={24} sx={{ mr: 1 }} />
                      Salvando...
                    </>
                  ) : (
                    'Enviar Vistoria'
                  )}
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  )
}

export default Categories