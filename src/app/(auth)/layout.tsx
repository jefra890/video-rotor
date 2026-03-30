export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-surface-900">Video Rotor</h1>
          <p className="mt-1 text-sm text-surface-500">Digital Signage Manager</p>
        </div>
        <div className="rounded-xl border border-surface-200 bg-white p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  )
}
