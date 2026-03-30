-- Migration: create_storage
-- Creates the 'media' storage bucket and access policies

-- ─── Bucket ───────────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- ─── Storage Policies ────────────────────────────────────────────────────────
-- Drop before recreating to keep migration idempotent

DROP POLICY IF EXISTS "Users can upload own media"  ON storage.objects;
DROP POLICY IF EXISTS "Users can view own media"    ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own media"  ON storage.objects;
DROP POLICY IF EXISTS "Public can view media"       ON storage.objects;

-- Authenticated users can upload into their own folder (user_id/)
CREATE POLICY "Users can upload own media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users can read their own files
CREATE POLICY "Users can view own media"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users can delete their own files
CREATE POLICY "Users can delete own media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Public (anonymous) can read any file in the bucket (CDN access)
CREATE POLICY "Public can view media"
  ON storage.objects FOR SELECT
  TO anon
  USING (bucket_id = 'media');
