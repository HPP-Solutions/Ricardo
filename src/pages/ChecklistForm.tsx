import { Box, Paper, Button } from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import ChecklistHeader from '../components/ChecklistHeader'
import { useEffect, useState } from 'react'
import supabase from '../helper/supabaseClient'

interface FormData {
  motorista: string
  placaCavalo: string
  placaCarreta: string
  tipoVeiculo: string
  dataEmissao: string
  observacoes: string
  rota: string
  data: string
}

function ChecklistForm() {
  const { truckId } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState<FormData>({
    motorista: '',
    placaCavalo: '',
    placaCarreta: '',
    tipoVeiculo: '',
    dataEmissao: '',
    observacoes: '',
    rota: '',
    data: ''
  })

  // Carrega dados salvos ao montar o componente
  useEffect(() => {
    const savedData = localStorage.getItem(`checklistForm_${truckId}`)
    if (savedData) {
      setFormData(JSON.parse(savedData))
    }
  }, [truckId])

  const handleFormChange = (data: FormData) => {
    setFormData(data)
    localStorage.setItem(`checklistForm_${truckId}`, JSON.stringify(data))
  }

  const handleNext = async () => {
    // Validação dos campos obrigatórios
    const requiredFields = ['motorista', 'placaCavalo', 'placaCarreta', 'tipoVeiculo', 'data'] as const
    const emptyFields = requiredFields.filter(field => !formData[field])

    if (emptyFields.length > 0) {
      const fieldNames = {
        motorista: 'Nome do Motorista',
        placaCavalo: 'Placa do Cavalo',
        placaCarreta: 'Placa da Carreta',
        tipoVeiculo: 'Tipo de Veículo',
        data: 'Data'
      }
      
      alert(`Por favor, preencha os seguintes campos obrigatórios:\n${emptyFields.map(field => fieldNames[field]).join('\n')}`)
      return
    }

    try {
      // Cria o registro do truck
      const { data: truck, error: truckError } = await supabase
        .from('trucks')
        .insert([{
          nome: `${formData.placaCavalo} - ${formData.placaCarreta} (${formData.tipoVeiculo})`
        }])
        .select()
        .single()

      if (truckError) throw truckError

      // Salva os dados atuais antes de navegar
      localStorage.setItem(`checklistForm_${truckId}`, JSON.stringify(formData))
      navigate(`/categories/${truck.id}`)
    } catch (error) {
      console.error('Erro ao criar registro do caminhão:', error)
      alert('Ocorreu um erro ao salvar os dados. Por favor, tente novamente.')
    }
  }

  const handleBack = () => {
    // Salva os dados antes de voltar
    localStorage.setItem(`checklistForm_${truckId}`, JSON.stringify(formData))
    navigate('/')
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, px: 2 }}>
      <Paper sx={{ p: 3 }}>
        <ChecklistHeader 
          onDataChange={handleFormChange}
          initialData={formData}
        />
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={handleBack}
          >
            Voltar
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
          >
            Avançar
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}

export default ChecklistForm