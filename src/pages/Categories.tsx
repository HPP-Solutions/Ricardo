import { Box, Typography, Grid, Card, CardContent, CardActionArea, Button, Paper, CircularProgress } from '@mui/material'
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
} from '@mui/icons-material'
import { inspectionService } from '../services/inspectionService'

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

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, px: 2 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Categorias de Inspeção
        </Typography>
        <Grid container spacing={3} justifyContent="center">
          {categories.map((category) => {
            const Icon = category.icon
            const isCompleted = checklistData[category.id]?.every((item: any) => item.status !== null)
            
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
                      {isCompleted && (
                        <CheckCircleIcon sx={{ color: 'success.main', mt: 1 }} />
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            )
          })}
        </Grid>
        {!showSignature ? (
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              onClick={handleNext}
            >
              Avançar
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