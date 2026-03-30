import { createClient } from '@/lib/supabase/client'
import type { Media } from '@/features/media/types'

export const mediaService = {
  async getAll(userId: string): Promise<Media[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data ?? []
  },

  async getById(id: string): Promise<Media | null> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async upload(userId: string, file: File): Promise<Media> {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'x-file-name': file.name,
        'x-file-type': file.type,
      },
      body: file,
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Error al subir archivo')
    }

    return res.json()
  },

  async delete(id: string, userId: string): Promise<void> {
    const res = await fetch(`/api/upload/${id}`, {
      method: 'DELETE',
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Error al eliminar archivo')
    }
  },

  async updateStatus(id: string, status: Media['status']): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase
      .from('media')
      .update({ status })
      .eq('id', id)

    if (error) throw error
  },
}
