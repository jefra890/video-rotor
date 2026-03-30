'use client'

import Link from 'next/link'
import { Card, CardTitle } from '@/shared/components/card'
import { Badge } from '@/shared/components/badge'
import type { Media } from '@/shared/types/database'

interface RecentMediaProps {
  items: Media[]
}

const statusVariant: Record<Media['status'], 'success' | 'warning' | 'error' | 'default'> = {
  ready: 'success',
  processing: 'warning',
  error: 'error',
  uploading: 'default',
}

const statusLabel: Record<Media['status'], string> = {
  ready: 'Listo',
  processing: 'Procesando',
  error: 'Error',
  uploading: 'Subiendo',
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function RecentMedia({ items }: RecentMediaProps) {
  return (
    <Card padding={false}>
      <div className="flex items-center justify-between p-6 pb-4">
        <CardTitle>Media Reciente</CardTitle>
        <Link
          href="/media"
          className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
        >
          Ver todo
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="px-6 pb-6 text-center text-sm text-surface-400">
          No hay media aun. Sube tu primer archivo.
        </div>
      ) : (
        <div className="divide-y divide-surface-100">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-6 py-3 hover:bg-surface-50 transition-colors">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-surface-900">{item.name}</p>
                <p className="text-xs text-surface-400 mt-0.5">{formatDate(item.created_at)}</p>
              </div>
              <div className="ml-4 flex items-center gap-2 shrink-0">
                <Badge variant="info">
                  {item.type === 'video' ? 'Video' : 'Imagen'}
                </Badge>
                <Badge variant={statusVariant[item.status]}>
                  {statusLabel[item.status]}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
