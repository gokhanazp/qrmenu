-- Fix: Add SECURITY DEFINER to subscription trigger function
-- This allows the trigger to bypass RLS policies

DROP TRIGGER IF EXISTS trigger_create_default_subscription ON restaurants;
DROP FUNCTION IF EXISTS create_default_subscription();

CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
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