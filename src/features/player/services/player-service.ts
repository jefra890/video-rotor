import { createClient } from '@/lib/supabase/client'
import type { Playlist, PlaylistItem, Media } from '@/shared/types/database'

export interface PlaylistItemWithMedia extends PlaylistItem {
  media: Media
}

export interface PlaylistWithMedia extends Playlist {
  playlist_items: PlaylistItemWithMedia[]
}

export const playerService = {
  async getPlaylistWithMedia(playlistId: string): Promise<PlaylistWithMedia | null> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('playlists')
      .select('*, playlist_items(*, media(*))')
      .eq('id', playlistId)
      .single()

    if (error) throw error
    if (!data) return null

    const sorted = {
      ...data,
      playlist_items: (data.playlist_items as PlaylistItemWithMedia[])
        .sort((a, b) => a.position - b.position),
    }

    return sorted as PlaylistWithMedia
  },

  async getUserPlaylists(userId: string): Promise<Playlist[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('playlists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data ?? []
  },
}
