-- 024 GERİ ALMA
DROP TABLE IF EXISTS integration_events CASCADE;
DROP TABLE IF EXISTS integration_jobs CASCADE;
DROP TRIGGER IF EXISTS trigger_set_integration_tenant ON integrations;
DROP FUNCTION IF EXISTS set_integration_tenant();
DROP TABLE IF EXISTS integrations CASCADE;
