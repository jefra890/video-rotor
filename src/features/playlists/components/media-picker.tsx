'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { Modal } from '@/shared/components/modal'
import { Badge } from '@/shared/components/badge'
import type { Media } from '@/shared/types/database'

interface MediaPickerProps {
  open: boolean
  onClose: () => void
  onSelect: (mediaId: string) => Promise<void>
}

export function MediaPicker({ open, onClose, onSelect }: MediaPickerProps) {
  const { user } = useAuth()
  const [media, setMedia] = useState<Media[]>([])
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !user) return

    const fetchMedia = async () => {
      setLoading(true)
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('media')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'ready')
          .order('created_at', { ascending: false })
        setMedia(data ?? [])
      } finally {
        setLoading(false)
      }
    }

    fetchMedia()
  }, [open, user])

  const handleSelect = async (mediaId: string) => {
    setAdding(mediaId)
    try {
      await onSelect(mediaId)
      onClose()
    } finally {
      setAdding(null)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Agregar Media" className="max-w-2xl">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      ) : media.length === 0 ? (
        <div className="py-12 text-center text-surface-500">
          <p>No hay media disponible</p>
          <p className="mt-1 text-sm text-surface-400">Sube archivos en la seccion Media</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {media.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              disabled={adding === item.id}
              className="group relative overflow-hidden rounded-lg border border-surface-200 bg-surface-50 text-left transition-all hover:border-primary-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-60"
            >
              <div className="aspect-video w-full overflow-hidden bg-surface-200">
                {item.thumbnail_url ? (
                  <img
                    src={item.thumbnail_url}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-surface-400">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-2">
                <p className="truncate text-xs font-medium text-surface-800">{item.name}</p>
                <div className="mt-1 flex items-center gap-1">
                  <Badge variant={item.type === 'video' ? 'info' : 'default'} className="text-[10px]">
                    {item.type}
                  </Badge>
                  {item.duration && (
                    <span className="text-[10px] text-surface-400">
                      {Math.round(item.duration)}s
                    </span>
                  )}
                </div>
              </div>
              {adding === item.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </Modal>
  )
}
