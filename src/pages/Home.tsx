import { Box, Typography, Paper, Grid, Card, CardContent, CardMedia, CardActionArea } from '@mui/material'
import { useNavigate } from 'react-router-dom'

const trucks = [
  {
    id: 1,
    name: 'Caminhão Baú',
    image: 'https://images.unsplash.com/photo-1586191582056-b5d6b911dd93?w=800&auto=format&fit=crop'
  },
  {
    id: 2,
    name: 'Carreta',
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&auto=format&fit=crop'
  },
  {
    id: 3,
    name: 'Truck',
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&auto=format&fit=crop'
  }
]

function Home() {
  const navigate = useNavigate()

  const handleTruckSelect = (truckId: number) => {
    navigate(`/categories/${truckId}`)
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, px: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        Selecione o Tipo de Veículo
      </Typography>
      <Grid container spacing={3} justifyContent="center">
        {trucks.map((truck) => (
          <Grid item xs={12} sm={6} md={4} key={truck.id}>
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
              <CardActionArea onClick={() => handleTruckSelect(truck.id)} sx={{ height: '100%' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={truck.image}
                  alt={truck.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Typography variant="h6" component="div" align="center">
                    {truck.name}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default Home 