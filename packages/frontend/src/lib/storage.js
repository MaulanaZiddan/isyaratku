import { supabase, isSupabaseConfigured } from './supabase'

/**
 * Upload file media (video/gambar/icon) ke Supabase Storage bucket.
 * @param {string} bucket - Nama bucket ('vocabulary-videos' | 'quiz-videos' | 'category-icons' | 'avatars')
 * @param {File} file - File dari input <input type="file" />
 * @param {string} [folder=''] - Subfolder opsional di dalam bucket
 * @returns {Promise<{ publicUrl: string, filePath: string }>}
 */
export async function uploadMediaFile(bucket, file, folder = '') {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase belum dikonfigurasi. Periksa file .env Anda.')
  }

  const ext = file.name.split('.').pop() || 'bin'
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const filePath = folder ? `${folder}/${safeName}` : safeName

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) throw uploadError

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
  return {
    publicUrl: data.publicUrl,
    filePath,
  }
}

/**
 * Hapus file media dari Supabase Storage bucket.
 * @param {string} bucket
 * @param {string} filePath
 */
export async function deleteMediaFile(bucket, filePath) {
  if (!isSupabaseConfigured || !supabase || !filePath) return
  const { error } = await supabase.storage.from(bucket).remove([filePath])
  if (error) throw error
}
