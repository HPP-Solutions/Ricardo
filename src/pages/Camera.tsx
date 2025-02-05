import { useState, useRef, useEffect } from 'react'
import { Box, Button, Paper, Typography, IconButton, Alert } from '@mui/material'
import { PhotoCamera as CameraIcon, Refresh as RefreshIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import Webcam from 'react-webcam'

function Camera() {
  const navigate = useNavigate()
  const webcamRef = useRef<Webcam>(null)
  const [photos, setPhotos] = useState<string[]>([])
  const [photoItem, setPhotoItem] = useState<any>(null)
  const [cameraError, setCameraError] = useState<string>('')

  useEffect(() => {
    const savedPhotoItem = localStorage.getItem('current_photo_item')
    if (savedPhotoItem) {
      setPhotoItem(JSON.parse(savedPhotoItem))
    }
  }, [])

  const videoConstraints = {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: { ideal: 'environment' }
  }

  const handleUserMediaError = (error: string | DOMException) => {
    console.error('Erro na câmera:', error)
    setCameraError('Não foi possível acessar a câmera. Por favor, verifique as permissões.')
  }

  const capture = () => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc) {
      setPhotos(prev => [...prev, imageSrc])
    }
  }

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const savePhotos = () => {
    if (photos.length > 0 && photoItem) {
      localStorage.setItem('last_photos', JSON.stringify(photos))
      navigate(`/checklist/${photoItem.truckId}/${photoItem.categoryId}`)
    }
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, px: 2 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Captura de Fotos
        </Typography>
        
        {cameraError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {cameraError}
          </Alert>
        )}

        <Box sx={{ position: 'relative', width: '100%', mb: 2 }}>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            onUserMediaError={handleUserMediaError}
            style={{ width: '100%', height: 'auto' }}
          />
        </Box>

        {/* Botão de captura */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<CameraIcon />}
            onClick={capture}
          >
            Tirar Foto
          </Button>
        </Box>

        {/* Grade de fotos capturadas */}
        {photos.length > 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Fotos Capturadas ({photos.length})
            </Typography>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: 2,
              mb: 3
            }}>
              {photos.map((photo, index) => (
                <Box key={index} sx={{ position: 'relative' }}>
                  <img
                    src={photo}
                    alt={`Foto ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '150px',
                      objectFit: 'cover',
                      borderRadius: '4px'
                    }}
                  />
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      bgcolor: 'background.paper',
                      '&:hover': { bgcolor: 'error.light', color: 'white' }
                    }}
                    onClick={() => removePhoto(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Botões de ação */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={() => navigate(-1)}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={savePhotos}
            disabled={photos.length === 0}
          >
            Salvar {photos.length} {photos.length === 1 ? 'Foto' : 'Fotos'}
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}

export default Camera 