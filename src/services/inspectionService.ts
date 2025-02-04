import supabase from '../helper/supabaseClient'

interface InspectionFormData {
  motorista: string
  placaCavalo: string
  placaCarreta: string
  tipoVeiculo: string
  dataEmissao: string
  observacoes: string
  rota: string
  data: string
}

interface ChecklistItem {
  id: number
  title: string
  status: 'valid' | 'invalid' | null
  observation: string
  photo: string | null
  category: string
}

interface InspectionData {
  formData: InspectionFormData
  checklistItems: Record<string, ChecklistItem[]>
  signature: string
}

export const inspectionService = {
  async saveInspection(truckId: number, data: InspectionData) {
    try {
      // 1. Primeiro, insere o registro na tabela trucks se não existir
      const { data: truck, error: truckError } = await supabase
        .from('trucks')
        .upsert([
          {
            id: truckId,
            nome: `${data.formData.placaCavalo} - ${data.formData.placaCarreta}`,
          }
        ])
        .select()
        .single()

      if (truckError) throw truckError

      // 2. Cria um novo registro de inspeção
      const { data: inspection, error: inspectionError } = await supabase
        .from('inspections')
        .insert([
          {
            truck_id: truckId,
            inspection_date: new Date().toISOString()
          }
        ])
        .select()
        .single()

      if (inspectionError) throw inspectionError

      // 3. Salva os dados do formulário com todos os campos necessários
      const formDataToSave = {
        truck_id: truckId,
        form_data: {
          inspection_id: inspection.id,
          data_vistoria: new Date().toISOString(),
          status: 'concluido',
          veiculo: {
            placaCavalo: data.formData.placaCavalo.trim(),
            placaCarreta: data.formData.placaCarreta.trim(),
            tipo: data.formData.tipoVeiculo.trim()
          },
          motorista: {
            nome: data.formData.motorista.trim()
          },
          observacoes: data.formData.observacoes.trim(),
          rota: data.formData.rota.trim(),
          datas: {
            emissao: data.formData.dataEmissao || new Date().toISOString().split('T')[0],
            vistoria: data.formData.data || new Date().toISOString().split('T')[0]
          }
        }
      }

      const { error: formError } = await supabase
        .from('checklist_forms')
        .insert([formDataToSave])

      if (formError) throw formError

      // 4. Salva os itens do checklist com informações detalhadas
      const inspectionItems = Object.values(data.checklistItems)
        .flat()
        .map(item => ({
          inspection_id: inspection.id,
          checklist_template_id: item.id,
          status: item.status,
          observation: item.observation?.trim() || '',
          photo: item.photo,
          updated_at: new Date().toISOString(),
          category: item.category
        }))

      const { error: itemsError } = await supabase
        .from('inspection_items')
        .insert(inspectionItems)

      if (itemsError) throw itemsError

      // 5. Salva a assinatura na tabela signatures
      const { error: signatureError } = await supabase
        .from('signatures')
        .insert([
          {
            inspection_id: inspection.id,
            signature_data: data.signature
          }
        ])

      if (signatureError) throw signatureError

      return { success: true, inspectionId: inspection.id }
    } catch (error) {
      console.error('Erro ao salvar vistoria:', error)
      return { success: false, error }
    }
  }
}

// Função auxiliar para converter base64 para Blob
function base64ToBlob(base64: string): Blob {
  const parts = base64.split(';base64,')
  const contentType = parts[0].split(':')[1]
  const raw = window.atob(parts[1])
  const rawLength = raw.length
  const uInt8Array = new Uint8Array(rawLength)

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i)
  }

  return new Blob([uInt8Array], { type: contentType })
} 