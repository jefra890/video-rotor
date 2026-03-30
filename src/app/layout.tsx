import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Video Rotor - Digital Signage',
  description: 'Gestiona tus pantallas verticales de publicidad',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  )
}
