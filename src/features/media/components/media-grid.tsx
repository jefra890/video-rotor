'use client'

import { useEffect, useState } from 'react'
import { useMedia } from '@/features/media/hooks/use-media'
import { MediaCard } from '@/features/media/components/media-card'
import { UploadModal } from '@/features/media/components/upload-modal'
import { Button } from '@/shared/components/button'
import type { MediaFilter, MediaSort } from '@/features/media/types'

const filterOptions: { value: MediaFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'video', label: 'Videos' },
  { value: 'image', label: 'Imagenes' },
]

const sortOptions: { value: MediaSort; label: string }[] = [
  { value: 'newest', label: 'Mas recientes' },
  { value: 'oldest', label: 'Mas antiguos' },
  { value: 'name', label: 'Nombre' },
]

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-xl border border-surface-200 bg-white shadow-sm">
      <div className="aspect-video w-full animate-pulse bg-surface-200" />
      <div className="p-3 space-y-2">
        <div className="h-4 w-3/4 animate-pulse rounded bg-surface-200" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-surface-200" />
      </div>
    </div>
  )
}

export function MediaGrid() {
  const { media, loading, filter, setFilter, sort, setSort, fetchMedia, uploadMedia, deleteMedia } =
    useMedia()
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchMedia()
  }, [fetchMedia])

  const handleUpload = async (file: File) => {
    setUploading(true)
    try {
      await uploadMedia(file)
    } catch (err) {
      throw err
    } finally {
      setUploading(false)
    }
  }

  return (
    <section aria-label="Biblioteca de media">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Media</h1>
          <p className="mt-1 text-sm text-surface-500">
            {media.length} {media.length === 1 ? 'archivo' : 'archivos'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="filter-select" className="text-sm text-surface-600 sr-only">
              Filtrar por tipo
            </label>
            <select
              id="filter-select"
              value={filter}
              onChange={(e) => setFilter(e.target.value as MediaFilter)}
              className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {filterOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <label htmlFor="sort-select" className="text-sm text-surface-600 sr-only">
              Ordenar por
            </label>
            <select
              id="sort-select"
              value={sort}
              onChange={(e) => setSort(e.target.value as MediaSort)}
              className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <Button onClick={() => setUploadOpen(true)} aria-label="Subir nuevo archivo">
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Subir archivo
          </Button>
        </div>
      </div>

      {loading && media.length === 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : media.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-surface-200 py-20 text-center">
          <svg
            className="mb-4 h-12 w-12 text-surface-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
            />
          </svg>
          <p className="text-lg font-medium text-surface-600">No hay archivos todavia</p>
          <p className="mt-1 text-sm text-surface-400">Sube tu primer video o imagen para comenzar</p>
          <Button className="mt-6" onClick={() => setUploadOpen(true)}>
            Subir archivo
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {media.map((item) => (
            <MediaCard
              key={item.id}
              media={item}
              onDelete={deleteMedia}
            />
          ))}
        </div>
      )}

      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUpload={handleUpload}
        loading={uploading}
      />
    </section>
  )
}
