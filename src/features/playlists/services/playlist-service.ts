import { createClient } from '@/lib/supabase/client'
import type { Playlist, PlaylistWithItems } from '@/features/playlists/types'

export const playlistService = {
  async getAll(userId: string): Promise<Playlist[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('playlists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data ?? []
  },

  async getById(id: string): Promise<PlaylistWithItems> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('playlists')
      .select('*, playlist_items(*, media(*))')
      .eq('id', id)
      .single()

    if (error) throw error

    const sorted = {
      ...data,
      playlist_items: [...(data.playlist_items ?? [])].sort(
        (a, b) => a.position - b.position
      ),
    }

    return sorted as PlaylistWithItems
  },

  async create(userId: string, name: string, description?: string): Promise<Playlist> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('playlists')
      .insert({ user_id: userId, name, description: description ?? null })
      .select()
      .single()

    if (error) throw error
    return data as Playlist
  },

  async update(
    id: string,
    data: { name?: string; description?: string; is_active?: boolean }
  ): Promise<Playlist> {
    const supabase = createClient()
    const { data: updated, error } = await supabase
      .from('playlists')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return updated as Playlist
  },

  async delete(id: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase.from('playlists').delete().eq('id', id)
    if (error) throw error
  },

  async addItem(playlistId: string, mediaId: string, position: number): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase
      .from('playlist_items')
      .insert({ playlist_id: playlistId, media_id: mediaId, position })

    if (error) throw error
  },

  async removeItem(itemId: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase.from('playlist_items').delete().eq('id', itemId)
    if (error) throw error
  },

  async reorderItems(items: { id: string; position: number }[]): Promise<void> {
    const supabase = createClient()
    for (const item of items) {
      const { error } = await supabase
        .from('playlist_items')
        .update({ position: item.position })
        .eq('id', item.id)
      if (error) throw error
    }
  },
}
