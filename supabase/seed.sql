-- seed.sql: Applies all Video Rotor migrations in order.
-- Run with: supabase db push  OR paste into Supabase SQL Editor.

\i migrations/20260326000001_create_profiles.sql
\i migrations/20260326000002_create_media.sql
\i migrations/20260326000003_create_playlists.sql
\i migrations/20260326000004_create_playlist_items.sql
\i migrations/20260326000005_create_devices.sql
\i migrations/20260326000006_create_triggers.sql
\i migrations/20260326000007_create_storage.sql
