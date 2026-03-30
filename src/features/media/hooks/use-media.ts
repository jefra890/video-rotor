'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { mediaService } from '@/features/media/services/media-service'
import type { Media, MediaFilter, MediaSort } from '@/features/media/types'

export function useMedia() {
  const { user } = useAuth()
  const [mediaList, setMediaList] = useState<Media[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<MediaFilter>('all')
  const [sort, setSort] = useState<MediaSort>('newest')

  const fetchMedia = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const data = await mediaService.getAll(user.id)
      setMediaList(data)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  const uploadMedia = useCallback(
    async (file: File) => {
      if (!user?.id) return
      await mediaService.upload(user.id, file)
      await fetchMedia()
    },
    [user?.id, fetchMedia]
  )

  const deleteMedia = useCallback(
    async (id: string) => {
      if (!user?.id) return
      setLoading(true)
      try {
        await mediaService.delete(id, user.id)
        await fetchMedia()
      } finally {
        setLoading(false)
      }
    },
    [user?.id, fetchMedia]
  )

  const media = useMemo(() => {
    let result = [...mediaList]

    if (filter !== 'all') {
      result = result.filter((m) => m.type === filter)
    }

    result.sort((a, b) => {
      if (sort === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
      if (sort === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      }
      return a.name.localeCompare(b.name)
    })

    return result
  }, [mediaList, filter, sort])

  // Auto-poll when any media is processing
  useEffect(() => {
    const hasProcessing = mediaList.some(m => m.status === 'processing')
    if (!hasProcessing) return

    const interval = setInterval(fetchMedia, 5000)
    return () => clearInterval(interval)
  }, [mediaList, fetchMedia])

  return {
    media,
    loading,
    filter,
    setFilter,
    sort,
    setSort,
    fetchMedia,
    uploadMedia,
    deleteMedia,
  }
}
