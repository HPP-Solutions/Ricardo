import { useState, useRef } from 'react'
import { Box, Button, Paper, Typography } from '@mui/material'
import { PhotoCamera as CameraIcon, Refresh as RefreshIcon } from '@mui/icons-material'
import Webcam from 'react-webcam'

function Camera() {
  const webcamRef = useRef<Webcam>(null)
  const [photo, setPhoto] = useState<string | null>(null)

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: 'environment'
  }

  const capture = () => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc) {
      setPhoto(imageSrc)
    }
  }

  const retake = () => {
    setPhoto(null)
  }

  const savePhoto = () => {
    // Aqui você implementaria a lógica para salvar a foto
    console.log('Foto salva:', photo)
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Captura de Foto
        </Typography>
        <Box sx={{ position: 'relative', width: '100%', mb: 2 }}>
          {photo ? (
            <img
              src={photo}
              alt="Foto capturada"
              style={{ width: '100%', height: 'auto' }}
            />
          ) : (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              style={{ width: '100%', height: 'auto' }}
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          {photo ? (
            <>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={retake}
              >
                Nova Foto
              </Button>
              <Button
                variant="contained"
                onClick={savePhoto}
              >
                Salvar Foto
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              startIcon={<CameraIcon />}
              onClick={capture}
            >
              Tirar Foto
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  )
}

export default Camera 