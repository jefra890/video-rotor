import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      return NextResponse.json({ step: 'auth', error: authError.message })
    }

    if (!user) {
      return NextResponse.json({ step: 'auth', error: 'No user session' })
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json({ step: 'profile', error: profileError.message, userId: user.id })
    }

    return NextResponse.json({ ok: true, user: user.email, profile: profile.full_name })
  } catch (err) {
    return NextResponse.json({ step: 'catch', error: String(err) })
  }
}
