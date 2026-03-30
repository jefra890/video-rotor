-- Migration: create_playlist_items
-- Join table between playlists and media, with ordering

CREATE TABLE IF NOT EXISTS public.playlist_items (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id       UUID        NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  media_id          UUID        NOT NULL REFERENCES public.media(id)    ON DELETE CASCADE,
  position          INTEGER     NOT NULL DEFAULT 0,
  duration_override INTEGER,    -- override display duration in seconds
  created_at        TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT playlist_items_playlist_position_unique UNIQUE (playlist_id, position)
);

CREATE INDEX idx_playlist_items_playlist_id ON public.playlist_items(playlist_id);
CREATE INDEX idx_playlist_items_media_id    ON public.playlist_items(media_id);

-- Enable Row Level Security
ALTER TABLE public.playlist_items ENABLE ROW LEVEL SECURITY;

-- Policies gate access through the parent playlist ownership
CREATE POLICY "playlist_items_select_own"
  ON public.playlist_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.playlists
      WHERE playlists.id = playlist_items.playlist_id
        AND playlists.user_id = auth.uid()
    )
  );

CREATE POLICY "playlist_items_insert_own"
  ON public.playlist_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.playlists
      WHERE playlists.id = playlist_items.playlist_id
        AND playlists.user_id = auth.uid()
    )
  );

CREATE POLICY "playlist_items_update_own"
  ON public.playlist_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.playlists
      WHERE playlists.id = playlist_items.playlist_id
        AND playlists.user_id = auth.uid()
    )
  );

CREATE POLICY "playlist_items_delete_own"
  ON public.playlist_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.playlists
      WHERE playlists.id = playlist_items.playlist_id
        AND playlists.user_id = auth.uid()
    )
  );
