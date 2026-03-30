'use client'

import Link from 'next/link'
import { Card, CardTitle } from '@/shared/components/card'
import type { DeviceWithPlaylist } from '@/shared/types/database'

interface DeviceStatusProps {
  devices: DeviceWithPlaylist[]
}

const statusDot: Record<DeviceWithPlaylist['status'], string> = {
  online: 'bg-green-500',
  offline: 'bg-surface-300',
  error: 'bg-red-500',
}

const statusLabel: Record<DeviceWithPlaylist['status'], string> = {
  online: 'En linea',
  offline: 'Sin conexion',
  error: 'Error',
}

export function DeviceStatus({ devices }: DeviceStatusProps) {
  return (
    <Card padding={false}>
      <div className="flex items-center justify-between p-6 pb-4">
        <CardTitle>Estado de Dispositivos</CardTitle>
        <Link
          href="/devices"
          className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
        >
          Ver todo
        </Link>
      </div>

      {devices.length === 0 ? (
        <div className="px-6 pb-6 text-center text-sm text-surface-400">
          Sin dispositivos. Agrega tu primer dispositivo.
        </div>
      ) : (
        <div className="divide-y divide-surface-100">
          {devices.map((device) => (
            <div key={device.id} className="flex items-center gap-3 px-6 py-3 hover:bg-surface-50 transition-colors">
              <span
                className={`h-2.5 w-2.5 rounded-full shrink-0 ${statusDot[device.status]}`}
                aria-label={statusLabel[device.status]}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-surface-900">{device.name}</p>
                <p className="truncate text-xs text-surface-400">
                  {device.location ?? 'Sin ubicacion'}
                  {device.playlist ? ` • ${device.playlist.name}` : ' • Sin playlist'}
                </p>
              </div>
              <span className="shrink-0 text-xs text-surface-400">
                {statusLabel[device.status]}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
