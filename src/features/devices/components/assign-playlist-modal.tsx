'use client'

import { useEffect, useState } from 'react'
import { Modal } from '@/shared/components/modal'
import { Button } from '@/shared/components/button'
import { createClient } from '@/lib/supabase/client'
import type { Playlist } from '@/shared/types/database'
import type { DeviceWithPlaylist } from '@/features/devices/types'

interface AssignPlaylistModalProps {
  open: boolean
  onClose: () => void
  device: DeviceWithPlaylist | null
  onAssign: (deviceId: string, playlistId: string | null) => Promise<void>
}

export function AssignPlaylistModal({ open, onClose, device, onAssign }: AssignPlaylistModalProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loadingPlaylists, setLoadingPlaylists] = useState(false)
  const [assigning, setAssigning] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    const fetchPlaylists = async () => {
      setLoadingPlaylists(true)
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('playlists')
          .select('*')
          .order('name', { ascending: true })
        if (error) throw error
        setPlaylists(data ?? [])
      } catch (err) {
        console.error('Error fetching playlists:', err)
      } finally {
        setLoadingPlaylists(false)
      }
    }
    fetchPlaylists()
  }, [open])

  const handleSelect = async (playlistId: string | null) => {
    if (!device) return
    setAssigning(playlistId ?? 'none')
    try {
      await onAssign(device.id, playlistId)
      onClose()
    } catch (err) {
      console.error('Error assigning playlist:', err)
    } finally {
      setAssigning(null)
    }
  }

  const currentId = device?.playlist_id ?? null

  return (
    <Modal open={open} onClose={onClose} title="Asignar Playlist">
      <div className="space-y-3">
        {device && (
          <p className="text-sm text-surface-500">
            Dispositivo: <span className="font-medium text-surface-800">{device.name}</span>
          </p>
        )}

        {loadingPlaylists ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded-lg bg-surface-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <ul className="space-y-2 max-h-72 overflow-y-auto" role="listbox" aria-label="Seleccionar playlist">
            <li>
              <button
                role="option"
                aria-selected={currentId === null}
                onClick={() => handleSelect(null)}
                disabled={!!assigning}
                className={`w-full flex items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                  currentId === null
                    ? 'border-primary-500 bg-primary-50 text-primary-800'
                    : 'border-surface-200 bg-white text-surface-700 hover:border-surface-300 hover:bg-surface-50'
                } disabled:opacity-50`}
              >
                <span className="italic">Sin playlist</span>
                {assigning === 'none' && (
                  <svg className="h-4 w-4 animate-spin text-primary-600" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {currentId === null && assigning !== 'none' && (
                  <svg className="h-4 w-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            </li>

            {playlists.map((playlist) => (
              <li key={playlist.id}>
                <button
                  role="option"
                  aria-selected={currentId === playlist.id}
                  onClick={() => handleSelect(playlist.id)}
                  disabled={!!assigning}
                  className={`w-full flex items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                    currentId === playlist.id
                      ? 'border-primary-500 bg-primary-50 text-primary-800'
                      : 'border-surface-200 bg-white text-surface-700 hover:border-surface-300 hover:bg-surface-50'
                  } disabled:opacity-50`}
                >
                  <div>
                    <span className="font-medium">{playlist.name}</span>
                    {!playlist.is_active && (
                      <span className="ml-2 text-xs text-surface-400">(inactiva)</span>
                    )}
                  </div>
                  {assigning === playlist.id && (
                    <svg className="h-4 w-4 animate-spin text-primary-600" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  {currentId === playlist.id && assigning !== playlist.id && (
                    <svg className="h-4 w-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              </li>
            ))}

            {playlists.length === 0 && (
              <li className="py-6 text-center text-sm text-surface-400">
                No hay playlists disponibles
              </li>
            )}
          </ul>
        )}

        <Button variant="secondary" className="w-full" onClick={onClose}>
          Cancelar
        </Button>
      </div>
    </Modal>
  )
}
