'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/shared/types/database'

export function useAuth() {
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    fetch('/api/me')
      .then((res) => res.json())
      .then((profile) => {
        setUser(profile)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })

    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setUser(null)
        router.push('/login')
      } else if (event === 'SIGNED_IN') {
        fetch('/api/me')
          .then((res) => res.json())
          .then((profile) => setUser(profile))
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const logout = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }, [router])

  return { user, loading, logout }
}
