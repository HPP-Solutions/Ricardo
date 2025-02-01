import { Box, Typography, Grid, Card, CardContent, CardActionArea } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  DirectionsCar as CarIcon,
  Build as MechanicalIcon,
  BatteryChargingFull as ElectricalIcon,
  AirlineSeatReclineNormal as InteriorIcon,
  Security as SecurityIcon
} from '@mui/icons-material'

const categories = [
  {
    id: 'exterior',
    name: 'Exterior',
    icon: CarIcon,
    color: '#1976d2'
  },
  {
    id: 'mechanical',
    name: 'Mecânico',
    icon: MechanicalIcon,
    color: '#2e7d32'
  },
  {
    id: 'electrical',
    name: 'Elétrico',
    icon: ElectricalIcon,
    color: '#ed6c02'
  },
  {
    id: 'interior',
    name: 'Interior',
    icon: InteriorIcon,
    color: '#9c27b0'
  },
  {
    id: 'security',
    name: 'Segurança',
    icon: SecurityIcon,
    color: '#d32f2f'
  }
]

function Categories() {
  const navigate = useNavigate()
  const { truckId } = useParams()

  const handleCategorySelect = (categoryId: string) => {
    navigate(`/checklist/${truckId}/${categoryId}`)
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, px: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        Selecione a Categoria
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
    </Box>
  )
}

export default Categories 