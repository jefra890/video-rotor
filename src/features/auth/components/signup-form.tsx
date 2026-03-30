'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/shared/components/button'
import { Input } from '@/shared/components/input'
import { signupSchema, type SignupInput } from '../types'
import { authService } from '../services/auth-service'

export function SignupForm() {
  const [form, setForm] = useState<SignupInput>({ email: '', password: '', fullName: '' })
  const [errors, setErrors] = useState<Partial<Record<keyof SignupInput, string>>>({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setServerError('')

    const result = signupSchema.safeParse(form)
    if (!result.success) {
      const fieldErrors: typeof errors = {}
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof SignupInput
        fieldErrors[field] = err.message
      })
      setErrors(fieldErrors)
      return
    }

    setLoading(true)
    try {
      await authService.signup(result.data)
      router.push('/dashboard')
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {serverError && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{serverError}</div>
      )}
      <Input
        label="Nombre completo"
        type="text"
        placeholder="Tu nombre"
        value={form.fullName}
        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
        error={errors.fullName}
      />
      <Input
        label="Email"
        type="email"
        placeholder="tu@email.com"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        error={errors.email}
      />
      <Input
        label="Password"
        type="password"
        placeholder="••••••"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        error={errors.password}
      />
      <Button type="submit" loading={loading} className="w-full">
        Crear Cuenta
      </Button>
      <p className="text-center text-sm text-surface-500">
        Ya tienes cuenta?{' '}
        <Link href="/login" className="text-primary-600 hover:underline">
          Inicia Sesion
        </Link>
      </p>
    </form>
  )
}
