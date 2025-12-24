-- Create storage bucket for category images
INSERT INTO storage.buckets (id, name, public)
VALUES ('category-images', 'category-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Category Images Storage Policies

-- Public: Tüm dosyaları okuyabilir
CREATE POLICY "public_view_category_images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'category-images');

-- Owner: Kendi restoranının kategorilerine upload yapabilir
CREATE POLICY "owner_upload_category_images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'category-images' 
  AND (storage.foldername(name))[1] = 'categories'
);

-- Owner: Kendi restoranının kategori dosyalarını güncelleyebilir
CREATE POLICY "owner_update_category_images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'category-images' 
  AND (storage.foldername(name))[1] = 'categories'
);

-- Owner: Kendi restoranının kategori dosyalarını silebilir
CREATE POLICY "owner_delete_category_images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'category-images' 
  AND (storage.foldername(name))[1] = 'categories'
);

-- Admin: Tüm kategori dosyalarını yönetebilir
CREATE POLICY "admin_manage_category_images"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'category-images' 
  AND is_admin()
)
WITH CHECK (
  bucket_id = 'category-images' 
  AND is_admin()
);

-- Product Images Storage Policies

-- Public: Tüm dosyaları okuyabilir
CREATE POLICY "public_view_product_images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Owner: Kendi restoranının ürünlerine upload yapabilir
CREATE POLICY "owner_upload_product_images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images' 
  AND (storage.foldername(name))[1] = 'products'
);

-- Owner: Kendi restoranının ürün dosyalarını güncelleyebilir
CREATE POLICY "owner_update_product_images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images' 
  AND (storage.foldername(name))[1] = 'products'
);

-- Owner: Kendi restoranının ürün dosyalarını silebilir
CREATE POLICY "owner_delete_product_images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images' 
  AND (storage.foldername(name))[1] = 'products'
);

-- Admin: Tüm ürün dosyalarını yönetebilir
CREATE POLICY "admin_manage_product_images"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'product-images' 
  AND is_admin()
)
WITH CHECK (
  bucket_id = 'product-images' 
  AND is_admin()
);