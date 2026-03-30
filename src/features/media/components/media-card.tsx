'use client'

import { useState } from 'react'
import { Card } from '@/shared/components/card'
import { Badge } from '@/shared/components/badge'
import { Button } from '@/shared/components/button'
import type { Media } from '@/features/media/types'

interface MediaCardProps {
  media: Media
  onDelete: (id: string) => void
  onClick?: (media: Media) => void
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '—'
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '—'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

const statusVariant: Record<Media['status'], 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  ready: 'success',
  processing: 'warning',
  uploading: 'info',
  error: 'error',
}

const statusLabel: Record<Media['status'], string> = {
  ready: 'Listo',
  processing: 'Procesando',
  uploading: 'Subiendo',
  error: 'Error',
}

export function MediaCard({ media, onDelete, onClick }: MediaCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirmDelete) {
      onDelete(media.id)
    } else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
    }
  }

  return (
    <Card
      padding={false}
      className="group cursor-pointer overflow-hidden transition-shadow hover:shadow-md"
    >
      <div
        onClick={() => onClick?.(media)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onClick?.(media)}
        aria-label={`Ver ${media.name}`}
      >
        <div className="relative aspect-video w-full bg-surface-100">
          {media.type === 'video' && media.thumbnail_url ? (
            <img
              src={media.thumbnail_url}
              alt={media.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : media.type === 'image' && media.original_url ? (
            <img
              src={media.original_url}
              alt={media.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <svg
                className="h-12 w-12 text-surface-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}

          {media.status === 'processing' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
            </div>
          )}

          <div className="absolute right-2 top-2 flex gap-1">
            <Badge variant={media.type === 'video' ? 'info' : 'default'}>
              {media.type === 'video' ? 'Video' : 'Imagen'}
            </Badge>
          </div>
        </div>

        <div className="p-3">
          <p className="truncate text-sm font-medium text-surface-900" title={media.name}>
            {media.name}
          </p>

          <div className="mt-1.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={statusVariant[media.status]}>
                {statusLabel[media.status]}
              </Badge>
              {media.type === 'video' && media.duration && (
                <span className="text-xs text-surface-500">{formatDuration(media.duration)}</span>
              )}
            </div>
            <span className="text-xs text-surface-400">{formatFileSize(media.file_size)}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-surface-100 px-3 py-2">
        <Button
          variant={confirmDelete ? 'danger' : 'ghost'}
          size="sm"
          onClick={handleDeleteClick}
          className="w-full"
          aria-label={confirmDelete ? 'Confirmar eliminacion' : 'Eliminar medio'}
        >
          {confirmDelete ? 'Confirmar eliminacion' : 'Eliminar'}
        </Button>
      </div>
    </Card>
  )
}
