CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS email_subscribers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  email VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  subscription_type VARCHAR(30) NOT NULL DEFAULT 'weekly_brief'
    CHECK (subscription_type IN ('weekly_brief', 'alerts', 'all')),
  is_active BOOLEAN DEFAULT true,
  unsubscribe_token VARCHAR(64) UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_log (
  id SERIAL PRIMARY KEY,
  subscriber_id INTEGER REFERENCES email_subscribers(id),
  email_type VARCHAR(50) NOT NULL,
  subject VARCHAR(255),
  status VARCHAR(20) DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'failed', 'bounced')),
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscribers_active ON email_subscribers(is_active, subscription_type);
CREATE INDEX idx_subscribers_email ON email_subscribers(email);
CREATE INDEX idx_email_log_status ON email_log(status, created_at DESC);

-- Seed: add the admin user as a subscriber
INSERT INTO email_subscribers (email, name, subscription_type)
VALUES ('admin@bbi.dev', 'Admin', 'all')
ON CONFLICT DO NOTHING;
