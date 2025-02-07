import { Box, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, List, ListItem, ListItemIcon, ListItemText } from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import ChecklistHeader from '../components/ChecklistHeader'
import { useEffect, useState } from 'react'
import supabase from '../helper/supabaseClient'
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material'

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
  const [openInstructions, setOpenInstructions] = useState(true)
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

      // Cria uma nova inspeção com status pendente
      const { data: inspection, error: inspectionError } = await supabase
        .from('inspections')
        .insert([{
          truck_id: truck.id,
          status: 'pendente',
          inspection_date: new Date().toISOString()
        }])
        .select()
        .single()

      if (inspectionError) throw inspectionError

      // Inicia o cronômetro com 10 minutos
      localStorage.setItem('inspection_timer', '600')

      // Salva os dados atuais antes de navegar
      localStorage.setItem(`checklistForm_${truck.id}`, JSON.stringify(formData))
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

  const handleCloseInstructions = () => {
    setOpenInstructions(false)
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

      <Dialog
        open={openInstructions}
        onClose={handleCloseInstructions}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          Instruções para Preenchimento da Vistoria
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Bem-vindo ao sistema de vistoria! Para realizar uma vistoria completa e eficiente, siga as instruções abaixo:
          </Typography>

          <List>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary={<>Campos Obrigatórios <Typography component="span" color="error">*</Typography></>}
                secondary="Todos os campos marcados com asterisco (*) são de preenchimento obrigatório. A vistoria não poderá ser finalizada sem estes campos."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Dados do Veículo"
                secondary="Preencha corretamente as placas do cavalo e da carreta, além do tipo de veículo."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Dados do Motorista"
                secondary="Informe o nome completo do motorista responsável pelo veículo."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Fotos Obrigatórias"
                secondary={
                  <Box component="span">
                    <Typography variant="body2" color="textSecondary" display="block">
                      As seguintes categorias exigem fotos obrigatoriamente:
                    </Typography>
                    <Typography variant="body2" component="ul" sx={{ pl: 2, mt: 1 }}>
                      <li>Pneus - foto de cada pneu com desgaste ou dano</li>
                      <li>Avarias - foto de qualquer dano na carroceria</li>
                      <li>Vazamentos - foto do local do vazamento</li>
                      <li>Documentação - foto dos documentos do veículo</li>
                      <li>Itens de Segurança - foto de itens danificados ou faltantes</li>
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Categorias de Vistoria"
                secondary="Na próxima tela, você encontrará diferentes categorias para vistoria (Pneus, Freios, Luzes, etc). Cada uma deve ser verificada cuidadosamente."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Registro de Problemas"
                secondary="Para itens não conformes, será necessário tirar fotos e adicionar observações detalhadas. Quanto mais detalhada a descrição, melhor será o acompanhamento."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Tempo de Vistoria"
                secondary="A vistoria tem um tempo estimado. Fique atento ao cronômetro no topo da tela."
              />
            </ListItem>
          </List>

          <Typography variant="body2" color="error" sx={{ mt: 2, fontWeight: 'bold' }}>
            Importante: A falta de preenchimento dos campos obrigatórios ou das fotos necessárias impedirá a conclusão da vistoria.
          </Typography>

          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            Lembre-se: Uma vistoria bem feita garante a segurança do veículo e do motorista.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseInstructions} variant="contained" color="primary">
            Entendi, Começar Vistoria
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ChecklistForm