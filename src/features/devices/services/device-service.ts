import { createClient } from '@/lib/supabase/client'
import type { DeviceWithPlaylist } from '@/features/devices/types'

export const deviceService = {
  async getAll(userId: string): Promise<DeviceWithPlaylist[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('devices')
      .select('*, playlist:playlists(id, name, is_active)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data ?? []) as DeviceWithPlaylist[]
  },

  async getById(id: string): Promise<DeviceWithPlaylist | null> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('devices')
      .select('*, playlist:playlists(id, name, is_active)')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as DeviceWithPlaylist
  },

  async create(userId: string, name: string, location?: string): Promise<DeviceWithPlaylist> {
    const supabase = createClient()
    const deviceKey = crypto.randomUUID()

    const { data, error } = await supabase
      .from('devices')
      .insert({
        user_id: userId,
        name,
        location: location ?? null,
        device_key: deviceKey,
        status: 'offline',
        config: {},
      })
      .select('*, playlist:playlists(id, name, is_active)')
      .single()

    if (error) throw error
    return data as DeviceWithPlaylist
  },

  async update(
    id: string,
    data: { name?: string; location?: string; playlist_id?: string | null; config?: Record<string, unknown> }
  ): Promise<DeviceWithPlaylist> {
    const supabase = createClient()
    const { data: updated, error } = await supabase
      .from('devices')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, playlist:playlists(id, name, is_active)')
      .single()

    if (error) throw error
    return updated as DeviceWithPlaylist
  },

  async delete(id: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase
      .from('devices')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async assignPlaylist(deviceId: string, playlistId: string | null): Promise<DeviceWithPlaylist> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('devices')
      .update({ playlist_id: playlistId, updated_at: new Date().toISOString() })
      .eq('id', deviceId)
      .select('*, playlist:playlists(id, name, is_active)')
      .single()

    if (error) throw error
    return data as DeviceWithPlaylist
  },
}
