-- Create enum types
CREATE TYPE webhook_provider AS ENUM ('stripe', 'email', 'generic');
CREATE TYPE webhook_status AS ENUM ('pending', 'processing', 'processed', 'failed', 'retry');

-- Create webhook_events table
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id VARCHAR(255) NOT NULL,
  provider webhook_provider NOT NULL DEFAULT 'generic',
  event_type VARCHAR(255) NOT NULL,
  payload JSONB NOT NULL,
  status webhook_status NOT NULL DEFAULT 'pending',
  retry_count INTEGER NOT NULL DEFAULT 0,
  error_message VARCHAR(1000),
  headers JSONB,
  verified BOOLEAN NOT NULL DEFAULT false,
  processed_at TIMESTAMP,
  next_retry_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_webhook_events_external_id ON webhook_events(external_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_provider ON webhook_events(provider);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON webhook_events(status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_next_retry_at ON webhook_events(next_retry_at);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_webhook_events_updated_at
BEFORE UPDATE ON webhook_events
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create view for failed webhooks
CREATE OR REPLACE VIEW failed_webhooks AS
SELECT * FROM webhook_events
WHERE status = 'failed'
ORDER BY created_at DESC;

-- Create view for pending retries
CREATE OR REPLACE VIEW pending_retries AS
SELECT * FROM webhook_events
WHERE status = 'retry' AND next_retry_at <= NOW()
ORDER BY next_retry_at ASC;
