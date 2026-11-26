import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('YOUR_PROJECT_REF') &&
    !supabaseAnonKey.includes('YOUR_SUPABASE_ANON_KEY')
)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null

/**
 * Mengonversi path video lokal (/videos/...) ke URL publik Supabase Storage
 * jika Supabase telah dikonfigurasi.
 */
export const resolveVideoUrl = (url) => {
  if (!url || typeof url !== 'string') return url
  if (!url.startsWith('/videos/')) return url
  if (!isSupabaseConfigured || !supabaseUrl) return url

  const relPath = url
    .slice('/videos/'.length)
    .split('/')
    .map((seg) => encodeURIComponent(decodeURIComponent(seg)))
    .join('/')

  return `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/vocabulary-videos/Bahan_Video/${relPath}`
}
