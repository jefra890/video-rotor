'use client'

import { useState, useCallback } from 'react'
import { playlistService } from '@/features/playlists/services/playlist-service'
import type { PlaylistWithItems } from '@/features/playlists/types'

export function usePlaylistEditor() {
  const [playlist, setPlaylist] = useState<PlaylistWithItems | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchPlaylist = useCallback(async (id: string) => {
    setLoading(true)
    try {
      const data = await playlistService.getById(id)
      setPlaylist(data)
    } finally {
      setLoading(false)
    }
  }, [])

  const updatePlaylist = useCallback(
    async (data: { name?: string; description?: string; is_active?: boolean }) => {
      if (!playlist) return
      const updated = await playlistService.update(playlist.id, data)
      setPlaylist((prev) => (prev ? { ...prev, ...updated } : null))
    },
    [playlist]
  )

  const addItem = useCallback(
    async (mediaId: string) => {
      if (!playlist) return
      const lastPosition = playlist.playlist_items.length
        ? Math.max(...playlist.playlist_items.map((i) => i.position))
        : -1
      await playlistService.addItem(playlist.id, mediaId, lastPosition + 1)
      await fetchPlaylist(playlist.id)
    },
    [playlist, fetchPlaylist]
  )

  const removeItem = useCallback(
    async (itemId: string) => {
      if (!playlist) return
      await playlistService.removeItem(itemId)
      const remaining = playlist.playlist_items
        .filter((i) => i.id !== itemId)
        .map((item, index) => ({ id: item.id, position: index }))
      if (remaining.length > 0) await playlistService.reorderItems(remaining)
      await fetchPlaylist(playlist.id)
    },
    [playlist, fetchPlaylist]
  )

  const moveItem = useCallback(
    async (fromIndex: number, toIndex: number) => {
      if (!playlist) return
      const items = [...playlist.playlist_items]
      const [moved] = items.splice(fromIndex, 1)
      items.splice(toIndex, 0, moved)
      const reordered = items.map((item, index) => ({ id: item.id, position: index }))
      await playlistService.reorderItems(reordered)
      await fetchPlaylist(playlist.id)
    },
    [playlist, fetchPlaylist]
  )

  return { playlist, loading, updatePlaylist, addItem, removeItem, moveItem, fetchPlaylist }
}
