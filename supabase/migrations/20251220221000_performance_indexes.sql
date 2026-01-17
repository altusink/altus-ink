-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings(key);
CREATE INDEX IF NOT EXISTS idx_integrations_service_id ON integrations(service_id);

-- Ensure we never accumulate garbage
-- Function to clean old logs
CREATE OR REPLACE FUNCTION clean_old_audit_logs() 
RETURNS trigger AS $$
BEGIN
  -- Keep only last 1000 logs
  DELETE FROM ai_audit_logs WHERE id NOT IN (
    SELECT id FROM ai_audit_logs ORDER BY created_at DESC LIMIT 1000
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger cleaning
DROP TRIGGER IF EXISTS trigger_clean_logs ON ai_audit_logs;
CREATE TRIGGER trigger_clean_logs
  AFTER INSERT ON ai_audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION clean_old_audit_logs();
