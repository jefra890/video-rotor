'use client'

import { useState, useCallback } from 'react'
import { Modal } from '@/shared/components/modal'
import { Button } from '@/shared/components/button'

interface UploadModalProps {
  open: boolean
  onClose: () => void
  onUpload: (file: File) => Promise<void>
  loading: boolean
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function UploadModal({ open, onClose, onUpload, loading }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')

  const handleFile = (selected: File) => {
    if (selected.type.startsWith('video/') || selected.type.startsWith('image/')) {
      setFile(selected)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFile(dropped)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) handleFile(selected)
  }

  const handleUpload = async () => {
    if (!file) return
    setError('')
    try {
      await onUpload(file)
      setFile(null)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir archivo')
    }
  }

  const handleClose = () => {
    setFile(null)
    setError('')
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Subir archivo">
      <div className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        <label
          htmlFor="file-upload"
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
            dragging
              ? 'border-primary-500 bg-primary-50'
              : 'border-surface-300 hover:border-primary-400 hover:bg-surface-50'
          }`}
        >
          <svg
            className="mb-3 h-10 w-10 text-surface-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-sm font-medium text-surface-700">Haz clic aqui para seleccionar</p>
          <p className="mt-1 text-xs text-surface-500">o arrastra y suelta</p>
          <p className="mt-2 text-xs text-surface-400">Videos e imagenes aceptados</p>
          <input
            id="file-upload"
            type="file"
            accept="video/*,image/*"
            className="sr-only"
            onChange={handleInputChange}
          />
        </label>

        {file && (
          <div className="flex items-center gap-3 rounded-lg bg-surface-50 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100">
              <svg className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-surface-800">{file.name}</p>
              <p className="text-xs text-surface-500">{formatFileSize(file.size)}</p>
            </div>
            <button
              onClick={() => setFile(null)}
              className="rounded p-1 text-surface-400 hover:text-surface-600"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleClose} className="flex-1" disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleUpload}
            className="flex-1"
            disabled={!file}
            loading={loading}
          >
            {loading ? 'Subiendo...' : 'Subir archivo'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
