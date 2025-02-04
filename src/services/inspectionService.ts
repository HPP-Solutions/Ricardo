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
  photos: string[]
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
      // 1. Cria um novo registro de inspeção
      const { data: inspection, error: inspectionError } = await supabase
        .from('inspections')
        .insert([
          {
            truck_id: truckId,
            inspection_date: new Date().toISOString(),
            status: 'em_andamento'
          }
        ])
        .select()
        .single()

      if (inspectionError) throw inspectionError

      // 2. Salva os dados do formulário com todos os campos necessários
      const formDataToSave = {
        inspection_id: inspection.id,
        truck_id: truckId,
        form_data: {
          inspection_id: inspection.id,
          data_vistoria: new Date().toISOString(),
          status: 'em_andamento',
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

      // 3. Salva os itens do checklist com informações detalhadas
      const inspectionItems = Object.values(data.checklistItems)
        .flat()
        .map(item => ({
          inspection_id: inspection.id,
          truck_id: truckId,
          checklist_template_id: item.id,
          status: item.status,
          observation: item.observation?.trim() || '',
          category: item.category,
          updated_at: new Date().toISOString()
        }))

      const { data: savedItems, error: itemsError } = await supabase
        .from('inspection_items')
        .insert(inspectionItems)
        .select()

      if (itemsError) throw itemsError

      // Salvar as fotos para cada item
      for (const item of savedItems) {
        const originalItem = Object.values(data.checklistItems)
          .flat()
          .find(i => i.id === item.checklist_template_id)

        if (originalItem?.photos?.length) {
          const photoItems = originalItem.photos.map(photo => ({
            inspection_item_id: item.id,
            photo_url: photo
          }))

          const { error: photosError } = await supabase
            .from('inspection_item_photos')
            .insert(photoItems)

          if (photosError) throw photosError
        }
      }

      // 4. Salva a assinatura na tabela signatures
      const { error: signatureError } = await supabase
        .from('signatures')
        .insert([
          {
            inspection_id: inspection.id,
            truck_id: truckId,
            signature_data: data.signature
          }
        ])

      if (signatureError) throw signatureError

      // 5. Determina o status final da vistoria baseado nos itens
      const allItems = Object.values(data.checklistItems).flat()
      const totalItems = allItems.length
      const invalidItems = allItems.filter(item => item.status === 'invalid').length
      const validItems = allItems.filter(item => item.status === 'valid').length
      const nonEvaluatedItems = totalItems - (invalidItems + validItems)

      let finalStatus = 'pendente'

      if (nonEvaluatedItems === 0) {
        if (invalidItems === 0) {
          finalStatus = 'conforme'
        } else if (invalidItems <= Math.floor(totalItems * 0.2)) { // Se até 20% dos itens são não conformes
          finalStatus = 'parcialmente_conforme'
        } else {
          finalStatus = 'nao_conforme'
        }
      } else {
        finalStatus = 'em_andamento'
      }

      // Atualiza o status da inspeção
      const { error: updateInspectionError } = await supabase
        .from('inspections')
        .update({ status: finalStatus })
        .eq('id', inspection.id)

      if (updateInspectionError) throw updateInspectionError

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