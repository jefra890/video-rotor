import ffmpeg from 'fluent-ffmpeg'
import { join } from 'path'
import { mkdir } from 'fs/promises'
import { createClient } from '@supabase/supabase-js'

export interface ProbeResult {
  width: number
  height: number
  duration: number
  isPortrait: boolean
}

export interface ProcessingResult {
  verticalPath: string   // relative URL: /uploads/{userId}/vertical-xxx.mp4
  thumbnailPath: string  // relative URL: /uploads/{userId}/thumb-xxx.jpg
  width: number
  height: number
  duration: number
  rotated: boolean
}

function probe(inputPath: string): Promise<ProbeResult> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) return reject(err)

      const videoStream = metadata.streams.find(s => s.codec_type === 'video')
      if (!videoStream) return reject(new Error('No video stream found'))

      const width = videoStream.width ?? 0
      const height = videoStream.height ?? 0
      const duration = Number(metadata.format.duration ?? 0)

      resolve({
        width,
        height,
        duration,
        isPortrait: height > width,
      })
    })
  })
}

function runFfmpeg(command: ffmpeg.FfmpegCommand): Promise<void> {
  return new Promise((resolve, reject) => {
    command
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .run()
  })
}

export async function processVideo(
  inputPath: string,
  outputDir: string,
  userId: string,
): Promise<ProcessingResult> {
  await mkdir(outputDir, { recursive: true })

  const info = await probe(inputPath)
  const timestamp = Date.now()
  const rand = Math.random().toString(36).slice(2, 8)

  // Generate vertical video
  const verticalFilename = `vertical-${timestamp}-${rand}.mp4`
  const verticalAbsPath = join(outputDir, verticalFilename)

  if (info.isPortrait) {
    // Video 9:16 → rotar 90° → se convierte en 16:9 → llena la TV horizontal montada en vertical
    const cmd = ffmpeg(inputPath)
      .videoFilters('transpose=1')
      .videoCodec('libx264')
      .outputOptions(['-crf', '23', '-preset', 'medium', '-movflags', '+faststart'])
      .audioCodec('aac')
      .output(verticalAbsPath)

    await runFfmpeg(cmd)
  } else {
    // Video 16:9 → ya llena la TV, solo re-encodear
    const cmd = ffmpeg(inputPath)
      .videoCodec('libx264')
      .outputOptions(['-crf', '23', '-preset', 'medium', '-movflags', '+faststart'])
      .audioCodec('aac')
      .output(verticalAbsPath)

    await runFfmpeg(cmd)
  }

  // Generate thumbnail at 25% of duration (min 1 second)
  const thumbnailFilename = `thumb-${timestamp}-${rand}.jpg`
  const thumbnailAbsPath = join(outputDir, thumbnailFilename)
  const seekTime = Math.max(1, info.duration * 0.25)

  const thumbCmd = ffmpeg(inputPath)
    .seekInput(seekTime)
    .frames(1)
    .size('480x?')
    .output(thumbnailAbsPath)

  await runFfmpeg(thumbCmd)

  // Get final dimensions of the processed video
  const outputInfo = await probe(verticalAbsPath)

  return {
    verticalPath: `/uploads/${userId}/${verticalFilename}`,
    thumbnailPath: `/uploads/${userId}/${thumbnailFilename}`,
    width: outputInfo.width,
    height: outputInfo.height,
    duration: info.duration,
    rotated: info.isPortrait,
  }
}

export function processVideoInBackground(
  mediaId: string,
  userId: string,
  inputPath: string,
  outputDir: string,
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  processVideo(inputPath, outputDir, userId)
    .then(async (result) => {
      await supabase.rpc('update_media_processing', {
        p_media_id: mediaId,
        p_user_id: userId,
        p_vertical_url: result.verticalPath,
        p_thumbnail_url: result.thumbnailPath,
        p_width: result.width,
        p_height: result.height,
        p_duration: result.duration,
        p_rotated: result.rotated,
      })
      console.log(`[process-video] Done: ${mediaId}`)
    })
    .catch(async (err) => {
      console.error(`[process-video] Failed: ${mediaId}`, err)
      await supabase.rpc('set_media_error', {
        p_media_id: mediaId,
        p_user_id: userId,
        p_error: err instanceof Error ? err.message : 'Unknown error',
      })
    })
}
