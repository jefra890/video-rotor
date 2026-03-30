export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: string
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Media {
  id: string
  user_id: string
  name: string
  type: 'video' | 'image'
  original_url: string
  vertical_url: string | null
  thumbnail_url: string | null
  duration: number | null
  width: number | null
  height: number | null
  file_size: number | null
  status: 'uploading' | 'processing' | 'ready' | 'error'
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Playlist {
  id: string
  user_id: string
  name: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PlaylistItem {
  id: string
  playlist_id: string
  media_id: string
  position: number
  duration_override: number | null
  created_at: string
  media?: Media
}

export interface Device {
  id: string
  user_id: string
  name: string
  location: string | null
  device_key: string
  status: 'online' | 'offline' | 'error'
  last_ping: string | null
  playlist_id: string | null
  config: Record<string, unknown>
  created_at: string
  updated_at: string
  playlist?: Playlist
}

export interface PlaylistWithItems extends Playlist {
  playlist_items: PlaylistItem[]
}

export type DeviceWithPlaylist = Omit<Device, 'playlist'> & {
  playlist: Playlist | null
}
