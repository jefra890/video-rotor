'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePlaylistEditor } from '@/features/playlists/hooks/use-playlist-editor'
import { MediaPicker } from '@/features/playlists/components/media-picker'
import { Button } from '@/shared/components/button'
import { Input } from '@/shared/components/input'
import { Badge } from '@/shared/components/badge'

interface PlaylistEditorProps {
  playlistId: string
}

export function PlaylistEditor({ playlistId }: PlaylistEditorProps) {
  const { playlist, loading, updatePlaylist, addItem, removeItem, moveItem, fetchPlaylist } =
    usePlaylistEditor()
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState('')
  const [showPicker, setShowPicker] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const handleDownloadUSB = async () => {
    setDownloading(true)
    try {
      const res = await fetch(`/api/playlist/${playlistId}/download`)
      if (!res.ok) {
        const err = await res.json()
        alert(err.error || 'Error al descargar')
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${playlist?.name || 'playlist'}.zip`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Error al descargar playlist')
    } finally {
      setDownloading(false)
    }
  }

  useEffect(() => {
    fetchPlaylist(playlistId)
  }, [playlistId, fetchPlaylist])

  useEffect(() => {
    if (playlist) setNameValue(playlist.name)
  }, [playlist])

  const handleNameSave = async () => {
    if (!nameValue.trim() || nameValue === playlist?.name) {
      setEditingName(false)
      return
    }
    await updatePlaylist({ name: nameValue.trim() })
    setEditingName(false)
  }

  const handleToggleActive = async () => {
    if (!playlist) return
    await updatePlaylist({ is_active: !playlist.is_active })
  }

  if (loading && !playlist) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    )
  }

  if (!playlist) {
    return (
      <div className="py-20 text-center text-surface-500">
        <p>Playlist no encontrada</p>
        <Link href="/playlists" className="mt-2 inline-block text-primary-600 hover:underline text-sm">
          Volver a playlists
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/playlists" className="text-surface-400 hover:text-surface-700 transition-colors">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <span className="text-sm text-surface-400">Playlists</span>
      </div>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex-1">
          {editingName ? (
            <div className="flex items-center gap-2">
              <Input
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleNameSave(); if (e.key === 'Escape') setEditingName(false) }}
                className="text-xl font-bold"
                autoFocus
              />
              <Button size="sm" onClick={handleNameSave}>Guardar</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditingName(false)}>Cancelar</Button>
            </div>
          ) : (
            <button
              onClick={() => setEditingName(true)}
              className="group flex items-center gap-2 text-left"
              aria-label="Editar nombre"
            >
              <h1 className="text-2xl font-bold text-surface-900 group-hover:text-primary-600 transition-colors">
                {playlist.name}
              </h1>
              <svg className="h-4 w-4 text-surface-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z" />
              </svg>
            </button>
          )}

          {playlist.description && (
            <p className="mt-1 text-sm text-surface-500">{playlist.description}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleActive}
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              playlist.is_active
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-surface-100 text-surface-500 hover:bg-surface-200'
            }`}
            aria-pressed={playlist.is_active}
          >
            <span className={`h-2 w-2 rounded-full ${playlist.is_active ? 'bg-green-500' : 'bg-surface-400'}`} />
            {playlist.is_active ? 'Activa' : 'Inactiva'}
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-surface-700">
          Items ({playlist.playlist_items.length})
        </h2>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={handleDownloadUSB} loading={downloading} disabled={playlist.playlist_items.length === 0}>
            <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            USB
          </Button>
          <Button size="sm" onClick={() => setShowPicker(true)}>
            Agregar Media
          </Button>
        </div>
      </div>

      {playlist.playlist_items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-surface-200 py-16 text-center">
          <svg className="mb-3 h-10 w-10 text-surface-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <p className="text-surface-500">No hay items en esta playlist</p>
          <Button size="sm" className="mt-4" onClick={() => setShowPicker(true)}>
            Agregar Media
          </Button>
        </div>
      ) : (
        <ul className="space-y-2" aria-label="Items de la playlist">
          {playlist.playlist_items.map((item, index) => (
            <li key={item.id} className="flex items-center gap-3 rounded-lg border border-surface-200 bg-white p-3 transition-shadow hover:shadow-sm">
              <span className="cursor-grab text-surface-300" aria-hidden="true">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
              </span>

              <div className="h-12 w-20 flex-shrink-0 overflow-hidden rounded bg-surface-200">
                {item.media?.thumbnail_url ? (
                  <img src={item.media.thumbnail_url} alt={item.media.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-surface-400">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-surface-800">{item.media?.name ?? 'Sin nombre'}</p>
                <div className="mt-0.5 flex items-center gap-2">
                  {item.media?.type && (
                    <Badge variant={item.media.type === 'video' ? 'info' : 'default'} className="text-[10px]">
                      {item.media.type}
                    </Badge>
                  )}
                  {item.media?.duration && (
                    <span className="text-xs text-surface-400">{Math.round(item.media.duration)}s</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => moveItem(index, index - 1)}
                  disabled={index === 0}
                  className="rounded p-1 text-surface-400 hover:bg-surface-100 hover:text-surface-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Mover arriba"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => moveItem(index, index + 1)}
                  disabled={index === playlist.playlist_items.length - 1}
                  className="rounded p-1 text-surface-400 hover:bg-surface-100 hover:text-surface-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Mover abajo"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => removeItem(item.id)}
                  className="rounded p-1 text-surface-400 hover:bg-red-50 hover:text-red-500"
                  aria-label="Eliminar item"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <MediaPicker
        open={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={addItem}
      />
    </div>
  )
}
