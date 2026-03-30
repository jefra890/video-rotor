'use server'

import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { createClient } from '@/lib/supabase/server'
import { processVideoInBackground } from '@/lib/video/process-video'

const UPLOADS_DIR = join(process.cwd(), 'public', 'uploads')

export async function uploadMedia(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('No autenticado')
  }

  const file = formData.get('file') as File | null

  if (!file) {
    throw new Error('No se envio archivo')
  }

  const userDir = join(UPLOADS_DIR, user.id)
  await mkdir(userDir, { recursive: true })

  const ext = file.name.split('.').pop() || ''
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const filePath = join(userDir, fileName)

  const bytes = await file.arrayBuffer()
  await writeFile(filePath, Buffer.from(bytes))

  const url = `/uploads/${user.id}/${fileName}`
  const type: 'video' | 'image' = file.type.startsWith('video/') ? 'video' : 'image'

  const { data, error } = await supabase
    .from('media')
    .insert({
      user_id: user.id,
      name: file.name,
      type,
      original_url: url,
      vertical_url: null,
      thumbnail_url: null,
      file_size: file.size,
      status: type === 'video' ? 'processing' : 'ready',
      metadata: {},
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  if (type === 'video' && data) {
    processVideoInBackground(data.id, user.id, filePath, userDir)
  }

  return data
}
