'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { playerService, type PlaylistWithMedia } from '@/features/player/services/player-service'
import type { Playlist } from '@/shared/types/database'
import { Button } from '@/shared/components/button'

export function PlayerPreview() {
  const { user } = useAuth()

  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>('')
  const [playlist, setPlaylist] = useState<PlaylistWithMedia | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [autoPlay, setAutoPlay] = useState(false)
  const [loading, setLoading] = useState(false)
  const autoPlayRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!user) return
    playerService.getUserPlaylists(user.id).then(setPlaylists).catch(console.error)
  }, [user])

  useEffect(() => {
    if (!selectedPlaylistId) return
    setLoading(true)
    setCurrentIndex(0)
    playerService
      .getPlaylistWithMedia(selectedPlaylistId)
      .then(setPlaylist)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [selectedPlaylistId])

  const totalItems = playlist?.playlist_items.length ?? 0
  const currentItem = playlist?.playlist_items[currentIndex]

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalItems)
  }, [totalItems])

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalItems) % totalItems)
  }, [totalItems])

  useEffect(() => {
    if (!autoPlay || totalItems === 0) return
    const duration = currentItem?.duration_override ?? currentItem?.media.duration ?? 5
    autoPlayRef.current = setTimeout(goNext, duration * 1000)
    return () => {
      if (autoPlayRef.current) clearTimeout(autoPlayRef.current)
    }
  }, [autoPlay, currentIndex, currentItem, goNext, totalItems])

  const currentMedia = currentItem?.media

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-surface-900">Vista Previa del Reproductor</h1>
      </div>

      <div className="flex flex-col items-start gap-8 lg:flex-row">
        {/* Controls panel */}
        <div className="w-full space-y-4 lg:w-72">
          <div>
            <label htmlFor="playlist-select" className="mb-1.5 block text-sm font-medium text-surface-700">
              Seleccionar Playlist
            </label>
            <select
              id="playlist-select"
              value={selectedPlaylistId}
              onChange={(e) => setSelectedPlaylistId(e.target.value)}
              className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">-- Elige una playlist --</option>
              {playlists.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {playlist && totalItems > 0 && (
            <>
              <div className="rounded-lg border border-surface-200 bg-white p-4 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-surface-400">
                  Controles
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={goPrev}
                    aria-label="Anterior"
                    className="flex-1"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </Button>
                  <span className="min-w-[4rem] text-center text-sm font-medium text-surface-700">
                    {currentIndex + 1} de {totalItems}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={goNext}
                    aria-label="Siguiente"
                    className="flex-1"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
                <button
                  onClick={() => setAutoPlay((prev) => !prev)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    autoPlay
                      ? 'bg-primary-50 text-primary-700'
                      : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                  }`}
                >
                  <span>Auto-reproduccion</span>
                  <div className={`h-4 w-8 rounded-full transition-colors ${autoPlay ? 'bg-primary-600' : 'bg-surface-300'}`}>
                    <div className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${autoPlay ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                </button>
              </div>

              <div className="rounded-lg border border-surface-200 bg-white p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-surface-400">
                  Elementos ({totalItems})
                </p>
                <ul className="space-y-1 max-h-48 overflow-y-auto">
                  {playlist.playlist_items.map((item, idx) => (
                    <li key={item.id}>
                      <button
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-full truncate rounded px-2 py-1 text-left text-xs transition-colors ${
                          idx === currentIndex
                            ? 'bg-primary-50 text-primary-700 font-medium'
                            : 'text-surface-600 hover:bg-surface-100'
                        }`}
                      >
                        {idx + 1}. {item.media.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>

        {/* TV frame */}
        <div className="flex flex-1 items-center justify-center rounded-2xl bg-surface-900 p-8 min-h-[560px]">
          {!selectedPlaylistId ? (
            <p className="text-sm text-surface-400">Selecciona una playlist para ver la previa</p>
          ) : loading ? (
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
          ) : totalItems === 0 ? (
            <p className="text-sm text-surface-400">Esta playlist no tiene contenido</p>
          ) : (
            <div
              className="relative overflow-hidden rounded-2xl bg-black shadow-2xl"
              style={{ width: 270, height: 480 }}
              aria-label="Marco de pantalla vertical"
            >
              {/* Bezel */}
              <div className="absolute inset-0 rounded-2xl border-8 border-surface-800 pointer-events-none z-10" />

              {/* Top notch */}
              <div className="absolute top-1.5 left-1/2 -translate-x-1/2 h-1.5 w-12 rounded-full bg-surface-700 z-20" />

              {/* Content */}
              {currentMedia?.type === 'image' ? (
                <Image
                  src={currentMedia.vertical_url ?? currentMedia.original_url}
                  alt={currentMedia.name}
                  fill
                  className="object-cover"
                  sizes="270px"
                  unoptimized
                />
              ) : currentMedia?.type === 'video' ? (
                <video
                  key={currentMedia.id}
                  src={currentMedia.vertical_url ?? currentMedia.original_url}
                  className="h-full w-full object-cover"
                  autoPlay
                  muted
                  playsInline
                  loop={!autoPlay}
                  onEnded={autoPlay ? goNext : undefined}
                />
              ) : null}

              {/* Overlay counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
                {currentIndex + 1} de {totalItems}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
