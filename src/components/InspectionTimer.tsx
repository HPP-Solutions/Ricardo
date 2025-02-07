import { Box, Typography, Alert, useTheme, useMediaQuery, Chip } from '@mui/material'
import { Timer as TimerIcon } from '@mui/icons-material'
import { useTimer } from '../contexts/TimerContext'

interface InspectionTimerProps {
  showAlert?: boolean
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

export const InspectionTimer = ({ showAlert = true }: InspectionTimerProps) => {
  const { timeLeft, isTimeExpired, isOvertime, overtimeSeconds } = useTimer()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <>
      <Box sx={{ 
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        bgcolor: 'background.paper',
        p: 1,
        borderRadius: 1,
        boxShadow: isOvertime ? '0 0 10px rgba(211, 47, 47, 0.5)' : 1,
        position: 'sticky',
        top: isMobile ? 0 : 'auto',
        zIndex: 1000,
        width: isMobile ? '100%' : 'auto',
        justifyContent: isMobile ? 'center' : 'flex-start',
        mb: isMobile ? 2 : 0,
        transition: 'all 0.3s ease',
        flexDirection: isMobile ? 'column' : 'row'
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          width: '100%',
          justifyContent: 'center'
        }}>
          <TimerIcon 
            color={isOvertime ? "error" : timeLeft < 60 ? "error" : "primary"} 
            sx={{ 
              animation: (isOvertime || timeLeft < 60) ? 'pulse 1s infinite' : 'none',
              fontSize: isMobile ? 28 : 24
            }}
          />
          <Typography
            variant={isMobile ? "h5" : "h6"}
            color={isOvertime ? "error" : timeLeft < 60 ? "error" : "primary"}
            sx={{
              fontWeight: 'bold',
              minWidth: isMobile ? '100px' : '80px',
              textAlign: 'center'
            }}
          >
            {isOvertime ? '00:00' : formatTime(timeLeft)}
          </Typography>
        </Box>

        {isOvertime && (
          <Chip
            label={`Atraso: ${formatTime(overtimeSeconds)}`}
            color="error"
            variant="outlined"
            sx={{ 
              animation: 'fadeIn 0.5s',
              mt: isMobile ? 1 : 0,
              fontWeight: 'bold'
            }}
          />
        )}
      </Box>

      {showAlert && isTimeExpired && (
        <Alert 
          severity="error" 
          variant="filled"
          sx={{ 
            mt: 2,
            animation: 'fadeIn 0.5s',
            position: isMobile ? 'sticky' : 'static',
            top: isMobile ? '80px' : 'auto',
            zIndex: 999
          }}
        >
          {isOvertime 
            ? `Tempo excedido! A vistoria está atrasada em ${formatTime(overtimeSeconds)}. Por favor, finalize o mais rápido possível.`
            : 'O tempo para realizar a vistoria expirou! Por favor, finalize a vistoria o mais rápido possível.'
          }
        </Alert>
      )}

      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}
      </style>
    </>
  )
} 