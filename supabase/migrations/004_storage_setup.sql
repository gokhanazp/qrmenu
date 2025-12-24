-- Create storage bucket for restaurant images
INSERT INTO storage.buckets (id, name, public)
VALUES ('restaurant-images', 'restaurant-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies

-- Public: Tüm dosyaları okuyabilir
CREATE POLICY "public_view_restaurant_images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'restaurant-images');

-- Owner: Kendi restoranının klasörüne upload yapabilir
CREATE POLICY "owner_upload_own_images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'restaurant-images' 
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM restaurants WHERE owner_user_id = auth.uid()
  )
);

-- Owner: Kendi restoranının dosyalarını güncelleyebilir
CREATE POLICY "owner_update_own_images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'restaurant-images' 
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM restaurants WHERE owner_user_id = auth.uid()
  )
);

-- Owner: Kendi restoranının dosyalarını silebilir
CREATE POLICY "owner_delete_own_images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'restaurant-images' 
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM restaurants WHERE owner_user_id = auth.uid()
  )
);

-- Admin: Tüm dosyaları yönetebilir
CREATE POLICY "admin_manage_all_images"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'restaurant-images' 
  AND is_admin()
)
WITH CHECK (
  bucket_id = 'restaurant-images' 
  AND is_admin()
);