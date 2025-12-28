-- Drop existing storage policies
DROP POLICY IF EXISTS "owner_upload_own_images" ON storage.objects;
DROP POLICY IF EXISTS "owner_update_own_images" ON storage.objects;
DROP POLICY IF EXISTS "owner_delete_own_images" ON storage.objects;

-- Owner: Kendi restoranının klasörüne upload yapabilir
CREATE POLICY "owner_upload_own_images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'restaurant-images' 
  AND (
    -- Dosya yolu restaurant ID ile başlıyorsa kontrol et
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM restaurants WHERE owner_user_id = auth.uid()
    )
    OR
    -- Veya kullanıcının en az bir restoranı varsa izin ver (klasör yapısı esnek)
    EXISTS (
      SELECT 1 FROM restaurants WHERE owner_user_id = auth.uid()
    )
  )
);

-- Owner: Kendi restoranının dosyalarını güncelleyebilir
CREATE POLICY "owner_update_own_images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'restaurant-images' 
  AND (
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM restaurants WHERE owner_user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM restaurants WHERE owner_user_id = auth.uid()
    )
  )
);

-- Owner: Kendi restoranının dosyalarını silebilir
CREATE POLICY "owner_delete_own_images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'restaurant-images' 
  AND (
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM restaurants WHERE owner_user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM restaurants WHERE owner_user_id = auth.uid()
    )
  )
);