-- 026 GERİ ALMA
DROP TRIGGER IF EXISTS trigger_validate_channel_link ON product_channel_links;
DROP FUNCTION IF EXISTS validate_channel_link();
DROP TABLE IF EXISTS product_channel_links CASCADE;
DROP TRIGGER IF EXISTS trigger_set_external_product_scope ON external_products;
DROP FUNCTION IF EXISTS set_external_product_scope();
DROP TABLE IF EXISTS external_products CASCADE;
