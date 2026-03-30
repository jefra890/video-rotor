import { createClient } from '@/lib/supabase/client'
import type { Media, DeviceWithPlaylist } from '@/shared/types/database'

export interface DashboardStats {
  mediaCount: number
  videoCount: number
  imageCount: number
  playlistCount: number
  deviceCount: number
  onlineDevices: number
}

export const dashboardService = {
  async getStats(userId: string): Promise<DashboardStats> {
    const supabase = createClient()

    const [
      { count: mediaCount },
      { count: videoCount },
      { count: imageCount },
      { count: playlistCount },
      { count: deviceCount },
      { count: onlineDevices },
    ] = await Promise.all([
      supabase
        .from('media')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId),
      supabase
        .from('media')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('type', 'video'),
      supabase
        .from('media')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('type', 'image'),
      supabase
        .from('playlists')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId),
      supabase
        .from('devices')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId),
      supabase
        .from('devices')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'online'),
    ])

    return {
      mediaCount: mediaCount ?? 0,
      videoCount: videoCount ?? 0,
      imageCount: imageCount ?? 0,
      playlistCount: playlistCount ?? 0,
      deviceCount: deviceCount ?? 0,
      onlineDevices: onlineDevices ?? 0,
    }
  },

  async getRecentMedia(userId: string, limit = 5): Promise<Media[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data ?? []
  },

  async getDeviceStatuses(userId: string): Promise<DeviceWithPlaylist[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('devices')
      .select('*, playlist:playlists(id, user_id, name, description, is_active, created_at, updated_at)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data ?? []) as DeviceWithPlaylist[]
  },
}
