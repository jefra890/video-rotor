'use client'

import { useState } from 'react'
import { Button } from '@/shared/components/button'
import { DeviceCard } from '@/features/devices/components/device-card'
import { AddDeviceModal } from '@/features/devices/components/add-device-modal'
import { AssignPlaylistModal } from '@/features/devices/components/assign-playlist-modal'
import { useDevices } from '@/features/devices/hooks/use-devices'
import type { DeviceWithPlaylist } from '@/features/devices/types'

function DeviceSkeleton() {
  return (
    <div className="rounded-xl border border-surface-200 bg-white p-6 space-y-4 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-surface-200 rounded w-2/3" />
          <div className="h-3 bg-surface-100 rounded w-1/3" />
        </div>
        <div className="h-5 w-16 bg-surface-200 rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-surface-100 rounded w-full" />
        <div className="h-3 bg-surface-100 rounded w-3/4" />
      </div>
      <div className="h-9 bg-surface-100 rounded-lg" />
      <div className="h-9 bg-surface-100 rounded-lg" />
    </div>
  )
}

export function DeviceList() {
  const { devices, loading, createDevice, deleteDevice, assignPlaylist } = useDevices()
  const [addOpen, setAddOpen] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<DeviceWithPlaylist | null>(null)

  return (
    <section aria-label="Dispositivos">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Dispositivos</h1>
          {!loading && (
            <p className="text-sm text-surface-500 mt-0.5">
              {devices.length} {devices.length === 1 ? 'dispositivo' : 'dispositivos'} registrados
            </p>
          )}
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Agregar Dispositivo
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <DeviceSkeleton key={i} />)}
        </div>
      ) : devices.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-surface-300 bg-white py-16 text-center">
          <svg className="mb-4 h-12 w-12 text-surface-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-base font-medium text-surface-600">No hay dispositivos registrados</p>
          <p className="mt-1 text-sm text-surface-400">Agrega tu primer Raspberry Pi para comenzar</p>
          <Button className="mt-4" onClick={() => setAddOpen(true)}>
            Agregar Dispositivo
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {devices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              onDelete={deleteDevice}
              onAssignPlaylist={(d) => setSelectedDevice(d)}
            />
          ))}
        </div>
      )}

      <AddDeviceModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreate={createDevice}
      />

      <AssignPlaylistModal
        open={selectedDevice !== null}
        onClose={() => setSelectedDevice(null)}
        device={selectedDevice}
        onAssign={assignPlaylist}
      />
    </section>
  )
}
