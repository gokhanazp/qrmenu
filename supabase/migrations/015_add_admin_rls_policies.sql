-- Admin permissions for restaurants
CREATE POLICY "admin_insert_restaurants" ON restaurants FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "admin_delete_restaurants" ON restaurants FOR DELETE TO authenticated USING (is_admin());

-- Admin permissions for categories
CREATE POLICY "admin_insert_categories" ON categories FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "admin_update_categories" ON categories FOR UPDATE TO authenticated USING (is_admin());
CREATE POLICY "admin_delete_categories" ON categories FOR DELETE TO authenticated USING (is_admin());

-- Admin permissions for products
CREATE POLICY "admin_insert_products" ON products FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "admin_update_products" ON products FOR UPDATE TO authenticated USING (is_admin());
CREATE POLICY "admin_delete_products" ON products FOR DELETE TO authenticated USING (is_admin());
