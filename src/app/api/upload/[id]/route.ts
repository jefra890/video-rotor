import { NextRequest, NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import { join } from 'path'
import { createClient } from '@/lib/supabase/server'

const UPLOADS_DIR = join(process.cwd(), 'public', 'uploads')

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { data: media, error: fetchError } = await supabase
    .from('media')
    .select('original_url, vertical_url, thumbnail_url')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 404 })
  }

  // Clean up all associated files
  const filesToDelete = [
    media?.original_url,
    media?.vertical_url,
    media?.thumbnail_url,
  ].filter((url): url is string => !!url && url.startsWith('/uploads/'))

  for (const url of filesToDelete) {
    try {
      await unlink(join(process.cwd(), 'public', url))
    } catch {
      // File might not exist, continue
    }
  }

  const { error } = await supabase
    .from('media')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
