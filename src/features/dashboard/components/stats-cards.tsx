'use client'

import { Card } from '@/shared/components/card'
import type { DashboardStats } from '@/features/dashboard/services/dashboard-service'

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number
  subtitle?: string
}

function StatCard({ icon, label, value, subtitle }: StatCardProps) {
  return (
    <Card className="flex items-start gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50 text-primary-600 shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-surface-500">{label}</p>
        <p className="text-2xl font-bold text-surface-900">{value}</p>
        {subtitle && (
          <p className="text-xs text-surface-400 mt-0.5">{subtitle}</p>
        )}
      </div>
    </Card>
  )
}

interface StatsCardsProps {
  stats: DashboardStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard
        label="Total Media"
        value={stats.mediaCount}
        icon={
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        }
      />
      <StatCard
        label="Videos"
        value={stats.videoCount}
        icon={
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        }
      />
      <StatCard
        label="Playlists"
        value={stats.playlistCount}
        icon={
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        }
      />
      <StatCard
        label="Dispositivos"
        value={stats.deviceCount}
        subtitle={`${stats.onlineDevices} en linea`}
        icon={
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        }
      />
    </div>
  )
}
