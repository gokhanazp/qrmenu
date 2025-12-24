-- RLS Policies for restaurants table

-- Public: Sadece aktif restoranları görebilir
CREATE POLICY "public_view_active_restaurants"
ON restaurants FOR SELECT
TO public
USING (is_active = true);

-- Owner: Kendi restoranını görebilir
CREATE POLICY "owner_view_own_restaurant"
ON restaurants FOR SELECT
TO authenticated
USING (owner_user_id = auth.uid());

-- Owner: Kendi restoranını güncelleyebilir
CREATE POLICY "owner_update_own_restaurant"
ON restaurants FOR UPDATE
TO authenticated
USING (owner_user_id = auth.uid())
WITH CHECK (owner_user_id = auth.uid());

-- Owner: Yeni restoran oluşturabilir
CREATE POLICY "authenticated_create_restaurant"
ON restaurants FOR INSERT
TO authenticated
WITH CHECK (owner_user_id = auth.uid());

-- Admin: Tüm restoranları görebilir
CREATE POLICY "admin_view_all_restaurants"
ON restaurants FOR SELECT
TO authenticated
USING (is_admin());

-- Admin: Tüm restoranları güncelleyebilir
CREATE POLICY "admin_update_all_restaurants"
ON restaurants FOR UPDATE
TO authenticated
USING (is_admin());

-- RLS Policies for categories table

-- Public: Aktif restoranın aktif kategorilerini görebilir
CREATE POLICY "public_view_active_categories"
ON categories FOR SELECT
TO public
USING (
  is_active = true 
  AND EXISTS (
    SELECT 1 FROM restaurants 
    WHERE id = categories.restaurant_id 
    AND is_active = true
  )
);

-- Owner: Kendi restoranının kategorilerini görebilir
CREATE POLICY "owner_view_own_categories"
ON categories FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM restaurants 
    WHERE id = categories.restaurant_id 
    AND owner_user_id = auth.uid()
  )
);

-- Owner: Kendi restoranına kategori ekleyebilir
CREATE POLICY "owner_insert_own_categories"
ON categories FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM restaurants 
    WHERE id = categories.restaurant_id 
    AND owner_user_id = auth.uid()
  )
);

-- Owner: Kendi restoranının kategorilerini güncelleyebilir
CREATE POLICY "owner_update_own_categories"
ON categories FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM restaurants 
    WHERE id = categories.restaurant_id 
    AND owner_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM restaurants 
    WHERE id = categories.restaurant_id 
    AND owner_user_id = auth.uid()
  )
);

-- Owner: Kendi restoranının kategorilerini silebilir
CREATE POLICY "owner_delete_own_categories"
ON categories FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM restaurants 
    WHERE id = categories.restaurant_id 
    AND owner_user_id = auth.uid()
  )
);

-- Admin: Tüm kategorileri görebilir
CREATE POLICY "admin_view_all_categories"
ON categories FOR SELECT
TO authenticated
USING (is_admin());

-- RLS Policies for products table

-- Public: Aktif restoranın aktif ürünlerini görebilir
CREATE POLICY "public_view_active_products"
ON products FOR SELECT
TO public
USING (
  is_active = true 
  AND EXISTS (
    SELECT 1 FROM restaurants 
    WHERE id = products.restaurant_id 
    AND is_active = true
  )
);

-- Owner: Kendi restoranının ürünlerini görebilir
CREATE POLICY "owner_view_own_products"
ON products FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM restaurants 
    WHERE id = products.restaurant_id 
    AND owner_user_id = auth.uid()
  )
);

-- Owner: Kendi restoranına ürün ekleyebilir
CREATE POLICY "owner_insert_own_products"
ON products FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM restaurants 
    WHERE id = products.restaurant_id 
    AND owner_user_id = auth.uid()
  )
);

-- Owner: Kendi restoranının ürünlerini güncelleyebilir
CREATE POLICY "owner_update_own_products"
ON products FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM restaurants 
    WHERE id = products.restaurant_id 
    AND owner_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM restaurants 
    WHERE id = products.restaurant_id 
    AND owner_user_id = auth.uid()
  )
);

-- Owner: Kendi restoranının ürünlerini silebilir
CREATE POLICY "owner_delete_own_products"
ON products FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM restaurants 
    WHERE id = products.restaurant_id 
    AND owner_user_id = auth.uid()
  )
);

-- Admin: Tüm ürünleri görebilir
CREATE POLICY "admin_view_all_products"
ON products FOR SELECT
TO authenticated
USING (is_admin());

-- RLS Policies for scan_events table

-- Owner: Kendi restoranının scan eventlerini görebilir
CREATE POLICY "owner_view_own_scan_events"
ON scan_events FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM restaurants 
    WHERE id = scan_events.restaurant_id 
    AND owner_user_id = auth.uid()
  )
);

-- Admin: Tüm scan eventleri görebilir
CREATE POLICY "admin_view_all_scan_events"
ON scan_events FOR SELECT
TO authenticated
USING (is_admin());

-- RLS Policies for subscriptions table

-- Owner: Kendi aboneliğini görebilir
CREATE POLICY "owner_view_own_subscription"
ON subscriptions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM restaurants 
    WHERE id = subscriptions.restaurant_id 
    AND owner_user_id = auth.uid()
  )
);

-- Admin: Tüm abonelikleri görebilir
CREATE POLICY "admin_view_all_subscriptions"
ON subscriptions FOR SELECT
TO authenticated
USING (is_admin());

-- Admin: Tüm abonelikleri güncelleyebilir
CREATE POLICY "admin_update_all_subscriptions"
ON subscriptions FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Admin: Yeni abonelik oluşturabilir
CREATE POLICY "admin_insert_subscriptions"
ON subscriptions FOR INSERT
TO authenticated
WITH CHECK (is_admin());

-- RLS Policies for payments table

-- Owner: Kendi ödemelerini görebilir
CREATE POLICY "owner_view_own_payments"
ON payments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM restaurants 
    WHERE id = payments.restaurant_id 
    AND owner_user_id = auth.uid()
  )
);

-- Admin: Tüm ödemeleri görebilir
CREATE POLICY "admin_view_all_payments"
ON payments FOR SELECT
TO authenticated
USING (is_admin());

-- Admin: Ödeme kaydı oluşturabilir
CREATE POLICY "admin_insert_payments"
ON payments FOR INSERT
TO authenticated
WITH CHECK (is_admin());

-- Admin: Ödemeleri güncelleyebilir
CREATE POLICY "admin_update_payments"
ON payments FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- RLS Policies for admin_users table

-- Sadece adminler admin listesini görebilir
CREATE POLICY "admin_view_admin_users"
ON admin_users FOR SELECT
TO authenticated
USING (is_admin());

-- Sadece adminler yeni admin ekleyebilir
CREATE POLICY "admin_insert_admin_users"
ON admin_users FOR INSERT
TO authenticated
WITH CHECK (is_admin());

-- Sadece adminler admin silebilir
CREATE POLICY "admin_delete_admin_users"
ON admin_users FOR DELETE
TO authenticated
USING (is_admin());