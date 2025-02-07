import React, { createContext, useContext, useState, useEffect } from 'react'

interface TimerContextData {
  timeLeft: number
  isTimeExpired: boolean
  isOvertime: boolean
  overtimeSeconds: number
  startTimer: () => void
  resetTimer: () => void
}

const TimerContext = createContext<TimerContextData>({} as TimerContextData)

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timeLeft, setTimeLeft] = useState(() => {
    const savedTime = localStorage.getItem('inspection_timer')
    if (savedTime) {
      const { timeLeft: savedTimeLeft, startTime } = JSON.parse(savedTime)
      const elapsedTime = Math.floor((Date.now() - startTime) / 1000)
      const remainingTime = Math.max(0, savedTimeLeft - elapsedTime)
      return remainingTime
    }
    return 10 * 60 // 10 minutos em segundos
  })
  const [isTimeExpired, setIsTimeExpired] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [isOvertime, setIsOvertime] = useState(false)
  const [overtimeSeconds, setOvertimeSeconds] = useState(0)

  const startTimer = () => {
    setIsActive(true)
    localStorage.setItem('inspection_timer', JSON.stringify({
      timeLeft,
      startTime: Date.now()
    }))
  }

  const resetTimer = () => {
    setTimeLeft(10 * 60)
    setIsTimeExpired(false)
    setIsActive(false)
    setIsOvertime(false)
    setOvertimeSeconds(0)
    localStorage.removeItem('inspection_timer')
  }

  useEffect(() => {
    let timer: NodeJS.Timeout

    if (isActive) {
      timer = setInterval(() => {
        if (timeLeft > 0) {
          setTimeLeft((prevTime) => {
            const newTime = prevTime - 1
            localStorage.setItem('inspection_timer', JSON.stringify({
              timeLeft: newTime,
              startTime: Date.now()
            }))
            return newTime
          })
        } else {
          setIsTimeExpired(true)
          setIsOvertime(true)
          setOvertimeSeconds(prev => prev + 1)
          
          // Emite um som de alerta quando o tempo expira
          if (!isOvertime) {
            const audio = new Audio('/alert.mp3')
            audio.play().catch(e => console.log('Erro ao tocar som:', e))
          }
        }
      }, 1000)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isActive, timeLeft, isOvertime])

  return (
    <TimerContext.Provider value={{ 
      timeLeft, 
      isTimeExpired, 
      isOvertime,
      overtimeSeconds,
      startTimer, 
      resetTimer 
    }}>
      {children}
    </TimerContext.Provider>
  )
}

export const useTimer = () => {
  const context = useContext(TimerContext)
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider')
  }
  return context
} 