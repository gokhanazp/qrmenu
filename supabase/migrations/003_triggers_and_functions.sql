-- Trigger: Auto-create subscription on restaurant insert
CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO subscriptions (restaurant_id, plan, status)
  VALUES (NEW.id, 'free', 'active');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_default_subscription
  AFTER INSERT ON restaurants
  FOR EACH ROW
  EXECUTE FUNCTION create_default_subscription();

-- Trigger: Validate category restaurant match
CREATE OR REPLACE FUNCTION validate_category_restaurant()
RETURNS TRIGGER AS $$
BEGIN
  -- Kategori silinirken veya güncellenirken restaurant_id değişmemeli
  IF TG_OP = 'UPDATE' AND OLD.restaurant_id != NEW.restaurant_id THEN
    RAISE EXCEPTION 'Cannot change restaurant_id of existing category';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_category_restaurant
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION validate_category_restaurant();

-- Trigger: Validate product restaurant match
CREATE OR REPLACE FUNCTION validate_product_restaurant()
RETURNS TRIGGER AS $$
BEGIN
  -- Ürün güncellenirken restaurant_id değişmemeli
  IF TG_OP = 'UPDATE' AND OLD.restaurant_id != NEW.restaurant_id THEN
    RAISE EXCEPTION 'Cannot change restaurant_id of existing product';
  END IF;
  
  -- Eğer category_id varsa, aynı restorana ait olmalı
  IF NEW.category_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM categories 
      WHERE id = NEW.category_id 
      AND restaurant_id = NEW.restaurant_id
    ) THEN
      RAISE EXCEPTION 'Category must belong to the same restaurant';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_product_restaurant
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION validate_product_restaurant();

-- Function: Get scan metrics
CREATE OR REPLACE FUNCTION get_scan_metrics(
  rest_id uuid, 
  days integer DEFAULT 30
)
RETURNS TABLE (
  date date,
  scan_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(scanned_at AT TIME ZONE 'Europe/Istanbul') as date,
    COUNT(*) as scan_count
  FROM scan_events
  WHERE restaurant_id = rest_id
    AND scanned_at >= NOW() - (days || ' days')::interval
  GROUP BY DATE(scanned_at AT TIME ZONE 'Europe/Istanbul')
  ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get restaurant scan stats
CREATE OR REPLACE FUNCTION get_restaurant_scan_stats(rest_id uuid)
RETURNS TABLE (
  scans_today bigint,
  scans_7d bigint,
  scans_30d bigint,
  scans_total bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) FILTER (
      WHERE DATE(scanned_at AT TIME ZONE 'Europe/Istanbul') = CURRENT_DATE
    ) as scans_today,
    COUNT(*) FILTER (
      WHERE scanned_at >= NOW() - INTERVAL '7 days'
    ) as scans_7d,
    COUNT(*) FILTER (
      WHERE scanned_at >= NOW() - INTERVAL '30 days'
    ) as scans_30d,
    COUNT(*) as scans_total
  FROM scan_events
  WHERE restaurant_id = rest_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;