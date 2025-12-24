-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Helper function for slug generation
CREATE OR REPLACE FUNCTION generate_unique_slug(base_name text)
RETURNS text AS $$
DECLARE
  slug_candidate text;
  counter integer := 0;
BEGIN
  -- Türkçe karakter dönüşümü ve temizleme
  slug_candidate := lower(base_name);
  
  -- Türkçe karakterleri değiştir
  slug_candidate := translate(slug_candidate, 'şğıöüçŞĞİÖÜÇ', 'sgiouc');
  
  -- Özel karakterleri temizle (sadece harf, rakam ve boşluk kalsın)
  slug_candidate := regexp_replace(slug_candidate, '[^a-z0-9\s-]', '', 'g');
  
  -- Birden fazla boşluğu tek tire ile değiştir
  slug_candidate := regexp_replace(slug_candidate, '\s+', '-', 'g');
  
  -- Birden fazla tireyi tek tire ile değiştir
  slug_candidate := regexp_replace(slug_candidate, '-+', '-', 'g');
  
  -- Baş ve sondaki tireleri temizle
  slug_candidate := trim(both '-' from slug_candidate);
  
  -- Boş slug kontrolü
  IF slug_candidate = '' THEN
    slug_candidate := 'restoran';
  END IF;
  
  -- Benzersizlik kontrolü ve sayaç ekleme
  WHILE EXISTS (SELECT 1 FROM restaurants WHERE slug = slug_candidate) LOOP
    counter := counter + 1;
    slug_candidate := regexp_replace(slug_candidate, '-\d+$', '') || '-' || counter;
  END LOOP;
  
  RETURN slug_candidate;
END;
$$ LANGUAGE plpgsql;

-- Helper function for admin check
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Table: restaurants
CREATE TABLE restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  logo_url text,
  hero_url text,
  slogan text,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Indexes for restaurants
CREATE INDEX idx_restaurants_owner ON restaurants(owner_user_id);
CREATE INDEX idx_restaurants_slug ON restaurants(slug);
CREATE INDEX idx_restaurants_active ON restaurants(is_active);

-- Enable RLS
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- Trigger for updated_at
CREATE TRIGGER set_restaurants_updated_at
  BEFORE UPDATE ON restaurants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Table: categories
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order integer DEFAULT 0 NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Indexes for categories
CREATE INDEX idx_categories_restaurant ON categories(restaurant_id);
CREATE INDEX idx_categories_sort ON categories(restaurant_id, sort_order);
CREATE INDEX idx_categories_active ON categories(restaurant_id, is_active);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Trigger for updated_at
CREATE TRIGGER set_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Table: products
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  image_url text,
  sort_order integer DEFAULT 0 NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Indexes for products
CREATE INDEX idx_products_restaurant ON products(restaurant_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_sort ON products(restaurant_id, sort_order);
CREATE INDEX idx_products_active ON products(restaurant_id, is_active);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Trigger for updated_at
CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Table: admin_users
CREATE TABLE admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Index for admin_users
CREATE INDEX idx_admin_users_user ON admin_users(user_id);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Table: scan_events
CREATE TABLE scan_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  scanned_at timestamptz DEFAULT now() NOT NULL,
  user_agent text,
  referrer text,
  ip_hash text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Indexes for scan_events
CREATE INDEX idx_scan_events_restaurant ON scan_events(restaurant_id);
CREATE INDEX idx_scan_events_date ON scan_events(restaurant_id, scanned_at DESC);
CREATE INDEX idx_scan_events_scanned_at ON scan_events(scanned_at DESC);

-- Enable RLS
ALTER TABLE scan_events ENABLE ROW LEVEL SECURITY;

-- Table: subscriptions
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid UNIQUE NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'past_due', 'canceled', 'trialing')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Indexes for subscriptions
CREATE INDEX idx_subscriptions_restaurant ON subscriptions(restaurant_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_plan ON subscriptions(plan);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Trigger for updated_at
CREATE TRIGGER set_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Table: payments
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL CHECK (amount >= 0),
  currency text DEFAULT 'TRY' NOT NULL,
  status text NOT NULL CHECK (status IN ('paid', 'failed', 'refunded', 'pending')),
  provider text DEFAULT 'manual' NOT NULL,
  provider_payment_id text,
  paid_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Indexes for payments
CREATE INDEX idx_payments_restaurant ON payments(restaurant_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_date ON payments(created_at DESC);
CREATE INDEX idx_payments_paid_at ON payments(paid_at DESC);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;