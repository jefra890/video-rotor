import { createClient } from '@/lib/supabase/client'
import type { LoginInput, SignupInput } from '../types'

const supabase = createClient()

export const authService = {
  async login({ email, password }: LoginInput) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
    return data
  },

  async signup({ email, password, fullName }: SignupInput) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) throw new Error(error.message)
    return data
  },

  async logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw new Error(error.message)
  },

  async getSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  },

  onAuthStateChange(callback: (event: string, session: unknown) => void) {
    return supabase.auth.onAuthStateChange(callback)
  },
}
