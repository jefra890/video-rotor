import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface-900 p-8 text-white">
      <div className="text-center">
        <h1 className="text-5xl font-bold">Video Rotor</h1>
        <p className="mt-4 text-lg text-surface-400">
          Gestiona tus pantallas verticales de publicidad
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <Link
            href="/login"
            className="rounded-lg bg-primary-600 px-6 py-3 font-medium text-white transition-colors hover:bg-primary-700"
          >
            Iniciar Sesion
          </Link>
          <Link
            href="/signup"
            className="rounded-lg border border-surface-600 px-6 py-3 font-medium text-surface-300 transition-colors hover:bg-surface-800"
          >
            Crear Cuenta
          </Link>
        </div>
      </div>
    </main>
  )
}
