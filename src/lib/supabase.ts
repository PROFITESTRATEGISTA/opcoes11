import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables missing:', {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey
  })
  throw new Error('Missing Supabase environment variables. Please connect to Supabase using the button in the top right.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'X-Client-Info': 'strategos-partners'
    }
  }
})

// Test connection on initialization
supabase.from('structures').select('count', { count: 'exact', head: true })
  .then(({ error }) => {
    if (error) {
      console.warn('Supabase connection test failed (this is normal on first load):', error.message)
    } else {
      console.log('✅ Strategos Partners - Supabase connection successful')
    }
  })
  .catch(err => {
    console.warn('Supabase connection error (this is normal on first load):', err.message)
  })

// Types for database
export interface Database {
  public: {
    Tables: {
      structures: {
        Row: {
          id: string
          user_id: string
          nome: string
          ativo: string | null
          legs: any[]
          premio_liquido: number
          custo_montagem: number
          data_vencimento: string
          status: 'MONTANDO' | 'ATIVA' | 'FINALIZADA'
          data_ativacao: string | null
          data_finalizacao: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          nome: string
          ativo?: string | null
          legs: any[]
          premio_liquido: number
          custo_montagem: number
          data_vencimento: string
          status?: 'MONTANDO' | 'ATIVA' | 'FINALIZADA'
          data_ativacao?: string | null
          data_finalizacao?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          nome?: string
          ativo?: string | null
          legs?: any[]
          premio_liquido?: number
          custo_montagem?: number
          data_vencimento?: string
          status?: 'MONTANDO' | 'ATIVA' | 'FINALIZADA'
          data_ativacao?: string | null
          data_finalizacao?: string | null
          updated_at?: string
        }
      }
      operations: {
        Row: {
          id: string
          user_id: string
          structure_id: string
          tipo: string
          ativo: string
          pm: number
          strike: number | null
          quantidade: number
          premio: number
          taxa_coleta: number
          alta: number
          recompensa: number
          data_entrada: string
          data_saida: string | null
          status: 'Aberta' | 'Fechada' | 'Vencida'
          resultado: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          structure_id: string
          tipo: string
          ativo: string
          pm: number
          strike?: number | null
          quantidade: number
          premio: number
          taxa_coleta: number
          alta: number
          recompensa: number
          data_entrada: string
          data_saida?: string | null
          status?: 'Aberta' | 'Fechada' | 'Vencida'
          resultado: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          structure_id?: string
          tipo?: string
          ativo?: string
          pm?: number
          strike?: number | null
          quantidade?: number
          premio?: number
          taxa_coleta?: number
          alta?: number
          recompensa?: number
          data_entrada?: string
          data_saida?: string | null
          status?: 'Aberta' | 'Fechada' | 'Vencida'
          resultado?: number
          updated_at?: string
        }
      }
    }
  }
}