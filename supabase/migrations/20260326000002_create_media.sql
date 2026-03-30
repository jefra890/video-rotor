-- Migration: create_media
-- Stores uploaded video/image assets for each user

CREATE TABLE IF NOT EXISTS public.media (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name           TEXT        NOT NULL,
  type           TEXT        NOT NULL CHECK (type IN ('video', 'image')),
  original_url   TEXT        NOT NULL,
  vertical_url   TEXT,
  thumbnail_url  TEXT,
  duration       INTEGER,           -- seconds, for videos
  width          INTEGER,
  height         INTEGER,
  file_size      BIGINT,
  status         TEXT        NOT NULL DEFAULT 'uploading'
                             CHECK (status IN ('uploading', 'processing', 'ready', 'error')),
  metadata       JSONB       DEFAULT '{}',
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

-- Index for common query pattern: all media for a user
CREATE INDEX idx_media_user_id ON public.media(user_id);

-- Index for status filtering (e.g. show only ready items)
CREATE INDEX idx_media_user_status ON public.media(user_id, status);

-- Enable Row Level Security
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- Policy: full CRUD for own media
CREATE POLICY "media_select_own"
  ON public.media FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "media_insert_own"
  ON public.media FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "media_update_own"
  ON public.media FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "media_delete_own"
  ON public.media FOR DELETE
  USING (auth.uid() = user_id);
