import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params
  const supabase = await createClient()

  const { data: device, error: deviceError } = await supabase
    .from('devices')
    .select('id, name, playlist_id, config')
    .eq('device_key', key)
    .single()

  if (deviceError || !device) {
    return NextResponse.json({ error: 'Dispositivo no encontrado' }, { status: 404 })
  }

  // Update last_ping
  await supabase
    .from('devices')
    .update({ status: 'online', last_ping: new Date().toISOString() })
    .eq('id', device.id)

  if (!device.playlist_id) {
    return NextResponse.json({ device: device.name, playlist: null, items: [] })
  }

  const { data: playlist } = await supabase
    .from('playlists')
    .select('*, playlist_items(*, media(*))')
    .eq('id', device.playlist_id)
    .single()

  if (!playlist) {
    return NextResponse.json({ device: device.name, playlist: null, items: [] })
  }

  const items = (playlist.playlist_items || [])
    .sort((a: { position: number }, b: { position: number }) => a.position - b.position)
    .filter((item: { media: unknown }) => item.media)
    .map((item: { media: { name: string; type: string; original_url: string; duration: number | null }; duration_override: number | null; position: number }) => ({
      position: item.position,
      name: item.media.name,
      type: item.media.type,
      url: item.media.original_url,
      duration: item.duration_override || item.media.duration || 10,
    }))

  return NextResponse.json({
    device: device.name,
    playlist: playlist.name,
    config: device.config,
    items,
  })
}
