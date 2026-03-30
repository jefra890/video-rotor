'use client'

import { useState } from 'react'
import { Badge } from '@/shared/components/badge'
import { Button } from '@/shared/components/button'
import { Card } from '@/shared/components/card'
import type { DeviceWithPlaylist } from '@/features/devices/types'

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'hace un momento'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours}h`
  const days = Math.floor(hours / 24)
  return `hace ${days}d`
}

const statusConfig = {
  online: { variant: 'success' as const, label: 'En linea' },
  offline: { variant: 'default' as const, label: 'Desconectado' },
  error: { variant: 'error' as const, label: 'Error' },
}

interface DeviceCardProps {
  device: DeviceWithPlaylist
  onDelete: (id: string) => void
  onAssignPlaylist: (device: DeviceWithPlaylist) => void
}

export function DeviceCard({ device, onDelete, onAssignPlaylist }: DeviceCardProps) {
  const [copied, setCopied] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const maskedKey = device.device_key
    ? `${device.device_key.slice(0, 8)}...${device.device_key.slice(-4)}`
    : ''

  const handleCopy = async () => {
    await navigator.clipboard.writeText(device.device_key)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(device.id)
    } else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
    }
  }

  const status = statusConfig[device.status] ?? statusConfig.offline

  return (
    <Card className="flex flex-col gap-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-surface-900 truncate">{device.name}</h3>
          {device.location && (
            <p className="text-sm text-surface-500 truncate">{device.location}</p>
          )}
        </div>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>

      <div className="space-y-2 text-sm text-surface-600">
        <div className="flex items-center justify-between">
          <span className="text-surface-500">Ultima conexion</span>
          <span>{device.last_ping ? timeAgo(device.last_ping) : 'Nunca'}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-surface-500">Playlist</span>
          {device.playlist ? (
            <span className="text-surface-800 font-medium truncate max-w-[140px]">
              {device.playlist.name}
            </span>
          ) : (
            <span className="text-surface-400 italic">Sin playlist</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-lg bg-surface-50 px-3 py-2">
        <code className="flex-1 text-xs text-surface-600 font-mono truncate">{maskedKey}</code>
        <button
          onClick={handleCopy}
          aria-label="Copiar clave del dispositivo"
          className="shrink-0 rounded p-1 text-surface-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
        >
          {copied ? (
            <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
      </div>

      <div className="flex items-center gap-2 pt-1 border-t border-surface-100">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={() => onAssignPlaylist(device)}
        >
          Asignar Playlist
        </Button>
        <Button
          variant={confirmDelete ? 'danger' : 'ghost'}
          size="sm"
          onClick={handleDelete}
          aria-label={confirmDelete ? 'Confirmar eliminacion' : 'Eliminar dispositivo'}
        >
          {confirmDelete ? 'Confirmar' : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
        </Button>
      </div>
    </Card>
  )
}
