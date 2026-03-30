'use client'

import { useParams } from 'next/navigation'
import { PlaylistEditor } from '@/features/playlists/components/playlist-editor'

export default function PlaylistEditorPage() {
  const params = useParams()
  return <PlaylistEditor playlistId={params.id as string} />
}
