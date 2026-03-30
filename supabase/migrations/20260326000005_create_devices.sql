-- Migration: create_devices
-- Raspberry Pi / display devices registered by users

CREATE TABLE IF NOT EXISTS public.devices (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES public.profiles(id)  ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  location    TEXT,
  device_key  TEXT        UNIQUE NOT NULL, -- used by Raspberry Pi to authenticate
  status      TEXT        NOT NULL DEFAULT 'offline'
                          CHECK (status IN ('online', 'offline', 'error')),
  last_ping   TIMESTAMPTZ,
  playlist_id UUID        REFERENCES public.playlists(id) ON DELETE SET NULL,
  config      JSONB       DEFAULT '{}', -- orientation, volume, etc.
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_devices_user_id    ON public.devices(user_id);
CREATE INDEX idx_devices_device_key ON public.devices(device_key);

-- Enable Row Level Security
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

-- Policy: full CRUD for own devices
CREATE POLICY "devices_select_own"
  ON public.devices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "devices_insert_own"
  ON public.devices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "devices_update_own"
  ON public.devices FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "devices_delete_own"
  ON public.devices FOR DELETE
  USING (auth.uid() = user_id);
