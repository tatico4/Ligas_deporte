-- ============================================================
-- CANCHERO - Storage buckets y políticas RLS
-- ============================================================

-- ─── BUCKETS ─────────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'logos',
    'logos',
    true,
    2097152, -- 2 MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  ),
  (
    'avatars',
    'avatars',
    true,
    1048576, -- 1 MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  ),
  (
    'players',
    'players',
    true,
    1048576, -- 1 MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  )
ON CONFLICT (id) DO NOTHING;

-- ─── RLS POLICIES: logos ─────────────────────────────────────────────────────
-- Lectura pública (cualquiera puede ver los logos)
CREATE POLICY "logos_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'logos');

-- Solo usuarios autenticados pueden subir/actualizar logos
CREATE POLICY "logos_auth_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'logos'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "logos_auth_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'logos'
    AND auth.role() = 'authenticated'
  );

-- Solo el dueño del archivo puede eliminarlo
CREATE POLICY "logos_owner_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'logos'
    AND auth.uid() = owner
  );

-- ─── RLS POLICIES: avatars ────────────────────────────────────────────────────
-- Lectura pública
CREATE POLICY "avatars_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Solo el propio usuario puede subir/modificar su avatar
-- El path debe ser: users/<user_id>.jpg
CREATE POLICY "avatars_owner_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = 'users'
    AND split_part(storage.filename(name), '.', 1) = auth.uid()::text
  );

CREATE POLICY "avatars_owner_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid() = owner
  );

CREATE POLICY "avatars_owner_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid() = owner
  );

-- ─── RLS POLICIES: players ───────────────────────────────────────────────────
-- Lectura pública
CREATE POLICY "players_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'players');

-- Solo usuarios autenticados pueden subir fotos de jugadores
CREATE POLICY "players_auth_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'players'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "players_auth_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'players'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "players_owner_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'players'
    AND auth.uid() = owner
  );
