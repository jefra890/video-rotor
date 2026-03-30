'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePlaylists } from '@/features/playlists/hooks/use-playlists'
import { Button } from '@/shared/components/button'
import { Input } from '@/shared/components/input'
import { Card } from '@/shared/components/card'
import { Badge } from '@/shared/components/badge'

export function PlaylistList() {
  const { playlists, loading, createPlaylist, deletePlaylist, fetchPlaylists } = usePlaylists()
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  useEffect(() => {
    fetchPlaylists()
  }, [fetchPlaylists])

  const handleCreate = async () => {
    if (!newName.trim()) return
    setCreating(true)
    try {
      await createPlaylist(newName.trim())
      setNewName('')
      setShowForm(false)
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    await deletePlaylist(id)
    setConfirmDelete(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Playlists</h1>
          <p className="mt-1 text-sm text-surface-500">{playlists.length} playlist{playlists.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancelar' : 'Nueva Playlist'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Input
                label="Nombre de la playlist"
                placeholder="Ej: Pantalla principal"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                autoFocus
              />
            </div>
            <Button onClick={handleCreate} loading={creating} disabled={!newName.trim()}>
              Crear
            </Button>
          </div>
        </Card>
      )}

      {playlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-surface-200 py-20 text-center">
          <svg className="mb-4 h-12 w-12 text-surface-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <p className="text-surface-500">No hay playlists todavia</p>
          <p className="mt-1 text-sm text-surface-400">Crea tu primera playlist para comenzar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {playlists.map((playlist) => (
            <Card key={playlist.id} padding={false} className="overflow-hidden transition-shadow hover:shadow-md">
              <div className="p-5">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <Link href={`/playlists/${playlist.id}`} className="flex-1">
                    <h3 className="font-semibold text-surface-900 hover:text-primary-600 transition-colors">
                      {playlist.name}
                    </h3>
                  </Link>
                  {playlist.is_active && (
                    <Badge variant="success">Activa</Badge>
                  )}
                </div>

                {playlist.description && (
                  <p className="mb-3 text-sm text-surface-500 line-clamp-2">{playlist.description}</p>
                )}

                <p className="text-xs text-surface-400">
                  {new Date(playlist.created_at).toLocaleDateString('es-MX', {
                    year: 'numeric', month: 'short', day: 'numeric',
                  })}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-surface-100 px-5 py-3">
                <Link href={`/playlists/${playlist.id}`}>
                  <Button variant="ghost" size="sm">Editar</Button>
                </Link>

                {confirmDelete === playlist.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-surface-500">Confirmar?</span>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(playlist.id)}>Si</Button>
                    <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(null)}>No</Button>
                  </div>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(playlist.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50">
                    Eliminar
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
