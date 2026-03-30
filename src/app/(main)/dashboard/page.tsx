'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { dashboardService, type DashboardStats } from '@/features/dashboard/services/dashboard-service'
import { StatsCards } from '@/features/dashboard/components/stats-cards'
import { RecentMedia } from '@/features/dashboard/components/recent-media'
import { DeviceStatus } from '@/features/dashboard/components/device-status'
import type { Media, DeviceWithPlaylist } from '@/shared/types/database'

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()

  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentMedia, setRecentMedia] = useState<Media[]>([])
  const [devices, setDevices] = useState<DeviceWithPlaylist[]>([])
  const [dataLoaded, setDataLoaded] = useState(false)

  useEffect(() => {
    if (!user) return
    let cancelled = false

    const fetchData = async () => {
      try {
        const [statsData, mediaData, devicesData] = await Promise.all([
          dashboardService.getStats(user.id),
          dashboardService.getRecentMedia(user.id),
          dashboardService.getDeviceStatuses(user.id),
        ])
        if (cancelled) return
        setStats(statsData)
        setRecentMedia(mediaData)
        setDevices(devicesData)
      } catch {
        // Ignore AbortError from strict mode re-renders
      } finally {
        if (!cancelled) setDataLoaded(true)
      }
    }

    fetchData()
    return () => { cancelled = true }
  }, [user])

  if (authLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-36 rounded-lg bg-surface-200 animate-pulse" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-surface-200 animate-pulse" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-64 rounded-xl bg-surface-200 animate-pulse" />
          <div className="h-64 rounded-xl bg-surface-200 animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-surface-900">Dashboard</h1>

      {stats && <StatsCards stats={stats} />}

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentMedia items={recentMedia} />
        <DeviceStatus devices={devices} />
      </div>
    </div>
  )
}
