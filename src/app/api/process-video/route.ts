import { NextRequest, NextResponse } from 'next/server'
import { join } from 'path'
import { createAdminClient } from '@/lib/supabase/admin'
import { processVideo } from '@/lib/video/process-video'

export const maxDuration = 300 // 5 minutes for long videos

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-internal-secret')
  if (secret !== process.env.INTERNAL_API_SECRET) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { mediaId, userId, filePath } = await request.json()

  if (!mediaId || !userId || !filePath) {
    return NextResponse.json({ error: 'Faltan parametros' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const absoluteInput = join(process.cwd(), 'public', filePath)
  const outputDir = join(process.cwd(), 'public', 'uploads', userId)

  try {
    const result = await processVideo(absoluteInput, outputDir, userId)

    const { error } = await supabase
      .from('media')
      .update({
        vertical_url: result.verticalPath,
        thumbnail_url: result.thumbnailPath,
        width: result.width,
        height: result.height,
        duration: result.duration,
        status: 'ready',
        metadata: {
          processed_at: new Date().toISOString(),
          rotated: result.rotated,
        },
      })
      .eq('id', mediaId)
      .eq('user_id', userId)

    if (error) {
      console.error('[process-video] DB update failed:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, result })
  } catch (err) {
    console.error('[process-video] Processing failed:', err)

    await supabase
      .from('media')
      .update({
        status: 'error',
        metadata: {
          error: err instanceof Error ? err.message : 'Unknown error',
          failed_at: new Date().toISOString(),
        },
      })
      .eq('id', mediaId)
      .eq('user_id', userId)

    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Processing failed' },
      { status: 500 }
    )
  }
}
