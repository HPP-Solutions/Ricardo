import { Box, Typography, Card, CardContent, CardMedia, CardActionArea } from '@mui/material'
import { useNavigate } from 'react-router-dom'

const truck = {
  id: 1,
  name: 'Iniciar Vistoria',
  image: 'public/caminhao.jpeg'
}

function Home() {
  const navigate = useNavigate()

  const handleTruckSelect = () => {
    navigate(`/categories/${truck.id}`)
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, px: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        SM Vistoria
      </Typography>
      <Card 
        sx={{ 
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'scale(1.02)',
            boxShadow: 6
          }
        }}
      >
        <CardActionArea onClick={handleTruckSelect}>
          <CardMedia
            component="img"
            height="400"
            image={truck.image}
            alt="Caminhão"
            sx={{ 
              objectFit: 'cover',
              width: '100%'
            }}
          />
          <CardContent>
            <Typography variant="h5" component="div" align="center">
              {truck.name}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Box>
  )
}

export default Home 