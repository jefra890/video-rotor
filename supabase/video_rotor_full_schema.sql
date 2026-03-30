-- ============================================================
-- Video Rotor — Full Schema
-- Project ref: zmwuwdnpwtjqiqzlvvqo
-- Generated: 2026-03-26
-- Paste this entire file into the Supabase SQL Editor and run.
-- ============================================================


-- ─────────────────────────────────────────────────────────────
-- 1. PROFILES
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT        NOT NULL,
  full_name   TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);


-- ─────────────────────────────────────────────────────────────
-- 2. MEDIA
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.media (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name           TEXT        NOT NULL,
  type           TEXT        NOT NULL CHECK (type IN ('video', 'image')),
  original_url   TEXT        NOT NULL,
  vertical_url   TEXT,
  thumbnail_url  TEXT,
  duration       INTEGER,
  width          INTEGER,
  height         INTEGER,
  file_size      BIGINT,
  status         TEXT        NOT NULL DEFAULT 'uploading'
                             CHECK (status IN ('uploading', 'processing', 'ready', 'error')),
  metadata       JSONB       DEFAULT '{}',
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_media_user_id     ON public.media(user_id);
CREATE INDEX IF NOT EXISTS idx_media_user_status ON public.media(user_id, status);

ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "media_select_own" ON public.media FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "media_insert_own" ON public.media FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "media_update_own" ON public.media FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "media_delete_own" ON public.media FOR DELETE USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────
-- 3. PLAYLISTS
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.playlists (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  description TEXT,
  is_active   BOOLEAN     DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_playlists_user_id ON public.playlists(user_id);

ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "playlists_select_own" ON public.playlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "playlists_insert_own" ON public.playlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "playlists_update_own" ON public.playlists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "playlists_delete_own" ON public.playlists FOR DELETE USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────
-- 4. PLAYLIST ITEMS
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.playlist_items (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id       UUID        NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  media_id          UUID        NOT NULL REFERENCES public.media(id)    ON DELETE CASCADE,
  position          INTEGER     NOT NULL DEFAULT 0,
  duration_override INTEGER,
  created_at        TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT playlist_items_playlist_position_unique UNIQUE (playlist_id, position)
);

CREATE INDEX IF NOT EXISTS idx_playlist_items_playlist_id ON public.playlist_items(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_items_media_id    ON public.playlist_items(media_id);

ALTER TABLE public.playlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "playlist_items_select_own"
  ON public.playlist_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.playlists
    WHERE playlists.id = playlist_items.playlist_id
      AND playlists.user_id = auth.uid()
  ));

CREATE POLICY "playlist_items_insert_own"
  ON public.playlist_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.playlists
    WHERE playlists.id = playlist_items.playlist_id
      AND playlists.user_id = auth.uid()
  ));

CREATE POLICY "playlist_items_update_own"
  ON public.playlist_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.playlists
    WHERE playlists.id = playlist_items.playlist_id
      AND playlists.user_id = auth.uid()
  ));

CREATE POLICY "playlist_items_delete_own"
  ON public.playlist_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.playlists
    WHERE playlists.id = playlist_items.playlist_id
      AND playlists.user_id = auth.uid()
  ));


-- ─────────────────────────────────────────────────────────────
-- 5. DEVICES
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.devices (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES public.profiles(id)  ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  location    TEXT,
  device_key  TEXT        UNIQUE NOT NULL,
  status      TEXT        NOT NULL DEFAULT 'offline'
                          CHECK (status IN ('online', 'offline', 'error')),
  last_ping   TIMESTAMPTZ,
  playlist_id UUID        REFERENCES public.playlists(id) ON DELETE SET NULL,
  config      JSONB       DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_devices_user_id    ON public.devices(user_id);
CREATE INDEX IF NOT EXISTS idx_devices_device_key ON public.devices(device_key);

ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "devices_select_own" ON public.devices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "devices_insert_own" ON public.devices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "devices_update_own" ON public.devices FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "devices_delete_own" ON public.devices FOR DELETE USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────
-- 6. TRIGGERS
-- ─────────────────────────────────────────────────────────────

-- Auto-create profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Generic updated_at updater
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at  ON public.profiles;
DROP TRIGGER IF EXISTS set_media_updated_at     ON public.media;
DROP TRIGGER IF EXISTS set_playlists_updated_at ON public.playlists;
DROP TRIGGER IF EXISTS set_devices_updated_at   ON public.devices;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_media_updated_at
  BEFORE UPDATE ON public.media
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_playlists_updated_at
  BEFORE UPDATE ON public.playlists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_devices_updated_at
  BEFORE UPDATE ON public.devices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


-- ─────────────────────────────────────────────────────────────
-- 7. STORAGE BUCKET & POLICIES
-- ─────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users can upload own media" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own media"   ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own media" ON storage.objects;
DROP POLICY IF EXISTS "Public can view media"      ON storage.objects;

CREATE POLICY "Users can upload own media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view own media"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own media"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Public can view media"
  ON storage.objects FOR SELECT TO anon
  USING (bucket_id = 'media');
