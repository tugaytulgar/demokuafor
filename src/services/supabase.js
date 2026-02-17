/**
 * Supabase client – Faz 1.
 * VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY .env.local içinde tanımlanmalı.
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const hasSupabaseEnv = Boolean(supabaseUrl && supabaseAnonKey)

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase env eksik. .env.local dosyasına VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY ekleyin.'
  )
}

/**
 * Env yoksa `null` döner; UI tarafında buna göre yönlendirme yapılmalı.
 */
export const supabase = hasSupabaseEnv ? createClient(supabaseUrl, supabaseAnonKey) : null
