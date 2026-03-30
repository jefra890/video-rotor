import { NextRequest, NextResponse } from 'next/server'
import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'
import { createClient } from '@/lib/supabase/server'
import { processVideoInBackground } from '@/lib/video/process-video'

const UPLOADS_DIR = join(process.cwd(), 'public', 'uploads')

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const fileName = request.headers.get('x-file-name')
  const fileType = request.headers.get('x-file-type') || ''

  if (!fileName) {
    return NextResponse.json({ error: 'Falta nombre de archivo' }, { status: 400 })
  }

  const userDir = join(UPLOADS_DIR, user.id)
  await mkdir(userDir, { recursive: true })

  const ext = fileName.split('.').pop() || ''
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const filePath = join(userDir, safeName)

  // Read binary body and write to disk
  const buffer = Buffer.from(await request.arrayBuffer())
  await writeFile(filePath, buffer)

  const url = `/uploads/${user.id}/${safeName}`
  const type: 'video' | 'image' = fileType.startsWith('video/') ? 'video' : 'image'

  const { data, error } = await supabase
    .from('media')
    .insert({
      user_id: user.id,
      name: fileName,
      type,
      original_url: url,
      vertical_url: null,
      thumbnail_url: null,
      file_size: buffer.length,
      status: type === 'video' ? 'processing' : 'ready',
      metadata: {},
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (type === 'video' && data) {
    processVideoInBackground(data.id, user.id, filePath, userDir)
  }

  return NextResponse.json(data)
}
