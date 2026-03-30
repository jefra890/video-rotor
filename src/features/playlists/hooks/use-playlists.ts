'use client'

import { useState, useCallback } from 'react'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { playlistService } from '@/features/playlists/services/playlist-service'
import type { Playlist } from '@/features/playlists/types'

export function usePlaylists() {
  const { user } = useAuth()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(false)

  const fetchPlaylists = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await playlistService.getAll(user.id)
      setPlaylists(data)
    } finally {
      setLoading(false)
    }
  }, [user])

  const createPlaylist = useCallback(
    async (name: string, description?: string) => {
      if (!user) return
      await playlistService.create(user.id, name, description)
      await fetchPlaylists()
    },
    [user, fetchPlaylists]
  )

  const deletePlaylist = useCallback(
    async (id: string) => {
      await playlistService.delete(id)
      await fetchPlaylists()
    },
    [fetchPlaylists]
  )

  return { playlists, loading, createPlaylist, deletePlaylist, fetchPlaylists }
}
