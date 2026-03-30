'use client'

import { useState, useEffect, useCallback } from 'react'
import { deviceService } from '@/features/devices/services/device-service'
import { useAuth } from '@/features/auth/hooks/use-auth'
import type { DeviceWithPlaylist } from '@/features/devices/types'

export function useDevices() {
  const { user } = useAuth()
  const [devices, setDevices] = useState<DeviceWithPlaylist[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDevices = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const data = await deviceService.getAll(user.id)
      setDevices(data)
    } catch (err) {
      console.error('Error fetching devices:', err)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchDevices()
  }, [fetchDevices])

  const createDevice = async (name: string, location?: string): Promise<DeviceWithPlaylist> => {
    if (!user?.id) throw new Error('Usuario no autenticado')
    const device = await deviceService.create(user.id, name, location)
    await fetchDevices()
    return device
  }

  const deleteDevice = async (id: string): Promise<void> => {
    await deviceService.delete(id)
    await fetchDevices()
  }

  const assignPlaylist = async (deviceId: string, playlistId: string | null): Promise<void> => {
    await deviceService.assignPlaylist(deviceId, playlistId)
    await fetchDevices()
  }

  return { devices, loading, createDevice, deleteDevice, assignPlaylist, fetchDevices }
}
