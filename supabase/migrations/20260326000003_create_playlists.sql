-- Migration: create_playlists
-- Ordered collections of media items assigned to devices

CREATE TABLE IF NOT EXISTS public.playlists (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  description TEXT,
  is_active   BOOLEAN     DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_playlists_user_id ON public.playlists(user_id);

-- Enable Row Level Security
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;

-- Policy: full CRUD for own playlists
CREATE POLICY "playlists_select_own"
  ON public.playlists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "playlists_insert_own"
  ON public.playlists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "playlists_update_own"
  ON public.playlists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "playlists_delete_own"
  ON public.playlists FOR DELETE
  USING (auth.uid() = user_id);
