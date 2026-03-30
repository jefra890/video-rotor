import { NextRequest, NextResponse } from 'next/server'
import { createReadStream, existsSync } from 'fs'
import { join } from 'path'
import archiver from 'archiver'
import { PassThrough } from 'stream'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { data: playlist, error: playlistError } = await supabase
    .from('playlists')
    .select('*, playlist_items(*, media(*))')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (playlistError || !playlist) {
    return NextResponse.json({ error: 'Playlist no encontrada' }, { status: 404 })
  }

  const items = (playlist.playlist_items || [])
    .sort((a: { position: number }, b: { position: number }) => a.position - b.position)

  if (items.length === 0) {
    return NextResponse.json({ error: 'Playlist vacia' }, { status: 400 })
  }

  const passthrough = new PassThrough()
  const archive = archiver('zip', { zlib: { level: 1 } })

  archive.pipe(passthrough)

  for (let i = 0; i < items.length; i++) {
    const media = items[i].media
    if (!media?.original_url) continue

    const filePath = join(process.cwd(), 'public', media.original_url)
    if (!existsSync(filePath)) continue

    const ext = media.name.split('.').pop() || 'mp4'
    const orderNum = String(i + 1).padStart(2, '0')
    const safeName = media.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    archive.append(createReadStream(filePath), { name: `${orderNum}_${safeName}` })
  }

  await archive.finalize()

  const chunks: Uint8Array[] = []
  for await (const chunk of passthrough) {
    chunks.push(chunk as Uint8Array)
  }
  const buffer = Buffer.concat(chunks)

  const safeName = playlist.name.replace(/[^a-zA-Z0-9-]/g, '_')

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${safeName}.zip"`,
    },
  })
}
