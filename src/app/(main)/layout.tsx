'use client'

import { Sidebar } from '@/shared/components/sidebar'
import { useAuth } from '@/features/auth/hooks/use-auth'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, logout } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar onLogout={logout} />
      <div className="flex-1 overflow-auto">
        <header className="flex h-16 items-center justify-between border-b border-surface-200 bg-white px-8">
          <div />
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-sm font-medium text-primary-700">
              {user?.full_name?.[0] || user?.email?.[0] || '?'}
            </div>
            <span className="text-sm text-surface-600">{user?.full_name || user?.email}</span>
          </div>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  )
}
