import { Box, Typography, Grid, Card, CardContent, CardActionArea, Button } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
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

  const handleCategorySelect = (categoryId: string) => {
    navigate(`/checklist/${truckId}/${categoryId}`)
  }

  const handleAdvance = () => {
    navigate(`/checklist-form/${truckId}`)
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, px: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom align="center" sx={{ mb: 4 }}>
        Selecione as Categorias para Vistoria
      </Typography>
      <Grid container spacing={3} justifyContent="center">
        {categories.map((category) => {
          const Icon = category.icon
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
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          )
        })}
      </Grid>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button
          variant="contained"
          size="large"
          endIcon={<ArrowForwardIcon />}
          onClick={handleAdvance}
          sx={{ minWidth: 200 }}
        >
          Avançar
        </Button>
      </Box>
    </Box>
  )
}

export default Categories 