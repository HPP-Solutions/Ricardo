import { SupabaseClient } from '@supabase/supabase-js'

declare module '../helper/supabaseClient' {
  const supabase: SupabaseClient
  export default supabase
} 