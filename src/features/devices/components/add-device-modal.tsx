'use client'

import { useState } from 'react'
import { Modal } from '@/shared/components/modal'
import { Input } from '@/shared/components/input'
import { Button } from '@/shared/components/button'
import type { DeviceWithPlaylist } from '@/features/devices/types'

interface AddDeviceModalProps {
  open: boolean
  onClose: () => void
  onCreate: (name: string, location?: string) => Promise<DeviceWithPlaylist>
}

export function AddDeviceModal({ open, onClose, onCreate }: AddDeviceModalProps) {
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [createdDevice, setCreatedDevice] = useState<DeviceWithPlaylist | null>(null)
  const [keyCopied, setKeyCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('El nombre es requerido')
      return
    }
    setLoading(true)
    setError('')
    try {
      const device = await onCreate(name.trim(), location.trim() || undefined)
      setCreatedDevice(device)
    } catch {
      setError('Error al crear el dispositivo. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyKey = async () => {
    if (!createdDevice) return
    await navigator.clipboard.writeText(createdDevice.device_key)
    setKeyCopied(true)
    setTimeout(() => setKeyCopied(false), 2000)
  }

  const handleClose = () => {
    setName('')
    setLocation('')
    setError('')
    setCreatedDevice(null)
    setKeyCopied(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Agregar Dispositivo">
      {createdDevice ? (
        <div className="space-y-4">
          <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-center space-y-2">
            <svg className="mx-auto h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-semibold text-green-800">Dispositivo creado</p>
            <p className="text-sm text-green-700">{createdDevice.name}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-surface-700">Clave del dispositivo</p>
            <div className="flex items-center gap-2 rounded-lg border border-surface-300 bg-surface-50 px-3 py-2">
              <code className="flex-1 text-xs font-mono text-surface-800 break-all">
                {createdDevice.device_key}
              </code>
              <button
                onClick={handleCopyKey}
                aria-label="Copiar clave"
                className="shrink-0 rounded p-1 text-surface-400 hover:text-primary-600 transition-colors"
              >
                {keyCopied ? (
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
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Guarda esta clave, la necesitaras para configurar tu Raspberry Pi
            </p>
          </div>

          <Button className="w-full" onClick={handleClose}>
            Listo
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre del dispositivo"
            placeholder="Ej. Pantalla Recepcion"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={error}
            required
            autoFocus
          />
          <Input
            label="Ubicacion (opcional)"
            placeholder="Ej. Piso 2, Sala de espera"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" loading={loading}>
              Crear dispositivo
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
